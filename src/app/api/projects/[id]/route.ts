import { prisma } from "@/lib/prisma";
import { ensureWorkspaceScope } from "@/lib/workspace-guard";
import { jsonError, jsonNotFound, jsonOk } from "@/lib/api-response";
import { removeProjectStoragePrefix } from "@/lib/supabase/storage";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const project = await prisma.project.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        mode: true,
        status: true,
        workspaceId: true,
        content: true,
        briefText: true,
        createdAt: true,
        updatedAt: true,
        assets: {
          select: { id: true, filePath: true, sourceType: true, createdAt: true },
        },
        jobs: {
          select: { id: true, status: true, provider: true, createdAt: true },
          take: 10,
          orderBy: { createdAt: "desc" },
        },
        exports: {
          select: { id: true, type: true, filePath: true, createdAt: true },
          take: 10,
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!project) {
      return jsonNotFound("Project");
    }

    try {
      await ensureWorkspaceScope(project.workspaceId);
    } catch {
      return jsonError("Forbidden: workspace scope violation", 403);
    }

    return jsonOk(project);
  } catch (error) {
    console.error("GET /api/projects/[id] error:", error);
    return jsonError("Internal server error", 500);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const project = await prisma.project.findUnique({
      where: { id },
      select: {
        id: true,
        workspaceId: true,
      },
    });

    if (!project) {
      return jsonNotFound("Project");
    }

    try {
      await ensureWorkspaceScope(project.workspaceId);
    } catch {
      return jsonError("Forbidden: workspace scope violation", 403);
    }

    await prisma.$transaction(async (tx) => {
      await tx.composeTemplate.updateMany({
        where: {
          workspaceId: project.workspaceId,
          sourceProjectId: id,
        },
        data: {
          sourceProjectId: null,
        },
      });

      await tx.exportArtifact.deleteMany({
        where: { projectId: id },
      });

      await tx.generationJob.deleteMany({
        where: { projectId: id },
      });

      await tx.asset.deleteMany({
        where: { projectId: id },
      });

      await tx.project.delete({
        where: { id },
      });
    });

    try {
      await removeProjectStoragePrefix(id);
    } catch (error) {
      console.error("DELETE /api/projects/[id] file cleanup error:", error);
    }

    return jsonOk({ ok: true });
  } catch (error) {
    console.error("DELETE /api/projects/[id] error:", error);
    return jsonError("Internal server error", 500);
  }
}
