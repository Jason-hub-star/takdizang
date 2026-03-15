/** POST /api/projects/:id/remove-bg — 배경 제거 (비동기 202 + poll) */

import { prisma } from "@/lib/prisma";
import { getWorkspaceId, ensureWorkspaceScope } from "@/lib/workspace-guard";
import { jsonOk, jsonError, jsonNotFound } from "@/lib/api-response";
import { getProvider } from "@/services/providers/registry";
import { downloadImageAsBase64 } from "@/services/kie-generator";
import { saveGeneratedImage } from "@/lib/save-generated-image";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const assetId: string | undefined = body.assetId;

  if (!assetId) {
    return jsonError("Missing assetId", 400);
  }

  try {
    const workspaceId = getWorkspaceId();

    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) return jsonNotFound("Project");

    try {
      ensureWorkspaceScope(project.workspaceId);
    } catch {
      return jsonError("Forbidden: workspace scope violation", 403);
    }

    const sourceAsset = await prisma.asset.findUnique({ where: { id: assetId } });
    if (!sourceAsset || sourceAsset.projectId !== id) {
      return jsonError("Asset not found or not in this project", 404);
    }

    const providerName = getProvider().name;
    const job = await prisma.$transaction(async (tx) => {
      const newJob = await tx.generationJob.create({
        data: {
          projectId: id,
          status: "queued",
          provider: `${providerName}-remove-background`,
          input: JSON.stringify({ assetId }),
        },
      });

      await tx.usageLedger.create({
        data: {
          workspaceId,
          eventType: "remove_bg_start",
          detail: JSON.stringify({ projectId: id, jobId: newJob.id, assetId }),
        },
      });

      return newJob;
    });

    processRemoveBg(job.id, id, sourceAsset.filePath).catch((err) => {
      console.error("Background remove-bg error:", err);
    });

    return jsonOk({ jobId: job.id, status: "queued" }, 202);
  } catch (error) {
    console.error("POST /api/projects/[id]/remove-bg error:", error);
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

  if (!jobId) {
    return jsonError("Missing jobId query parameter", 400);
  }

  try {
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) return jsonNotFound("Project");

    try {
      ensureWorkspaceScope(project.workspaceId);
    } catch {
      return jsonError("Forbidden: workspace scope violation", 403);
    }

    const job = await prisma.generationJob.findUnique({ where: { id: jobId } });
    if (!job || job.projectId !== id) {
      return jsonNotFound("GenerationJob");
    }

    let assets: unknown[] = [];
    if (job.status === "done" && job.output) {
      try {
        const output = JSON.parse(job.output);
        const assetIds = (output.assets ?? []).map((a: { assetId: string }) => a.assetId);
        assets = await prisma.asset.findMany({
          where: { id: { in: assetIds } },
          select: { id: true, filePath: true, mimeType: true, sourceType: true },
        });
      } catch {
        // best-effort
      }
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
    console.error("GET /api/projects/[id]/remove-bg error:", error);
    return jsonError("Internal server error", 500);
  }
}

async function processRemoveBg(jobId: string, projectId: string, assetFilePath: string) {
  try {
    await prisma.generationJob.update({
      where: { id: jobId },
      data: { status: "running", startedAt: new Date() },
    });

    const provider = getProvider();

    // Build public URL for the uploaded asset
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const imageUrl = `${baseUrl}/${assetFilePath.replace(/\\/g, "/")}`;

    const result = await provider.removeBackground({ imageUrl });
    const img = await downloadImageAsBase64(result.imageUrls[0]);
    const saved = await saveGeneratedImage(projectId, img.imageBytes, "image/png", "removebg");

    await prisma.$transaction([
      prisma.project.update({
        where: { id: projectId },
        data: { status: "generated" },
      }),
      prisma.generationJob.update({
        where: { id: jobId },
        data: {
          status: "done",
          output: JSON.stringify({ assets: [saved] }),
          doneAt: new Date(),
        },
      }),
    ]);
  } catch (error) {
    await prisma.generationJob.update({
      where: { id: jobId },
      data: { status: "failed", error: String(error), doneAt: new Date() },
    });
  }
}
