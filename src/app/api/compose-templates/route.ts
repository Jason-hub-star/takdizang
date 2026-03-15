import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api-response";
import { createTemplatePreviewTitle, createTemplateSnapshot } from "@/lib/compose-templates";
import { getWorkspaceId } from "@/lib/workspace-guard";
import type { BlockDocument } from "@/types/blocks";

export async function GET() {
  try {
    const workspaceId = getWorkspaceId();

    const templates = await prisma.composeTemplate.findMany({
      where: { workspaceId },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        name: true,
        previewTitle: true,
        blockCount: true,
        sourceProjectId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return jsonOk({ templates });
  } catch (error) {
    console.error("GET /api/compose-templates error:", error);
    return jsonError("Internal server error", 500);
  }
}

export async function POST(request: Request) {
  try {
    const workspaceId = getWorkspaceId();
    const body = await request.json().catch(() => ({}));

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const snapshot = body.snapshot as BlockDocument | undefined;
    const sourceProjectId =
      typeof body.sourceProjectId === "string" && body.sourceProjectId.trim().length > 0
        ? body.sourceProjectId.trim()
        : null;

    if (!name) {
      return jsonError("Template name is required", 400);
    }

    if (!snapshot || snapshot.format !== "blocks") {
      return jsonError("Valid block snapshot is required", 400);
    }

    const normalizedSnapshot = createTemplateSnapshot(snapshot);

    const template = await prisma.composeTemplate.create({
      data: {
        workspaceId,
        name,
        snapshot: JSON.stringify(normalizedSnapshot),
        previewTitle: createTemplatePreviewTitle(normalizedSnapshot),
        blockCount: normalizedSnapshot.blocks.length,
        sourceProjectId,
      },
      select: {
        id: true,
        name: true,
        previewTitle: true,
        blockCount: true,
        sourceProjectId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return jsonOk({ template }, 201);
  } catch (error) {
    console.error("POST /api/compose-templates error:", error);
    return jsonError("Internal server error", 500);
  }
}
