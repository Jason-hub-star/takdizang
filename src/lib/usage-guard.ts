/** Phase 2: Usage limit enforcement per workspace. */
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const FREE_LIMITS: Record<string, number> = {
  generation_start: 10,
  image_generation_start: 5,
  export_start: 5,
  model_compose_start: 3,
  remove_bg_start: 5,
  marketing_script_start: 5,
  thumbnail_start: 5,
  scene_compose_start: 5,
  block_text_generate: 30,
  text_rewrite: 20,
};

export const COST_ESTIMATES: Record<string, number> = {
  generation_start: 0.05,
  image_generation_start: 0.08,
  model_compose_start: 0.12,
  remove_bg_start: 0.02,
  scene_compose_start: 0.10,
  marketing_script_start: 0.05,
  thumbnail_start: 0.08,
  export_start: 0.01,
  block_text_generate: 0.03,
  text_rewrite: 0.03,
};

export class UsageLimitError extends Error {
  constructor(eventType: string, used: number, limit: number) {
    super(
      `월간 사용량 초과: ${eventType} (${used}/${limit}). 구독을 업그레이드하세요.`,
    );
    this.name = "UsageLimitError";
  }
}

/**
 * Checks whether the workspace has exceeded its free-tier limit
 * for the given event type in the current calendar month.
 * Throws UsageLimitError if over limit.
 */
export async function checkUsageLimit(
  workspaceId: string,
  eventType: string,
): Promise<void> {
  const limit = FREE_LIMITS[eventType];
  if (!limit) return; // no limit for this event type

  const supabase = getSupabaseAdmin();
  const startOfMonth = new Date();
  startOfMonth.setUTCDate(1);
  startOfMonth.setUTCHours(0, 0, 0, 0);

  const { count, error } = await supabase
    .from("usage_ledger")
    .select("id", { count: "exact", head: true })
    .eq("workspace_id", workspaceId)
    .eq("event_type", eventType)
    .gte("created_at", startOfMonth.toISOString());

  if (error) {
    throw error;
  }

  const used = count ?? 0;
  if (used >= limit) {
    throw new UsageLimitError(eventType, used, limit);
  }
}
