import { createClient } from "@supabase/supabase-js";

/**
 * Backward-compatible facade.
 *
 * Client components / hooks should import `createClient` from
 * `@/lib/supabase/client` for cookie-aware auth. This module keeps a
 * shared browser client for simpler cases (public reads, realtime).
 *
 * NOTE: fallback placeholders prevent a hard crash (and build/prerender
 * failure) when env vars are not yet configured. Real values must be set
 * in `.env.local` before the app can talk to Supabase.
 */
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "public-anon-key-placeholder";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side admin client — use ONLY in API routes / server code.
export function getServiceSupabase() {
  const url =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://placeholder.supabase.co";
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || "service-role-key-placeholder";
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
