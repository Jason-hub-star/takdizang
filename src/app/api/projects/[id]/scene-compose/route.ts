/** POST/GET /api/projects/:id/scene-compose — AI 배경 합성 (이미지 URL + 장면 프롬프트) */

import { prisma } from "@/lib/prisma";
import { getWorkspaceId, ensureWorkspaceScope } from "@/lib/workspace-guard";
import { jsonOk, jsonError, jsonNotFound } from "@/lib/api-response";
import { getProvider, getProviderLabel } from "@/services/providers/registry";
import { downloadImageAsBase64 } from "@/services/kie-generator";
import { saveGeneratedImage } from "@/lib/save-generated-image";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const imageUrl: string | undefined = body.imageUrl;
  const scenePrompt: string | undefined = body.scenePrompt;
  const aspectRatio: string = body.aspectRatio ?? "1:1";

  if (!imageUrl) return jsonError("Missing imageUrl", 400);
  if (!scenePrompt) return jsonError("Missing scenePrompt", 400);

  try {
    const workspaceId = getWorkspaceId();

    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) return jsonNotFound("Project");

    try {
      ensureWorkspaceScope(project.workspaceId);
    } catch {
      return jsonError("Forbidden: workspace scope violation", 403);
    }

    const job = await prisma.$transaction(async (tx) => {
      const newJob = await tx.generationJob.create({
        data: {
          projectId: id,
          status: "queued",
          provider: `${getProviderLabel()}-scene-compose`,
          input: JSON.stringify({ imageUrl, scenePrompt, aspectRatio }),
        },
      });

      await tx.usageLedger.create({
        data: {
          workspaceId,
          eventType: "scene_compose_start",
          detail: JSON.stringify({ projectId: id, jobId: newJob.id }),
        },
      });

      return newJob;
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const fullImageUrl = imageUrl.startsWith("http")
      ? imageUrl
      : `${baseUrl}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;

    processSceneCompose(job.id, id, scenePrompt, fullImageUrl, aspectRatio).catch((err) => {
      console.error("Background scene-compose error:", err);
    });

    return jsonOk({ jobId: job.id, status: "queued" }, 202);
  } catch (error) {
    console.error("POST /api/projects/[id]/scene-compose error:", error);
    return jsonError("Internal server error", 500);
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get("jobId");

  if (!jobId) return jsonError("Missing jobId query parameter", 400);

  try {
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) return jsonNotFound("Project");

    try {
      ensureWorkspaceScope(project.workspaceId);
    } catch {
      return jsonError("Forbidden: workspace scope violation", 403);
    }

    const job = await prisma.generationJob.findUnique({ where: { id: jobId } });
    if (!job || job.projectId !== id) return jsonNotFound("GenerationJob");

    let assets: unknown[] = [];
    if (job.status === "done" && job.output) {
      try {
        const output = JSON.parse(job.output);
        const assetIds = (output.assets ?? []).map((a: { assetId: string }) => a.assetId);
        assets = await prisma.asset.findMany({
          where: { id: { in: assetIds } },
          select: { id: true, filePath: true, mimeType: true, sourceType: true },
        });
      } catch { /* best-effort */ }
    }

    return jsonOk({
      job: {
        id: job.id,
        status: job.status,
        provider: job.provider,
        error: job.error,
        startedAt: job.startedAt,
        doneAt: job.doneAt,
      },
      ...(job.status === "done" ? { assets } : {}),
    });
  } catch (error) {
    console.error("GET /api/projects/[id]/scene-compose error:", error);
    return jsonError("Internal server error", 500);
  }
}

async function processSceneCompose(
  jobId: string,
  projectId: string,
  scenePrompt: string,
  imageUrl: string,
  aspectRatio: string,
) {
  try {
    await prisma.generationJob.update({
      where: { id: jobId },
      data: { status: "running", startedAt: new Date() },
    });

    const provider = getProvider();
    const result = await provider.textToImage({
      prompt: scenePrompt,
      aspectRatio,
      imageInput: [imageUrl],
    });

    const img = await downloadImageAsBase64(result.imageUrls[0]);
    const saved = await saveGeneratedImage(projectId, img.imageBytes, img.mimeType, "composed");

    await prisma.generationJob.update({
      where: { id: jobId },
      data: {
        status: "done",
        output: JSON.stringify({ assets: [saved] }),
        doneAt: new Date(),
      },
    });
  } catch (error) {
    await prisma.generationJob.update({
      where: { id: jobId },
      data: { status: "failed", error: String(error), doneAt: new Date() },
    });
  }
}
