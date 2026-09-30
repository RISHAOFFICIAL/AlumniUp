import { createClient } from "@supabase/supabase-js";
import {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY,
} from "@/lib/supabase/config";

/**
 * Backward-compatible facade.
 *
 * Client components / hooks should import `createClient` from
 * `@/lib/supabase/client` for cookie-aware auth. This module keeps a
 * shared browser client for simpler cases (public reads, realtime).
 */
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Server-side admin client — use ONLY in API routes / server code.
export function getServiceSupabase() {
  return createClient(
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY || "service-role-key-placeholder",
    {
      auth: { autoRefreshToken: false, persistSession: false },
    }
  );
}
