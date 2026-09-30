import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminNav from "./nav";
import AdminStatsBar from "./stats";

/**
 * Role-based authorization for the /admin area, plus the shared dashboard
 * shell (header, tab nav, stats strip) used by every admin section.
 *
 * The edge middleware only gates *authentication* (signed-in vs not); the
 * actual role check lives here in a Server Component (Node.js runtime), where
 * the Supabase PostgREST client is safe to use.
 */
function AdminShell({
  children,
  preview,
}: {
  children: React.ReactNode;
  preview?: boolean;
}) {
  return (
    <div className="min-h-screen bg-cream">
      {preview && (
        <div className="bg-gold text-white text-xs text-center py-2 px-4 font-sans tracking-wide">
          Preview — mock admin view. Data is illustrative and not persisted. Live
          admin requires platform-admin sign-in.
        </div>
      )}

      <header className="bg-navy text-white">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/admin/pending" className="font-serif text-2xl font-bold">
            AlumniUp{" "}
            <span className="font-sans text-xs text-gold-light uppercase tracking-wide align-middle ml-1">
              Admin
            </span>
          </Link>
          <Link
            href="/"
            className="font-sans text-xs text-cream/80 hover:text-white"
          >
            View Site
          </Link>
        </div>
        <div className="max-w-5xl mx-auto px-4">
          <AdminNav />
        </div>
      </header>

      <AdminStatsBar />

      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const configured =
    supabaseUrl.startsWith("https://") && !supabaseUrl.includes("placeholder");

  // Mock/preview mode: no Supabase configured — render the preview shell.
  if (!configured) {
    return <AdminShell preview>{children}</AdminShell>;
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/admin");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  // Only platform admins may access the admin area. (The read-only
  // /admin/disbursements view for cpf_admin is documented in src/lib/auth.ts.)
  if (profile?.role !== "platform_admin") {
    redirect("/");
  }

  return <AdminShell>{children}</AdminShell>;
}
