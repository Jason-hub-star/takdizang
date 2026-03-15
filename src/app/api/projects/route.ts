import { prisma } from "@/lib/prisma";
import { getWorkspaceId } from "@/lib/workspace-guard";
import { jsonOk, jsonError } from "@/lib/api-response";
import { isProjectMode } from "@/lib/project-contract";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const workspaceId = getWorkspaceId();

    const name = body.name || `Project-${Date.now()}`;
    if (body.mode !== undefined && !isProjectMode(body.mode)) {
      return jsonError("Invalid project mode", 400);
    }

    const project = await prisma.project.create({
      data: {
        workspaceId,
        name,
        briefText: body.briefText ?? null,
        mode: body.mode ?? null,
        templateKey: body.templateKey ?? null,
      },
    });

    return jsonOk(project, 201);
  } catch (error) {
    console.error("POST /api/projects error:", error);
    return jsonError("Internal server error", 500);
  }
}
