/** POST — 아바타 이미지 업로드 */
import { NextRequest } from "next/server";
import { getAuthContext, handleAuthError } from "@/lib/workspace-guard";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { prisma } from "@/lib/prisma";
import { jsonOk, jsonError } from "@/lib/api-response";

const MAX_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function POST(request: NextRequest) {
  try {
    const { userId } = await getAuthContext();

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return jsonError("파일을 선택해주세요.", 400);
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      return jsonError("JPG, PNG, WebP, GIF 이미지만 업로드할 수 있어요.", 400);
    }
    if (file.size > MAX_SIZE) {
      return jsonError("파일 크기는 2MB 이하로 올려주세요.", 400);
    }

    const ext = file.name.split(".").pop() ?? "jpg";
    const objectPath = `avatars/${userId}.${ext}`;

    const supabase = getSupabaseAdmin();
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from("project-assets")
      .upload(objectPath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      return jsonError("이미지를 업로드하지 못했어요.", 500);
    }

    const { data: publicUrlData } = supabase.storage
      .from("project-assets")
      .getPublicUrl(objectPath);

    const avatarUrl = publicUrlData.publicUrl;

    // 프로필 업데이트 (upsert)
    const existing = await prisma.profile.findFirst({ where: { id: userId } });
    if (existing) {
      await prisma.profile.update({
        where: { id: userId },
        data: { avatarUrl },
      });
    } else {
      await prisma.profile.create({
        data: { id: userId, avatarUrl },
      });
    }

    return jsonOk({ avatarUrl });
  } catch (err) {
    const authResponse = handleAuthError(err);
    if (authResponse) return authResponse;
    return jsonError("아바타를 업로드하지 못했어요.", 500);
  }
}
