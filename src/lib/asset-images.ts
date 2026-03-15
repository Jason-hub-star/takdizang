import path from "path";
import sharp from "sharp";
import { getPublicUploadsPrefix } from "@/lib/runtime-paths";
import { downloadPublicPath } from "@/lib/supabase/storage";

const MAX_IMAGE_DIMENSION = 2048;
const PREVIEW_IMAGE_DIMENSION = 640;

export function shouldNormalizeImage(mimeType: string) {
  return mimeType.startsWith("image/") && mimeType !== "image/gif" && mimeType !== "image/svg+xml";
}

export function sanitizeUploadName(fileName: string) {
  const parsed = path.parse(fileName);
  const normalized = parsed.name
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);

  return normalized || "asset";
}

export function toPublicUploadPath(...segments: string[]) {
  const safeSegments = segments.map((segment) => segment.replace(/^[\\/]+/, ""));
  return `${getPublicUploadsPrefix()}/${path.posix.join(...safeSegments)}`;
}

export async function normalizeImageVariants(buffer: Buffer) {
  const pipeline = sharp(buffer).rotate();

  const mainBuffer = await pipeline
    .clone()
    .resize({
      width: MAX_IMAGE_DIMENSION,
      height: MAX_IMAGE_DIMENSION,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 82 })
    .toBuffer();

  const previewBuffer = await pipeline
    .clone()
    .resize({
      width: PREVIEW_IMAGE_DIMENSION,
      height: PREVIEW_IMAGE_DIMENSION,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 74 })
    .toBuffer();

  const metadata = await sharp(mainBuffer).metadata();

  return {
    mainBuffer,
    previewBuffer,
    width: metadata.width,
    height: metadata.height,
  };
}

export async function readImageSize(publicPath: string) {
  try {
    const buffer = await downloadPublicPath(publicPath);
    if (!buffer) {
      throw new Error("Image not found");
    }

    const metadata = await sharp(buffer).metadata();
    return {
      width: metadata.width,
      height: metadata.height,
    };
  } catch {
    return {
      width: undefined,
      height: undefined,
    };
  }
}

export async function findPreviewPath(publicPath: string) {
  if (!publicPath.startsWith(`${getPublicUploadsPrefix()}/`)) {
    return undefined;
  }

  if (publicPath.endsWith("-preview.webp")) {
    return undefined;
  }

  const extension = path.posix.extname(publicPath).toLowerCase();
  if (
    !extension ||
    extension === ".gif" ||
    extension === ".svg" ||
    extension === ".txt" ||
    extension === ".mp4" ||
    extension === ".webm" ||
    extension === ".mov" ||
    publicPath.includes("/bgm/") ||
    publicPath.includes("/renders/")
  ) {
    return undefined;
  }

  return publicPath.replace(new RegExp(`${escapeRegExp(extension)}$`), "-preview.webp");
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
