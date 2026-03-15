import { prisma } from "@/lib/prisma";
import { getWorkspaceId, ensureWorkspaceScope } from "@/lib/workspace-guard";
import { jsonOk, jsonError, jsonNotFound } from "@/lib/api-response";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const workspaceId = getWorkspaceId();

    const project = await prisma.project.findUnique({
      where: { id },
      select: { workspaceId: true, status: true, mode: true },
    });
    if (!project) return jsonNotFound("Project");

    try {
      ensureWorkspaceScope(project.workspaceId);
    } catch {
      return jsonError("Forbidden: workspace scope violation", 403);
    }

    if (project.status !== "generated" && project.status !== "exported") {
      return jsonError("Project must be in 'generated' or 'exported' status to export", 409);
    }

    const job = await prisma.$transaction(async (tx) => {
      const exportJob = await tx.generationJob.create({
        data: {
          projectId: id,
          status: "queued",
          provider: "export",
          input: JSON.stringify({ type: body.type ?? "result" }),
        },
      });

      await tx.usageLedger.create({
        data: {
          workspaceId,
          eventType: "export_start",
          detail: JSON.stringify({ projectId: id, jobId: exportJob.id }),
        },
      });

      return exportJob;
    });

    processExport(job.id, id, workspaceId).catch((error) => {
      console.error("Background export error:", error);
    });

    return jsonOk({ jobId: job.id, status: "queued" }, 202);
  } catch (error) {
    console.error("POST /api/projects/[id]/export error:", error);
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
    if (!project) return jsonNotFound("Project");

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

    let artifacts: Array<{
      id: string;
      projectId: string;
      type: string;
      filePath: string;
      metadata: string | null;
      createdAt: Date;
    }> = [];
    if (job.status === "done" && job.output) {
      try {
        const output = JSON.parse(job.output) as { artifactIds?: string[] };
        if (output.artifactIds?.length) {
          artifacts = await prisma.exportArtifact.findMany({
            where: { id: { in: output.artifactIds } },
            select: {
              id: true,
              projectId: true,
              type: true,
              filePath: true,
              metadata: true,
              createdAt: true,
            },
            orderBy: { createdAt: "desc" },
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
      artifacts,
    });
  } catch (error) {
    console.error("GET /api/projects/[id]/export error:", error);
    return jsonError("Internal server error", 500);
  }
}

async function processExport(jobId: string, projectId: string, workspaceId: string) {
  try {
    await prisma.generationJob.update({
      where: { id: jobId },
      data: { status: "running", startedAt: new Date() },
    });

    const artifacts = await prisma.exportArtifact.findMany({
      where: {
        projectId,
        type: { in: ["video", "gif", "thumbnail", "marketing-script"] },
      },
      select: { id: true },
    });

    if (artifacts.length === 0) {
      throw new Error("No rendered artifacts found. Run render first.");
    }

    await prisma.$transaction(async (tx) => {
      await tx.project.update({
        where: { id: projectId },
        data: { status: "exported" },
      });

      await tx.usageLedger.create({
        data: {
          workspaceId,
          eventType: "export_complete",
          detail: JSON.stringify({ projectId, artifactIds: artifacts.map((artifact) => artifact.id) }),
        },
      });

      await tx.generationJob.update({
        where: { id: jobId },
        data: {
          status: "done",
          output: JSON.stringify({ artifactIds: artifacts.map((artifact) => artifact.id) }),
          doneAt: new Date(),
        },
      });
    });
  } catch (error) {
    await prisma.generationJob.update({
      where: { id: jobId },
      data: { status: "failed", error: String(error), doneAt: new Date() },
    });
  }
}
