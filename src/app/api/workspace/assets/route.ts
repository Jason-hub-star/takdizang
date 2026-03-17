/** GET /api/workspace/assets — 워크스페이스 전체 에셋 조회 (프로젝트별 그룹) */
import { prisma } from "@/lib/prisma";
import { getWorkspaceId } from "@/lib/workspace-guard";
import { jsonOk, jsonError } from "@/lib/api-response";
import { findPreviewPath, readImageSize } from "@/lib/asset-images";

export async function GET() {
  try {
    const workspaceId = await getWorkspaceId();

    const projects = await prisma.project.findMany({
      where: { workspaceId },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        name: true,
        mode: true,
        assets: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            filePath: true,
            mimeType: true,
            sourceType: true,
            preserveOriginal: true,
            createdAt: true,
          },
        },
      },
    });

    const groups = await Promise.all(
      projects
        .filter((p) => (p.assets as unknown[]).length > 0)
        .map(async (p) => {
          const assets = p.assets as Array<{
            id: string;
            filePath: string;
            mimeType: string | null;
            sourceType: string;
            preserveOriginal: boolean;
            createdAt: string | Date;
          }>;

          const enriched = await Promise.all(
            assets.map(async (asset) => {
              const previewPath = await findPreviewPath(asset.filePath);
              const { width, height } = asset.mimeType?.startsWith("image/")
                ? await readImageSize(asset.filePath)
                : { width: undefined, height: undefined };
              return { ...asset, previewPath, width, height };
            }),
          );

          return {
            projectId: p.id,
            projectName: p.name,
            projectMode: p.mode,
            assets: enriched,
          };
        }),
    );

    return jsonOk({ groups });
  } catch (error) {
    console.error("GET /api/workspace/assets error:", error);
    return jsonError("Internal server error", 500);
  }
}
