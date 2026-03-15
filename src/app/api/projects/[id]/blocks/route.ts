/** 블록 에디터 CRUD — GET/PUT BlockDocument */
import { prisma } from "@/lib/prisma";
import { ensureWorkspaceScope } from "@/lib/workspace-guard";
import { jsonOk, jsonError, jsonNotFound } from "@/lib/api-response";
import type { BlockDocument } from "@/types/blocks";

const DEFAULT_BLOCK_DOC: BlockDocument = {
  format: "blocks",
  blocks: [],
  platform: { width: 780, name: "coupang" },
  version: 1,
};

/**
 * GET /api/projects/:id/blocks
 * Returns the BlockDocument from project.content (format:"blocks").
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const project = await prisma.project.findUnique({
      where: { id },
      select: {
        workspaceId: true,
        content: true,
      },
    });
    if (!project) return jsonNotFound("Project");

    try {
      ensureWorkspaceScope(project.workspaceId);
    } catch {
      return jsonError("Forbidden: workspace scope violation", 403);
    }

    if (!project.content) {
      return jsonOk(DEFAULT_BLOCK_DOC);
    }

    try {
      const parsed = JSON.parse(project.content);
      if (parsed.format === "blocks") {
        return jsonOk(parsed as BlockDocument);
      }
    } catch {
      // not valid JSON
    }

    return jsonOk(DEFAULT_BLOCK_DOC);
  } catch (error) {
    console.error("GET /api/projects/[id]/blocks error:", error);
    return jsonError("Internal server error", 500);
  }
}

/**
 * PUT /api/projects/:id/blocks
 * Saves BlockDocument into project.content.
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body: BlockDocument = await request.json();

    if (body.format !== "blocks") {
      return jsonError("Invalid format: expected 'blocks'", 400);
    }

    const project = await prisma.project.findUnique({
      where: { id },
      select: {
        workspaceId: true,
      },
    });
    if (!project) return jsonNotFound("Project");

    try {
      ensureWorkspaceScope(project.workspaceId);
    } catch {
      return jsonError("Forbidden: workspace scope violation", 403);
    }

    await prisma.project.update({
      where: { id },
      data: { content: JSON.stringify(body) },
    });

    return jsonOk({ ok: true });
  } catch (error) {
    console.error("PUT /api/projects/[id]/blocks error:", error);
    return jsonError("Internal server error", 500);
  }
}
