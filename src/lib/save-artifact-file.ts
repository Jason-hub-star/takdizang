/** Helpers for storing preview/result artifacts under the uploads tree. */
import { sanitizeUploadName, toPublicUploadPath } from "@/lib/asset-images";
import { uploadPublicPathBuffer } from "@/lib/supabase/storage";

export async function saveTextArtifactFile(
  projectId: string,
  prefix: string,
  content: string,
) {
  const fileName = `${Date.now()}-${sanitizeUploadName(prefix)}.txt`;
  const publicPath = toPublicUploadPath(projectId, fileName);
  await uploadPublicPathBuffer(publicPath, Buffer.from(content, "utf8"), {
    contentType: "text/plain; charset=utf-8",
  });

  return publicPath;
}
