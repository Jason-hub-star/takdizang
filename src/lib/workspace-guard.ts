/** Workspace scope enforcement — resolves workspace from auth session. */
import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

export interface AuthContext {
  userId: string;
  workspaceId: string;
}

/**
 * Resolves the current user and their primary workspace from the auth session.
 * Throws AuthError if not authenticated or no workspace found.
 */
export async function getAuthContext(): Promise<AuthContext> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new AuthError("Unauthorized");
  }

  const { data: membership, error } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (error || !membership) {
    throw new AuthError("No workspace found for user");
  }

  return { userId: user.id, workspaceId: membership.workspace_id };
}

/**
 * Returns just the workspace ID for the current user.
 * Drop-in replacement for the old synchronous getWorkspaceId().
 */
export async function getWorkspaceId(): Promise<string> {
  const { workspaceId } = await getAuthContext();
  return workspaceId;
}

/**
 * Validates that a workspaceId matches the current user's scope.
 * Throws if the caller tries to access a different workspace.
 */
export async function ensureWorkspaceScope(workspaceId: string): Promise<void> {
  const { workspaceId: myWorkspaceId } = await getAuthContext();
  if (workspaceId !== myWorkspaceId) {
    throw new AuthError("Workspace scope violation");
  }
}

/**
 * Catches AuthError and returns appropriate HTTP response.
 * Use in API route catch blocks: `if (isAuthErrorResponse(err)) return isAuthErrorResponse(err);`
 */
export function handleAuthError(err: unknown): NextResponse | null {
  if (err instanceof AuthError) {
    const status = err.message === "Unauthorized" ? 401 : 403;
    return NextResponse.json({ error: err.message }, { status });
  }
  return null;
}
