import { prisma } from "@/lib/prisma";
import {
  normalizeImageVariants,
  sanitizeUploadName,
  shouldNormalizeImage,
  toPublicUploadPath,
} from "@/lib/asset-images";
import { uploadPublicPathBuffer } from "@/lib/supabase/storage";

export async function saveGeneratedImage(
  projectId: string,
  imageBytes: string,
  mimeType: string,
  slotLabel: string,
): Promise<{ assetId: string; filePath: string }> {
  const buffer = Buffer.from(imageBytes, "base64");
  const timestamp = Date.now();
  const safeSlotLabel = sanitizeUploadName(slotLabel);

  let filePath: string;
  let storedMimeType = mimeType;

  if (shouldNormalizeImage(mimeType)) {
    const { mainBuffer, previewBuffer } = await normalizeImageVariants(buffer);
    const mainFileName = `gen-${safeSlotLabel}-${timestamp}.webp`;
    const previewFileName = `gen-${safeSlotLabel}-${timestamp}-preview.webp`;
    const mainPublicPath = toPublicUploadPath(projectId, mainFileName);
    const previewPublicPath = toPublicUploadPath(projectId, previewFileName);

    await Promise.all([
      uploadPublicPathBuffer(mainPublicPath, mainBuffer, { contentType: "image/webp" }),
      uploadPublicPathBuffer(previewPublicPath, previewBuffer, { contentType: "image/webp" }),
    ]);

    filePath = mainPublicPath;
    storedMimeType = "image/webp";
  } else {
    const extension = mimeType === "image/png" ? "png" : "jpg";
    const fileName = `gen-${safeSlotLabel}-${timestamp}.${extension}`;
    filePath = toPublicUploadPath(projectId, fileName);
    await uploadPublicPathBuffer(filePath, buffer, { contentType: mimeType });
  }

  const asset = await prisma.asset.create({
    data: {
      projectId,
      sourceType: "generated",
      filePath,
      mimeType: storedMimeType,
    },
  });

  return { assetId: asset.id, filePath };
}
