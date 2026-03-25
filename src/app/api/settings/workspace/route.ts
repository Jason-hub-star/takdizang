/** PATCH — 워크스페이스 이름 변경 */
import { NextRequest } from "next/server";
import { getWorkspaceId, handleAuthError } from "@/lib/workspace-guard";
import { prisma } from "@/lib/prisma";
import { jsonOk, jsonError } from "@/lib/api-response";

export async function PATCH(request: NextRequest) {
  try {
    const workspaceId = await getWorkspaceId();
    const body = await request.json();
    const { name } = body as { name?: string };

    if (!name || !name.trim()) {
      return jsonError("워크스페이스 이름을 입력해주세요.", 400);
    }

    const trimmed = name.trim();
    if (trimmed.length > 50) {
      return jsonError("워크스페이스 이름은 50자 이하로 입력해주세요.", 400);
    }

    await prisma.workspace.update({
      where: { id: workspaceId },
      data: { name: trimmed },
    });

    return jsonOk({ workspace: { id: workspaceId, name: trimmed } });
  } catch (err) {
    const authResponse = handleAuthError(err);
    if (authResponse) return authResponse;
    return jsonError("워크스페이스 이름을 변경하지 못했어요.", 500);
  }
}
