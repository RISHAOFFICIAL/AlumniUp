import { NextResponse } from "next/server";

/**
 * Checkout endpoint. Stripe is intentionally stubbed here until keys arrive —
 * this route owns the payment boundary so the client (and future React Native
 * app) only ever calls `submitDonation()` in src/lib/donations.ts.
 *
 * When STRIPE_SECRET_KEY is configured, drop in:
 *   1. new Stripe(process.env.STRIPE_SECRET_KEY)
 *   2. paymentIntents.create (or subscriptions for recurring)
 *   3. insert a donations row via Supabase
 *   4. return { success, paymentIntentId, clientSecret }
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));

  const amount = Number(body?.amount);
  const needId = typeof body?.needId === "string" ? body.needId : null;

  if (!needId || !Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json(
      { error: "A valid need and amount are required." },
      { status: 400 }
    );
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "Checkout is not configured yet." },
      { status: 501 }
    );
  }

  // TODO(Stripe): create the PaymentIntent / Subscription here, then persist.
  return NextResponse.json(
    { success: true, paymentIntentId: "pi_pending" },
    { status: 200 }
  );
}
