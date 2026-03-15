import path from "path";
import { prisma } from "@/lib/prisma";
import { ensureWorkspaceScope } from "@/lib/workspace-guard";
import { jsonError, jsonNotFound, jsonOk } from "@/lib/api-response";
import { validateByoiImage } from "@/services/byoi-validator";
import {
  findPreviewPath,
  normalizeImageVariants,
  readImageSize,
  sanitizeUploadName,
  shouldNormalizeImage,
  toPublicUploadPath,
} from "@/lib/asset-images";
import { uploadPublicPathBuffer } from "@/lib/supabase/storage";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const project = await prisma.project.findUnique({
      where: { id },
      select: { workspaceId: true },
    });
    if (!project) {
      return jsonNotFound("Project");
    }

    try {
      ensureWorkspaceScope(project.workspaceId);
    } catch {
      return jsonError("Forbidden: workspace scope violation", 403);
    }

    const assets = await prisma.asset.findMany({
      where: { projectId: id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        filePath: true,
        mimeType: true,
        sourceType: true,
        preserveOriginal: true,
        createdAt: true,
      },
    });

    const enrichedAssets = await Promise.all(
      assets.map(async (asset: (typeof assets)[number]) => {
        const previewPath = await findPreviewPath(asset.filePath);
        const { width, height } = asset.mimeType?.startsWith("image/")
          ? await readImageSize(asset.filePath)
          : { width: undefined, height: undefined };

        return {
          ...asset,
          previewPath,
          width,
          height,
        };
      }),
    );

    return jsonOk({ assets: enrichedAssets });
  } catch (error) {
    console.error("GET /api/projects/[id]/assets error:", error);
    return jsonError("Internal server error", 500);
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const project = await prisma.project.findUnique({
      where: { id },
      select: { workspaceId: true },
    });
    if (!project) {
      return jsonNotFound("Project");
    }

    try {
      ensureWorkspaceScope(project.workspaceId);
    } catch {
      return jsonError("Forbidden: workspace scope violation", 403);
    }

    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return jsonError("No file provided", 400);
    }

    const sourceType = (formData.get("sourceType") as string) || "uploaded";
    const preserveOriginal = formData.get("preserveOriginal") === "true";
    const skipValidation = formData.get("skipValidation") === "true";

    const buffer = Buffer.from(await file.arrayBuffer());
    const mimeType = file.type;

    let validationResult: { width?: number; height?: number } | null = null;
    if (skipValidation) {
      const maxSize = 50 * 1024 * 1024;
      if (buffer.length > maxSize) {
        return jsonError("File too large (max 50MB)", 400);
      }
    } else {
      const validation = validateByoiImage(buffer, mimeType);
      if (!validation.valid) {
        return jsonError(validation.reason || "Invalid image", 400);
      }
      validationResult = { width: validation.width, height: validation.height };
    }

    const timestamp = Date.now();
    const safeBaseName = sanitizeUploadName(file.name);
    const originalExtension = path.extname(file.name) || ".bin";

    let storedPath: string;
    let previewPath: string | undefined;
    let storedMimeType = mimeType;
    let width = validationResult?.width;
    let height = validationResult?.height;

    if (shouldNormalizeImage(mimeType)) {
      const { mainBuffer, previewBuffer, width: normalizedWidth, height: normalizedHeight } =
        await normalizeImageVariants(buffer);

      const mainFileName = `${timestamp}-${safeBaseName}.webp`;
      const previewFileName = `${timestamp}-${safeBaseName}-preview.webp`;
      const mainPublicPath = toPublicUploadPath(id, mainFileName);
      const previewPublicPath = toPublicUploadPath(id, previewFileName);

      await Promise.all([
        uploadPublicPathBuffer(mainPublicPath, mainBuffer, { contentType: "image/webp" }),
        uploadPublicPathBuffer(previewPublicPath, previewBuffer, { contentType: "image/webp" }),
      ]);

      if (preserveOriginal) {
        const originalPublicPath = toPublicUploadPath(
          id,
          `${timestamp}-${safeBaseName}-original${originalExtension}`,
        );
        await uploadPublicPathBuffer(originalPublicPath, buffer, { contentType: mimeType });
      }

      storedPath = mainPublicPath;
      previewPath = previewPublicPath;
      storedMimeType = "image/webp";
      width = normalizedWidth;
      height = normalizedHeight;
    } else {
      const passthroughFileName = `${timestamp}-${safeBaseName}${originalExtension}`;
      storedPath = toPublicUploadPath(id, passthroughFileName);
      await uploadPublicPathBuffer(storedPath, buffer, { contentType: mimeType });
    }

    const asset = await prisma.asset.create({
      data: {
        projectId: id,
        sourceType,
        filePath: storedPath,
        mimeType: storedMimeType,
        preserveOriginal,
      },
      select: {
        id: true,
        filePath: true,
        mimeType: true,
        sourceType: true,
        preserveOriginal: true,
        createdAt: true,
      },
    });

    return jsonOk(
      {
        asset: {
          ...asset,
          previewPath,
          width,
          height,
        },
        validation: validationResult,
      },
      201,
    );
  } catch (error) {
    console.error("POST /api/projects/[id]/assets error:", error);
    return jsonError("Internal server error", 500);
  }
}
