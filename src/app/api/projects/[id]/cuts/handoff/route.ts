import { prisma } from "@/lib/prisma";
import { ensureWorkspaceScope } from "@/lib/workspace-guard";
import { jsonOk, jsonError, jsonNotFound } from "@/lib/api-response";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));

    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) return jsonNotFound("Project");

    try {
      ensureWorkspaceScope(project.workspaceId);
    } catch {
      return jsonError("Forbidden: workspace scope violation", 403);
    }

    // Gate: project must be generated or exported
    if (project.status !== "generated" && project.status !== "exported") {
      return jsonError("Project must be in 'generated' or 'exported' status for cut handoff", 409);
    }

    const { selectedImageId, preserveOriginal } = body;
    if (!selectedImageId) {
      return jsonError("selectedImageId is required", 400);
    }

    // Verify asset exists and belongs to this project
    const asset = await prisma.asset.findFirst({
      where: { id: selectedImageId, projectId: id },
    });
    if (!asset) return jsonNotFound("Asset");

    // Update preserveOriginal flag if requested
    let selectedAsset = asset;
    if (preserveOriginal === true) {
      selectedAsset = await prisma.asset.update({
        where: { id: selectedImageId },
        data: { preserveOriginal: true },
      });
    }

    return jsonOk({ project, selectedAsset });
  } catch (error) {
    console.error("POST /api/projects/[id]/cuts/handoff error:", error);
    return jsonError("Internal server error", 500);
  }
}
