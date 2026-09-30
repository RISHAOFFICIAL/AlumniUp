import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  isSupabaseConfigured,
} from "@/lib/supabase/config";

type CookiesToSet = { name: string; value: string; options: CookieOptions }[];

/**
 * Refresh the Supabase auth session and gate protected routes.
 * Wired into src/middleware.ts.
 *
 * When Supabase is not configured (mock data mode, no real URL/key), we skip
 * session refresh entirely — otherwise createServerClient + getUser() against
 * a placeholder URL throws and corrupts the response (headers already sent).
 *
 * NOTE: This middleware only enforces *authentication* (signed-in vs not).
 * Role-based authorization happens in the server layouts (/admin, /portal) via
 * src/lib/auth.ts, because the edge runtime sandbox disallows the codegen that
 * the Supabase PostgREST query builder performs. Keep this file lightweight.
 */
export async function updateSession(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: CookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // IMPORTANT: do not run code between createServerClient and
  // supabase.auth.getUser() — it may interfere with token refresh.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Authentication gate: protected areas require a signed-in user.
  const { pathname } = request.nextUrl;
  const isProtected =
    pathname.startsWith("/admin") || pathname.startsWith("/portal");

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
