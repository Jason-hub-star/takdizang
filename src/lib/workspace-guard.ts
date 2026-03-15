const DEFAULT_WORKSPACE_ID = "default-workspace";

/**
 * Returns the enforced workspace ID.
 * MVP: hard single-workspace. Future: resolve from auth session.
 */
export function getWorkspaceId(): string {
  return DEFAULT_WORKSPACE_ID;
}

/**
 * Validates that a workspaceId matches the current scope.
 * Throws if the caller tries to access a different workspace.
 */
export function ensureWorkspaceScope(workspaceId: string): void {
  if (workspaceId !== getWorkspaceId()) {
    throw new Error(`Workspace scope violation: expected ${getWorkspaceId()}, got ${workspaceId}`);
  }
}
