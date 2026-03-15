import { prisma } from "@/lib/prisma";
import { getWorkspaceId, ensureWorkspaceScope } from "@/lib/workspace-guard";
import { jsonError, jsonNotFound, jsonOk } from "@/lib/api-response";
import { resolveProjectImagePaths, resolveProjectSections } from "@/lib/project-media";
import { saveGeneratedImage } from "@/lib/save-generated-image";
import { downloadImageAsBase64, generateImageWithKie } from "@/services/kie-generator";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  try {
    const workspaceId = getWorkspaceId();
    const project = await prisma.project.findUnique({
      where: { id },
      select: { id: true, workspaceId: true, mode: true, briefText: true, content: true, name: true, status: true },
    });

    if (!project) {
      return jsonNotFound("Project");
    }

    try {
      ensureWorkspaceScope(project.workspaceId);
    } catch {
      return jsonError("Forbidden: workspace scope violation", 403);
    }

    if (project.mode !== "shortform-video") {
      return jsonError("썸네일은 숏폼 영상 프로젝트에서만 생성할 수 있습니다.", 409);
    }

    if (project.status !== "generated" && project.status !== "exported") {
      return jsonError("프로젝트 생성이 완료된 뒤에만 썸네일을 만들 수 있습니다.", 409);
    }

    const job = await prisma.$transaction(async (tx) => {
      const created = await tx.generationJob.create({
        data: {
          projectId: id,
          status: "queued",
          provider: "kie-thumbnail",
          input: JSON.stringify({ templateKey: body.templateKey ?? "1:1" }),
        },
      });

      await tx.usageLedger.create({
        data: {
          workspaceId,
          eventType: "image_generation_start",
          detail: JSON.stringify({ projectId: id, jobId: created.id, type: "thumbnail" }),
        },
      });

      return created;
    });

    processThumbnail(job.id, {
      projectId: id,
      projectName: project.name,
      briefText: project.briefText ?? "",
      projectContent: project.content,
      templateKey: body.templateKey ?? "1:1",
    }).catch((error) => {
      console.error("Background thumbnail error:", error);
    });

    return jsonOk({ jobId: job.id, status: "queued" }, 202);
  } catch (error) {
    console.error("POST /api/projects/[id]/thumbnail error:", error);
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
    const project = await prisma.project.findUnique({
      where: { id },
      select: { workspaceId: true },
    });

    if (!project) {
      return jsonNotFound("Project");
    }

    try {
      ensureWorkspaceScope(project.workspaceId);
    } catch {
      return jsonError("Forbidden: workspace scope violation", 403);
    }

    const job = await prisma.generationJob.findUnique({
      where: { id: jobId },
      select: {
        id: true,
        projectId: true,
        status: true,
        provider: true,
        error: true,
        startedAt: true,
        doneAt: true,
        output: true,
      },
    });

    if (!job || job.projectId !== id) {
      return jsonNotFound("GenerationJob");
    }

    let artifact: {
      id: string;
      type: string;
      filePath: string;
      metadata: string | null;
      createdAt: Date;
    } | null = null;
    if (job.status === "done" && job.output) {
      try {
        const output = JSON.parse(job.output) as { artifactId?: string };
        if (output.artifactId) {
          artifact = await prisma.exportArtifact.findUnique({
            where: { id: output.artifactId },
            select: {
              id: true,
              type: true,
              filePath: true,
              metadata: true,
              createdAt: true,
            },
          });
        }
      } catch {
        // best effort
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
      ...(artifact ? { artifact } : {}),
    });
  } catch (error) {
    console.error("GET /api/projects/[id]/thumbnail error:", error);
    return jsonError("Internal server error", 500);
  }
}

async function processThumbnail(
  jobId: string,
  options: {
    projectId: string;
    projectName: string;
    briefText: string;
    projectContent: string | null;
    templateKey: string;
  },
) {
  try {
    await prisma.generationJob.update({
      where: { id: jobId },
      data: { status: "running", startedAt: new Date() },
    });

    const [resolved, imagePaths] = await Promise.all([
      resolveProjectSections(options.projectId, options.projectContent),
      resolveProjectImagePaths(options.projectId),
    ]);

    if (resolved.sections.length === 0) {
      throw new Error("영상 섹션을 찾지 못했습니다.");
    }

    if (imagePaths.length === 0) {
      throw new Error("썸네일에 사용할 대표 이미지를 찾지 못했습니다.");
    }

    const prompt = buildThumbnailPrompt({
      projectName: options.projectName,
      briefText: options.briefText,
      templateKey: options.templateKey,
      sections: resolved.sections,
    });

    const result = await generateImageWithKie(prompt, {
      aspectRatio: "1:1",
      imageInput: [toAbsoluteUrl(imagePaths[0])],
      resolution: "1K",
    });

    const image = await downloadImageAsBase64(result.imageUrls[0]);
    const saved = await saveGeneratedImage(options.projectId, image.imageBytes, image.mimeType, "thumbnail");

    const artifact = await prisma.exportArtifact.create({
      data: {
        projectId: options.projectId,
        type: "thumbnail",
        filePath: saved.filePath,
        metadata: JSON.stringify({ sourceAsset: imagePaths[0], templateKey: options.templateKey }),
      },
    });

    await prisma.generationJob.update({
      where: { id: jobId },
      data: {
        status: "done",
        output: JSON.stringify({ artifactId: artifact.id }),
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

function buildThumbnailPrompt(options: {
  projectName: string;
  briefText: string;
  templateKey: string;
  sections: Array<{ headline: string; body: string }>;
}) {
  const [hero, second, cta] = [
    options.sections[0],
    options.sections[1],
    options.sections[options.sections.length - 1],
  ];

  return [
    `${options.projectName} 숏폼 영상용 정사각형 썸네일 이미지`,
    "high-converting ecommerce social thumbnail, 1080x1080, clean product focus, korean market aesthetic",
    `main hook: ${hero?.headline ?? options.projectName}`,
    `supporting benefit: ${second?.headline ?? second?.body ?? ""}`,
    `cta mood: ${cta?.headline ?? ""}`,
    `brief context: ${options.briefText}`,
    "bold readable composition, editorial lighting, premium product marketing, no embedded text, no watermark",
    `target ratio reference: ${options.templateKey}`,
  ].join(", ");
}

function toAbsoluteUrl(filePath: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${baseUrl}${filePath.replace(/\\/g, "/")}`;
}
