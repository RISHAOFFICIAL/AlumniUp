import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createCheckoutSession, getStripe, isStripeConfigured } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

// POST /api/checkout — create a Stripe hosted Checkout session (Stage 3 S5)
// and return its URL. The client redirects the donor to Stripe; AlumniUp
// never sees card details. Test mode until the fiscal sponsor confirms
// live readiness.
//
// The gift is recorded by the webhook (checkout.session.completed), not
// here, so a donor who abandons checkout never appears in any total.

const checkoutSchema = z.object({
  needId: z.string().uuid("A valid need is required."),
  amount: z.coerce.number().min(1, "Donations start at $1.").max(100000),
  isRecurring: z.boolean().default(false),
  isAnonymous: z.boolean().default(false),
  displayName: z.string().trim().max(120).nullable().optional(),
  email: z.string().trim().email("Enter a valid email for your tax receipt.").max(254),
  message: z.string().trim().max(500).nullable().optional(),
  userId: z.string().uuid().nullable().optional(),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message || "Please check your donation.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
  const data = parsed.data;

  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Checkout is not configured yet." },
      { status: 501 }
    );
  }

  // Verify the need is live and accepting donations when Supabase is
  // available. Without Supabase (test-mode checkout before the database
  // is connected), the checkout still proceeds with the need id in
  // metadata and the webhook records what it can.
  let needTitle: string | undefined;
  let schoolName: string | undefined;
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data: need, error } = await supabase
      .from("needs")
      .select("title, trail_status, status, school:schools(name)")
      .eq("id", data.needId)
      .single();
    if (error || !need) {
      return NextResponse.json({ error: "That need could not be found." }, { status: 404 });
    }
    const trail = (need as { trail_status: string | null }).trail_status;
    const status = (need as { status: string }).status;
    const accepting = trail ? trail === "live" : status === "active";
    if (!accepting) {
      return NextResponse.json(
        { error: "This need is no longer accepting donations." },
        { status: 409 }
      );
    }
    needTitle = (need as { title: string }).title;
    const schoolRel = (need as unknown as { school: { name: string } | { name: string }[] | null }).school;
    schoolName = Array.isArray(schoolRel) ? schoolRel[0]?.name : schoolRel?.name;
  }

  try {
    const { url, sessionId } = await createCheckoutSession({
      ...data,
      needTitle,
      schoolName,
    });
    if (!url) {
      return NextResponse.json({ error: "Checkout could not start. Please try again." }, { status: 500 });
    }
    return NextResponse.json({ url, sessionId });
  } catch (err) {
    console.error("[checkout] Stripe error", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Checkout failed." },
      { status: 500 }
    );
  }
}

// GET /api/checkout/session?session_id=cs_... — session details for the
// success page. Returns only display-safe fields (amount, need, status).
export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.json({ error: "session_id is required." }, { status: 400 });
  }
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Checkout is not configured yet." }, { status: 501 });
  }
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return NextResponse.json({
      status: session.status,
      paymentStatus: session.payment_status,
      amountTotal: session.amount_total != null ? session.amount_total / 100 : null,
      currency: session.currency,
      customerEmail: session.customer_details?.email ?? null,
      needId: session.metadata?.need_id ?? null,
      isRecurring: session.metadata?.is_recurring === "true",
      isAnonymous: session.metadata?.is_anonymous === "true",
    });
  } catch {
    return NextResponse.json({ error: "That checkout session could not be found." }, { status: 404 });
  }
}
