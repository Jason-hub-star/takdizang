import { prisma } from "@/lib/prisma";
import { getWorkspaceId, ensureWorkspaceScope } from "@/lib/workspace-guard";
import { jsonError, jsonNotFound, jsonOk } from "@/lib/api-response";
import { resolveProjectSections } from "@/lib/project-media";
import { saveTextArtifactFile } from "@/lib/save-artifact-file";
import {
  formatMarketingScriptText,
  generateMarketingScriptWithGemini,
} from "@/services/marketing-script-generator";

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
      return jsonError("마케팅 스크립트는 숏폼 영상 프로젝트에서만 생성할 수 있습니다.", 409);
    }

    if (project.status !== "generated" && project.status !== "exported") {
      return jsonError("프로젝트 생성이 완료된 뒤에만 스크립트를 만들 수 있습니다.", 409);
    }

    const job = await prisma.$transaction(async (tx) => {
      const created = await tx.generationJob.create({
        data: {
          projectId: id,
          status: "queued",
          provider: "gemini-marketing-script",
          input: JSON.stringify({ templateKey: body.templateKey ?? "9:16" }),
        },
      });

      await tx.usageLedger.create({
        data: {
          workspaceId,
          eventType: "generation_start",
          detail: JSON.stringify({ projectId: id, jobId: created.id, type: "marketing-script" }),
        },
      });

      return created;
    });

    processMarketingScript(job.id, {
      projectId: id,
      projectName: project.name,
      briefText: project.briefText ?? "",
      projectContent: project.content,
      templateKey: body.templateKey ?? "9:16",
    }).catch((error) => {
      console.error("Background marketing-script error:", error);
    });

    return jsonOk({ jobId: job.id, status: "queued" }, 202);
  } catch (error) {
    console.error("POST /api/projects/[id]/marketing-script error:", error);
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
        const output = JSON.parse(job.output) as { artifactId?: string; script?: unknown };
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
    console.error("GET /api/projects/[id]/marketing-script error:", error);
    return jsonError("Internal server error", 500);
  }
}

async function processMarketingScript(
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

    const resolved = await resolveProjectSections(options.projectId, options.projectContent);
    if (resolved.sections.length === 0) {
      throw new Error("영상 섹션을 찾지 못했습니다.");
    }

    const script = await generateMarketingScriptWithGemini({
      projectName: options.projectName,
      briefText: options.briefText,
      sections: resolved.sections,
      templateKey: options.templateKey,
    });

    const filePath = await saveTextArtifactFile(
      options.projectId,
      `${options.projectName}-marketing-script`,
      formatMarketingScriptText(script),
    );

    const artifact = await prisma.exportArtifact.create({
      data: {
        projectId: options.projectId,
        type: "marketing-script",
        filePath,
        metadata: JSON.stringify({ script }),
      },
    });

    await prisma.generationJob.update({
      where: { id: jobId },
      data: {
        status: "done",
        output: JSON.stringify({ artifactId: artifact.id, script }),
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
