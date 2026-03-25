/** Server-side Supabase admin client for Takdizang runtime data access. */
import { createClient } from "@supabase/supabase-js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase client type varies by key used
let cachedClient: any = null;

function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = [
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  ].find((value) => typeof value === "string" && value.trim().length > 0);

  if (!url) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not configured.");
  }

  if (!key) {
    throw new Error("Set SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY before using Supabase.");
  }

  return { url, key };
}

export function getSupabaseAdmin() {
  if (cachedClient) {
    return cachedClient;
  }

  const { url, key } = getSupabaseEnv();
  cachedClient = createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase client type varies by key used
  }) as any;

  return cachedClient;
}
