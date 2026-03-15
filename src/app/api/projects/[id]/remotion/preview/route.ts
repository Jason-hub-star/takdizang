import { prisma } from "@/lib/prisma";
import { ensureWorkspaceScope } from "@/lib/workspace-guard";
import { jsonOk, jsonError, jsonNotFound } from "@/lib/api-response";
import { resolveShortformInputProps } from "@/lib/project-media";
import type { CompositionId } from "@/types";

const TEMPLATE_TO_COMPOSITION: Record<string, CompositionId> = {
  "9:16": "TakdiVideo-916",
  "1:1": "TakdiVideo-1x1",
  "16:9": "TakdiVideo-169",
};

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));

    const project = await prisma.project.findUnique({
      where: { id },
      select: {
        workspaceId: true,
        name: true,
        content: true,
        id: true,
      },
    });
    if (!project) return jsonNotFound("Project");

    try {
      ensureWorkspaceScope(project.workspaceId);
    } catch {
      return jsonError("Forbidden: workspace scope violation", 403);
    }

    const { templateKey } = body;
    if (!templateKey || !TEMPLATE_TO_COMPOSITION[templateKey]) {
      return jsonError("templateKey is required. Allowed: '9:16', '1:1', '16:9'", 400);
    }

    const compositionId = TEMPLATE_TO_COMPOSITION[templateKey];

    const inputProps = await resolveShortformInputProps(
      project.id,
      project.name,
      project.content,
      templateKey,
    );

    return jsonOk({
      compositionId,
      templateKey,
      inputProps,
      previewReady: true,
    });
  } catch (error) {
    console.error("POST /api/projects/[id]/remotion/preview error:", error);
    return jsonError("Internal server error", 500);
  }
}
