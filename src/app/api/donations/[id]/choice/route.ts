import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getStripe } from "@/lib/stripe";

// POST /api/donations/[id]/choice — a donor's refund-or-redirect choice
// for a gift to a need that was cancelled before disbursement (Stage 7
// policy). One choice per gift. A refund is executed by the fiscal
// sponsor to the original payment method through Stripe; a redirect
// records the target need and the operator moves the gift.
//
// Mock mode: the client store records the choice; this route acknowledges.

const USE_MOCK = (process.env.NEXT_PUBLIC_DATA_SOURCE ?? "mock") === "mock";

const choiceSchema = z.object({
  choice: z.enum(["refund", "redirect"]),
  redirectNeedId: z.string().uuid().nullable().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const donationId = params.id;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  const parsed = choiceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Choose a refund or a redirect." }, { status: 400 });
  }
  const { choice, redirectNeedId } = parsed.data;

  if (choice === "redirect" && !redirectNeedId) {
    return NextResponse.json(
      { error: "Pick the open need your gift should go to." },
      { status: 400 }
    );
  }

  if (USE_MOCK) {
    console.log(`[donations:choice] ${donationId} -> ${choice} (mock)`);
    return NextResponse.json({ ok: true, mock: true });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Storage is not configured." }, { status: 503 });
  }

  const { data: donation, error: donationErr } = await supabase
    .from("donations")
    .select("id, need_id, amount, status, stripe_payment_intent_id, need:needs(trail_status, school_id)")
    .eq("id", donationId)
    .single();
  if (donationErr || !donation) {
    return NextResponse.json({ error: "Gift not found." }, { status: 404 });
  }
  const needRel = (donation as unknown as {
    need: { trail_status: string; school_id: string } | { trail_status: string; school_id: string }[] | null;
  }).need;
  const need = Array.isArray(needRel) ? needRel[0] ?? null : needRel;
  if (need?.trail_status !== "cancelled") {
    return NextResponse.json(
      { error: "Refund and redirect choices are only for cancelled needs." },
      { status: 409 }
    );
  }
  if (donation.status === "refunded") {
    return NextResponse.json({ error: "This gift was already refunded." }, { status: 409 });
  }

  if (choice === "redirect" && redirectNeedId) {
    // The redirect target must be an open need at the same school.
    const { data: target } = await supabase
      .from("needs")
      .select("id, school_id, trail_status")
      .eq("id", redirectNeedId)
      .single();
    if (
      !target ||
      (target as { school_id: string }).school_id !== need?.school_id ||
      (target as { trail_status: string }).trail_status !== "live"
    ) {
      return NextResponse.json(
        { error: "Redirect to an open need at the same school." },
        { status: 400 }
      );
    }
  }

  const { error: insertErr } = await supabase.from("donation_choices").insert({
    donation_id: donationId,
    choice,
    redirect_need_id: choice === "redirect" ? redirectNeedId : null,
  });
  if (insertErr) {
    return NextResponse.json({ error: "A choice was already recorded for this gift." }, { status: 409 });
  }

  if (choice === "refund") {
    // Execute the refund through Stripe when a payment intent exists.
    // Live refunds run on the fiscal sponsor's Stripe account; in test
    // mode this is a test refund.
    const stripe = getStripe();
    const paymentIntentId = donation.stripe_payment_intent_id as string | null;
    if (stripe && paymentIntentId) {
      try {
        await stripe.refunds.create({ payment_intent: paymentIntentId });
      } catch (err) {
        console.error("[donations:choice] Stripe refund failed", err);
        return NextResponse.json(
          { error: "The refund could not be processed. The choice is recorded; the operator will follow up." },
          { status: 502 }
        );
      }
      await supabase.from("donations").update({ status: "refunded" }).eq("id", donationId);
    }
    await supabase
      .from("donation_choices")
      .update({ resolved_at: new Date().toISOString() })
      .eq("donation_id", donationId);
    await supabase.from("trail_entries").insert({
      need_id: donation.need_id,
      event_type: "refund_issued",
      from_status: "cancelled",
      to_status: "cancelled",
      note: `A $${Number(donation.amount).toLocaleString()} gift was refunded to the original payment method.`,
      actor_role: "donor",
    });
  } else {
    await supabase.from("trail_entries").insert({
      need_id: donation.need_id,
      event_type: "redirected",
      from_status: "cancelled",
      to_status: "cancelled",
      note: "A gift was redirected to another open need at the same school.",
      actor_role: "donor",
    });
  }

  return NextResponse.json({ ok: true });
}
