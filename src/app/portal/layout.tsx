import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Role-based authorization for the /portal area (school staff + school admins),
 * plus the shared portal shell.
 *
 * Like /admin, the edge middleware only gates *authentication*; the role check
 * lives here in a Server Component where the Supabase client is safe to use.
 */
function PortalShell({
  children,
  preview,
}: {
  children: React.ReactNode;
  preview?: boolean;
}) {
  return (
    <div className="min-h-screen bg-cream">
      {preview && (
        <div className="bg-gold text-navy text-xs text-center py-2 px-4 font-sans tracking-wide">
          Preview — mock school portal. Data is illustrative and not persisted.
          Live access requires school-admin sign-in.
        </div>
      )}

      <header className="bg-navy text-white">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/portal" className="font-serif text-2xl font-bold">
            AlumniUp{" "}
            <span className="font-sans text-xs text-gold-light uppercase tracking-wide align-middle ml-1">
              School Portal
            </span>
          </Link>
          <Link
            href="/"
            className="font-sans text-xs text-cream/80 hover:text-white"
          >
            View Site
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const configured =
    supabaseUrl.startsWith("https://") && !supabaseUrl.includes("placeholder");

  // Mock/preview mode: no Supabase configured — render the preview shell.
  if (!configured) {
    return <PortalShell preview>{children}</PortalShell>;
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/portal");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role, school_id")
    .eq("id", user.id)
    .single();

  // Only school staff / school admins may access the portal.
  if (
    !profile ||
    !["school_staff", "school_admin"].includes(profile.role)
  ) {
    redirect("/");
  }

  return <PortalShell>{children}</PortalShell>;
}
