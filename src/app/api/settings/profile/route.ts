/** GET/PATCH — 현재 사용자 프로필 조회 및 수정 */
import { NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAuthContext, handleAuthError } from "@/lib/workspace-guard";
import { prisma } from "@/lib/prisma";
import { jsonOk, jsonError } from "@/lib/api-response";

export async function GET() {
  try {
    const { userId } = await getAuthContext();
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    const profile = await prisma.profile.findFirst({ where: { id: userId } });

    return jsonOk({
      profile: {
        displayName: profile?.displayName ?? user?.user_metadata?.name ?? null,
        avatarUrl: profile?.avatarUrl ?? user?.user_metadata?.avatar_url ?? null,
        email: user?.email ?? "",
        authProvider: user?.app_metadata?.provider ?? "email",
      },
    });
  } catch (err) {
    const authResponse = handleAuthError(err);
    if (authResponse) return authResponse;
    return jsonError("프로필을 불러오지 못했어요.", 500);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await getAuthContext();
    const body = await request.json();
    const { displayName } = body as { displayName?: string };

    if (displayName !== undefined) {
      const trimmed = displayName.trim();
      if (!trimmed || trimmed.length > 50) {
        return jsonError("이름은 1~50자로 입력해주세요.", 400);
      }

      // upsert: 기존 행이 없으면 생성
      const existing = await prisma.profile.findFirst({ where: { id: userId } });
      if (existing) {
        await prisma.profile.update({
          where: { id: userId },
          data: { displayName: trimmed },
        });
      } else {
        await prisma.profile.create({
          data: { id: userId, displayName: trimmed },
        });
      }
    }

    // 업데이트된 프로필 반환
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    const profile = await prisma.profile.findFirst({ where: { id: userId } });

    return jsonOk({
      profile: {
        displayName: profile?.displayName ?? null,
        avatarUrl: profile?.avatarUrl ?? null,
        email: user?.email ?? "",
        authProvider: user?.app_metadata?.provider ?? "email",
      },
    });
  } catch (err) {
    const authResponse = handleAuthError(err);
    if (authResponse) return authResponse;
    return jsonError("프로필을 수정하지 못했어요.", 500);
  }
}
