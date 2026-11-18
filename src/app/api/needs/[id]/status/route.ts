import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { transitionNeedServer } from "@/lib/trail-server";
import { notifyNeedApproved, notifyNeedRejected } from "@/lib/email";

// Same mock/supabase toggle as src/hooks/index.ts.
const USE_MOCK = (process.env.NEXT_PUBLIC_DATA_SOURCE ?? "mock") === "mock";

// Story 12: rejecting requires a reason, which the poster sees.
const statusSchema = z.object({
  action: z.enum(["approve", "reject"]),
  reason: z.string().trim().max(1000).optional(),
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
  const { action, reason } = parsed.data;

  if (action === "reject" && !reason) {
    return NextResponse.json(
      { error: "Rejecting a need requires a reason, which the poster sees." },
      { status: 400 }
    );
  }

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

  const { data: need } = await supabase
    .from("needs")
    .select("title, submitted_by_name, submitted_by_email")
    .eq("id", id)
    .single();
  if (!need) {
    return NextResponse.json({ error: "Need not found." }, { status: 404 });
  }

  if (action === "approve") {
    const result = await transitionNeedServer(supabase, {
      needId: id,
      to: "live",
      note: "Approved by the school and live for donations.",
      actorRole: "school_admin",
    });
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 409 });
    }
    await supabase
      .from("needs")
      .update({ approved_at: new Date().toISOString() })
      .eq("id", id);
    if (need.submitted_by_email) {
      await notifyNeedApproved(need.submitted_by_email, {
        needTitle: need.title,
        needId: id,
        posterName: need.submitted_by_name ?? "there",
      });
    }
    return NextResponse.json({ ok: true });
  }

  // Reject: the need returns to draft in the state machine's terms, but the
  // public trail records the rejection privately (no public trace; the need
  // was never live). The legacy status becomes "rejected" and the poster
  // gets the reason by email.
  const { error } = await supabase
    .from("needs")
    .update({ status: "rejected", trail_status: "cancelled", cancelled_reason: reason })
    .eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  await supabase.from("trail_entries").insert({
    need_id: id,
    event_type: "cancelled",
    from_status: "in_review",
    to_status: "cancelled",
    note: reason,
    actor_role: "school_admin",
  });
  if (need.submitted_by_email) {
    await notifyNeedRejected(need.submitted_by_email, {
      needTitle: need.title,
      posterName: need.submitted_by_name ?? "there",
      reason: reason as string,
    });
  }
  return NextResponse.json({ ok: true });
}
