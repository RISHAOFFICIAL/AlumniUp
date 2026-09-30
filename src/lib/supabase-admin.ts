// Server-side Supabase admin client (service role) for API routes.
// Returns null when Supabase isn't configured, so routes can fall back to
// mock mode without crashing.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
} from "@/lib/supabase/config";

let cached: SupabaseClient | null | undefined;

export function getSupabaseAdmin(): SupabaseClient | null {
  if (cached !== undefined) return cached;

  const configured =
    SUPABASE_URL.startsWith("https://") &&
    !SUPABASE_URL.includes("placeholder") &&
    SUPABASE_SERVICE_ROLE_KEY.length > 0;

  if (!configured) {
    cached = null;
    return null;
  }

  cached = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  return cached;
}
