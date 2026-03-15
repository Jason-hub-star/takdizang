import { prisma } from "@/lib/prisma";
import { ensureWorkspaceScope } from "@/lib/workspace-guard";
import { jsonOk, jsonError, jsonNotFound } from "@/lib/api-response";
import { isProjectMode } from "@/lib/project-contract";

export async function PATCH(
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

    const updateData: Record<string, unknown> = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.content !== undefined) updateData.content = body.content;
    if (body.briefText !== undefined) updateData.briefText = body.briefText;
    if (body.mode !== undefined) {
      if (!isProjectMode(body.mode)) {
        return jsonError("Invalid project mode", 400);
      }
      updateData.mode = body.mode;
    }
    if (body.templateKey !== undefined) updateData.templateKey = body.templateKey;

    if (Object.keys(updateData).length === 0) {
      return jsonError("No valid fields to update", 400);
    }

    const updated = await prisma.project.update({
      where: { id },
      data: updateData,
    });

    return jsonOk(updated);
  } catch (error) {
    console.error("PATCH /api/projects/[id]/content error:", error);
    return jsonError("Internal server error", 500);
  }
}
