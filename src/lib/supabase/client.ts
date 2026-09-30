import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser Supabase client (client components).
 * Uses cookie-based session handling via @supabase/ssr.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
