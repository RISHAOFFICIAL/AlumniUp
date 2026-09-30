// Server-side Supabase admin client (service role) for API routes.
// Returns null when Supabase isn't configured, so routes can fall back to
// mock mode without crashing.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null | undefined;

export function getSupabaseAdmin(): SupabaseClient | null {
  if (cached !== undefined) return cached;

  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  const configured =
    url.startsWith("https://") && !url.includes("placeholder") && key.length > 0;

  if (!configured) {
    cached = null;
    return null;
  }

  cached = createClient(url, key);
  return cached;
}
