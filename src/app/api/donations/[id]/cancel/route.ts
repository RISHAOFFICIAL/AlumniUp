import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getStripe } from "@/lib/stripe";

// POST /api/donations/[id]/cancel — pause or cancel a monthly gift
// (Stage 7 policy: pause or cancel anytime in My Donations, no email or
// phone call required). Cancels the Stripe subscription; past gifts
// follow the normal rules. Mock mode: the client store handles it.

const USE_MOCK = (process.env.NEXT_PUBLIC_DATA_SOURCE ?? "mock") === "mock";

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const donationId = params.id;

  if (USE_MOCK) {
    console.log(`[donations:cancel] ${donationId} (mock)`);
    return NextResponse.json({ ok: true, mock: true });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Storage is not configured." }, { status: 503 });
  }

  const { data: donation, error } = await supabase
    .from("donations")
    .select("id, is_recurring, stripe_subscription_id")
    .eq("id", donationId)
    .single();
  if (error || !donation) {
    return NextResponse.json({ error: "Gift not found." }, { status: 404 });
  }
  if (!donation.is_recurring || !donation.stripe_subscription_id) {
    return NextResponse.json({ error: "That gift is not a monthly gift." }, { status: 409 });
  }

  const stripe = getStripe();
  if (stripe) {
    try {
      await stripe.subscriptions.cancel(donation.stripe_subscription_id as string);
    } catch (err) {
      console.error("[donations:cancel] Stripe cancel failed", err);
      return NextResponse.json(
        { error: "The monthly gift could not be cancelled. Please try again." },
        { status: 502 }
      );
    }
  }

  await supabase
    .from("donations")
    .update({ is_recurring: false, stripe_subscription_id: null })
    .eq("id", donationId);

  return NextResponse.json({ ok: true });
}
