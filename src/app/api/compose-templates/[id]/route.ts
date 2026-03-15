import { prisma } from "@/lib/prisma";
import { jsonError, jsonNotFound, jsonOk } from "@/lib/api-response";
import { ensureWorkspaceScope } from "@/lib/workspace-guard";
import type { BlockDocument } from "@/types/blocks";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const template = await prisma.composeTemplate.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        previewTitle: true,
        blockCount: true,
        sourceProjectId: true,
        snapshot: true,
        workspaceId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!template) {
      return jsonNotFound("Compose template");
    }

    try {
      ensureWorkspaceScope(template.workspaceId);
    } catch {
      return jsonError("Forbidden: workspace scope violation", 403);
    }

    const snapshot = JSON.parse(template.snapshot) as BlockDocument;

    if (snapshot.format !== "blocks") {
      return jsonError("Stored template snapshot is invalid", 500);
    }

    return jsonOk({
      template: {
        id: template.id,
        name: template.name,
        previewTitle: template.previewTitle,
        blockCount: template.blockCount,
        sourceProjectId: template.sourceProjectId,
        createdAt: template.createdAt,
        updatedAt: template.updatedAt,
        snapshot,
      },
    });
  } catch (error) {
    console.error("GET /api/compose-templates/[id] error:", error);
    return jsonError("Internal server error", 500);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const template = await prisma.composeTemplate.findUnique({
      where: { id },
      select: { id: true, workspaceId: true },
    });

    if (!template) {
      return jsonNotFound("Compose template");
    }

    try {
      ensureWorkspaceScope(template.workspaceId);
    } catch {
      return jsonError("Forbidden: workspace scope violation", 403);
    }

    await prisma.composeTemplate.delete({
      where: { id },
    });

    return jsonOk({ ok: true });
  } catch (error) {
    console.error("DELETE /api/compose-templates/[id] error:", error);
    return jsonError("Internal server error", 500);
  }
}
