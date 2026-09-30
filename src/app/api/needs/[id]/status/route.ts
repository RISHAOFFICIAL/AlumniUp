import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

// Same mock/supabase toggle as src/hooks/index.ts.
const USE_MOCK = (process.env.NEXT_PUBLIC_DATA_SOURCE ?? "mock") === "mock";

const statusSchema = z.object({
  action: z.enum(["approve", "reject"]),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = statusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  }
  const { action } = parsed.data;

  if (USE_MOCK) {
    // Mock mode: the admin page is a preview — just acknowledge.
    console.log(`[needs:status] ${id} -> ${action} (mock)`);
    return NextResponse.json({ ok: true, mock: true });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      { error: "Storage is not configured. Please try again later." },
      { status: 503 }
    );
  }

  const updates =
    action === "approve"
      ? { status: "active", approved_at: new Date().toISOString() }
      : { status: "rejected" };

  const { error } = await supabase.from("needs").update(updates).eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
