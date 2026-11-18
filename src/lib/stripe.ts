// Stripe (server-only). Test mode first: use pk_test / sk_test keys until
// the fiscal sponsor confirms live readiness (Stage 6 gate). No live keys,
// no real charges, no secrets in files; keys come from env vars only.
//
// Checkout is Stripe hosted (Stage 3 S5): the donor enters card details on
// Stripe's page, never on AlumniUp. AlumniUp never sees or stores card
// numbers. The webhook (/api/webhooks/stripe) records the gift.

import Stripe from "stripe";

let stripe: Stripe | null | undefined;

export function getStripe(): Stripe | null {
  if (stripe !== undefined) return stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  stripe = key ? new Stripe(key) : null;
  return stripe;
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.alumniupdetroit.org";

export interface CheckoutInput {
  needId: string;
  amount: number; // dollars, whole or with cents
  isRecurring: boolean;
  isAnonymous: boolean;
  displayName?: string | null;
  email: string;
  message?: string | null;
  userId?: string | null;
  needTitle?: string;
  schoolName?: string;
}

export async function createCheckoutSession(
  input: CheckoutInput
): Promise<{ url: string | null; sessionId: string }> {
  const client = getStripe();
  if (!client) throw new Error("Stripe is not configured.");

  const amountCents = Math.round(input.amount * 100);
  if (!Number.isFinite(amountCents) || amountCents < 100) {
    throw new Error("Donations start at $1.");
  }
  if (amountCents > 1_000_000_00) {
    throw new Error("For gifts over $100,000, contact support@alumniupdetroit.org.");
  }

  const needLabel = input.needTitle
    ? `Donation to "${input.needTitle}"${input.schoolName ? ` at ${input.schoolName}` : ""}`
    : "Donation to a Detroit school need";

  const metadata: Record<string, string> = {
    need_id: input.needId,
    is_anonymous: input.isAnonymous ? "true" : "false",
    is_recurring: input.isRecurring ? "true" : "false",
    donor_email: input.email,
  };
  if (input.displayName) metadata.display_name = input.displayName;
  if (input.message) metadata.message = input.message.slice(0, 500);
  if (input.userId) metadata.user_id = input.userId;

  const session = await client.checkout.sessions.create({
    mode: input.isRecurring ? "subscription" : "payment",
    customer_email: input.email,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: amountCents,
          ...(input.isRecurring
            ? { recurring: { interval: "month" as const } }
            : {}),
          product_data: {
            name: needLabel,
            description: input.isRecurring
              ? "Monthly gift via AlumniUp. Tax-deductible through Childs Play Foundation, Inc. (EIN 86-2707543). Cancel anytime in My Donations."
              : "One-time gift via AlumniUp. Tax-deductible through Childs Play Foundation, Inc. (EIN 86-2707543).",
          },
        },
      },
    ],
    metadata,
    ...(input.isRecurring
      ? { subscription_data: { metadata } }
      : { payment_intent_data: { metadata } }),
    success_url: `${SITE_URL}/donate/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${SITE_URL}/donate/cancelled?need_id=${input.needId}`,
  });

  return { url: session.url, sessionId: session.id };
}
