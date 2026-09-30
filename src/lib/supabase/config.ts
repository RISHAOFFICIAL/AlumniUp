// Central Supabase configuration for AlumniUp.
//
// The Supabase project is provisioned under the platform's generic secret names
// (ANON for the public anon key, SERVICE_ROLE_SECRET for the server-only
// service-role key), so this module resolves them with fallbacks to the
// NEXT_PUBLIC_* / SUPABASE_* names the rest of the codebase historically used.
//
// The anon key is PUBLIC by design — it only grants RLS-limited access. It is
// inlined into the client bundle via next.config.mjs (which maps it from the
// platform's `ANON` var). The service-role key must NEVER be exposed to the
// client; it is only read in server-side code (API routes / server components),
// where process.env.SERVICE_ROLE_SECRET is available at runtime.

export const SUPABASE_URL = "https://ttrpafvvacbdomwxxbru.supabase.co";

export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.ANON ||
  "public-anon-key-placeholder";

export const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SERVICE_ROLE_SECRET ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "";

/** True once a real URL + anon key are present (mock mode otherwise). */
export function isSupabaseConfigured(): boolean {
  return (
    SUPABASE_URL.startsWith("https://") &&
    !SUPABASE_URL.includes("placeholder") &&
    SUPABASE_ANON_KEY.length > 0 &&
    !SUPABASE_ANON_KEY.includes("placeholder")
  );
}
