/** Supabase Storage helpers for Takdizang uploads and artifacts. */
import { extname } from "path";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { fromPublicUploadPath } from "@/lib/runtime-paths";

const PROJECT_ASSETS_BUCKET = "project-assets";
const ARTIFACTS_BUCKET = "artifacts";
const THUMBNAILS_BUCKET = "thumbnails";

const ARTIFACT_SEGMENTS = new Set(["renders"]);
const THUMBNAIL_SEGMENTS = new Set(["thumbnails"]);
const ARTIFACT_EXTENSIONS = new Set([".mp4", ".webm", ".mov", ".gif", ".txt", ".json"]);

export interface UploadStorageTarget {
  bucket: string;
  objectPath: string;
}

export function resolveUploadStorageTarget(publicPath: string): UploadStorageTarget | null {
  const segments = fromPublicUploadPath(publicPath);
  if (!segments || segments.length < 2) {
    return null;
  }

  const [projectId, ...relativeSegments] = segments;
  if (!projectId || relativeSegments.length === 0) {
    return null;
  }

  const firstSegment = relativeSegments[0]?.toLowerCase() ?? "";
  const extension = extname(relativeSegments[relativeSegments.length - 1] ?? "").toLowerCase();

  let bucket = PROJECT_ASSETS_BUCKET;
  if (THUMBNAIL_SEGMENTS.has(firstSegment)) {
    bucket = THUMBNAILS_BUCKET;
  } else if (ARTIFACT_SEGMENTS.has(firstSegment) || ARTIFACT_EXTENSIONS.has(extension)) {
    bucket = ARTIFACTS_BUCKET;
  }

  return {
    bucket,
    objectPath: `projects/${projectId}/${relativeSegments.join("/")}`,
  };
}

export async function uploadPublicPathBuffer(
  publicPath: string,
  buffer: Buffer,
  options?: {
    contentType?: string;
    cacheControl?: string;
    upsert?: boolean;
  },
) {
  const target = resolveUploadStorageTarget(publicPath);
  if (!target) {
    throw new Error(`Unsupported upload path: ${publicPath}`);
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.storage.from(target.bucket).upload(target.objectPath, buffer, {
    contentType: options?.contentType,
    cacheControl: options?.cacheControl ?? "3600",
    upsert: options?.upsert ?? true,
  });

  if (error) {
    throw error;
  }

  return target;
}

export async function downloadPublicPath(publicPath: string) {
  const target = resolveUploadStorageTarget(publicPath);
  if (!target) {
    return null;
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.storage.from(target.bucket).download(target.objectPath);
  if (error) {
    return null;
  }

  const arrayBuffer = await data.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function removePublicUploadPaths(publicPaths: string[]) {
  const grouped = new Map<string, string[]>();

  for (const publicPath of publicPaths) {
    const target = resolveUploadStorageTarget(publicPath);
    if (!target) {
      continue;
    }

    const existing = grouped.get(target.bucket) ?? [];
    if (!existing.includes(target.objectPath)) {
      existing.push(target.objectPath);
    }
    grouped.set(target.bucket, existing);
  }

  const supabase = getSupabaseAdmin();
  await Promise.all(
    [...grouped.entries()].map(async ([bucket, objectPaths]) => {
      const { error } = await supabase.storage.from(bucket).remove(objectPaths);
      if (error) {
        throw error;
      }
    }),
  );
}

async function collectBucketObjectPaths(bucket: string, prefix: string): Promise<string[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.storage.from(bucket).list(prefix, {
    limit: 1000,
    offset: 0,
  });

  if (error) {
    throw error;
  }

  const entries = data ?? [];
  const objectPaths: string[] = [];

  for (const entry of entries) {
    const nextPath = `${prefix}/${entry.name}`;
    const isFolder = !entry.id || !entry.metadata;

    if (isFolder) {
      objectPaths.push(...(await collectBucketObjectPaths(bucket, nextPath)));
      continue;
    }

    objectPaths.push(nextPath);
  }

  return objectPaths;
}

export async function removeProjectStoragePrefix(projectId: string) {
  const prefix = `projects/${projectId}`;
  const buckets = [PROJECT_ASSETS_BUCKET, ARTIFACTS_BUCKET, THUMBNAILS_BUCKET];
  const supabase = getSupabaseAdmin();

  await Promise.all(
    buckets.map(async (bucket) => {
      const objectPaths = await collectBucketObjectPaths(bucket, prefix);
      if (objectPaths.length === 0) {
        return;
      }

      const { error } = await supabase.storage.from(bucket).remove(objectPaths);
      if (error) {
        throw error;
      }
    }),
  );
}
