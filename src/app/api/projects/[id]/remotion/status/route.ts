import { prisma } from "@/lib/prisma";
import { ensureWorkspaceScope } from "@/lib/workspace-guard";
import { jsonOk, jsonError, jsonNotFound } from "@/lib/api-response";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) return jsonNotFound("Project");

    try {
      ensureWorkspaceScope(project.workspaceId);
    } catch {
      return jsonError("Forbidden: workspace scope violation", 403);
    }

    // Find latest remotion render job for this project
    const latestJob = await prisma.generationJob.findFirst({
      where: { projectId: id, provider: "remotion" },
      orderBy: { createdAt: "desc" },
    });

    if (!latestJob) {
      return jsonOk({ jobId: null, status: "none", artifact: null });
    }

    const artifacts = latestJob.status === "done"
      ? await prisma.exportArtifact.findMany({
          where: { projectId: id, type: "video" },
          orderBy: { createdAt: "desc" },
          take: 10,
        })
      : [];

    return jsonOk({
      jobId: latestJob.id,
      status: latestJob.status,
      artifact: artifacts[0] ?? null,
      artifacts,
    });
  } catch (error) {
    console.error("GET /api/projects/[id]/remotion/status error:", error);
    return jsonError("Internal server error", 500);
  }
}
