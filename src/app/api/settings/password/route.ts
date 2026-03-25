/** POST — 비밀번호 변경 */
import { NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAuthContext, handleAuthError } from "@/lib/workspace-guard";
import { jsonOk, jsonError } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  try {
    await getAuthContext(); // 인증 확인

    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return jsonError("인증 정보를 찾지 못했어요.", 401);
    }

    // OAuth 전용 계정은 비밀번호 변경 불가
    const provider = user.app_metadata?.provider ?? "email";
    if (provider !== "email") {
      return jsonError("소셜 로그인 계정은 비밀번호를 변경할 수 없어요.", 400);
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body as {
      currentPassword?: string;
      newPassword?: string;
    };

    if (!currentPassword || !newPassword) {
      return jsonError("현재 비밀번호와 새 비밀번호를 모두 입력해주세요.", 400);
    }

    if (newPassword.length < 8) {
      return jsonError("새 비밀번호는 8자 이상이어야 해요.", 400);
    }

    // 현재 비밀번호 검증: signInWithPassword로 확인
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: currentPassword,
    });

    if (signInError) {
      return jsonError("현재 비밀번호가 맞지 않아요.", 400);
    }

    // 새 비밀번호로 업데이트
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      return jsonError("비밀번호를 변경하지 못했어요.", 500);
    }

    return jsonOk({ ok: true });
  } catch (err) {
    const authResponse = handleAuthError(err);
    if (authResponse) return authResponse;
    return jsonError("비밀번호를 변경하지 못했어요.", 500);
  }
}
