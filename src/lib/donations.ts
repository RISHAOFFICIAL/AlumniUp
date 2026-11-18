// Framework-agnostic donation submission service.
//
// Single interface for the checkout flow. In mock mode it records the donation
// into the Zustand mock store (so progress / Wall of Honor update) and returns
// a simulated success. In live mode it POSTs to /api/checkout, which creates
// a Stripe hosted Checkout session, and redirects the donor to Stripe (Stage 3
// S5). The UI never talks to Stripe directly — this is the one place to swap
// in a real payment provider (web + React Native).

import { useMockStore } from "@/store/mock";

const USE_MOCK =
  (process.env.NEXT_PUBLIC_DATA_SOURCE ?? "mock") === "mock";

export interface DonationInput {
  needId: string;
  amount: number;
  isAnonymous: boolean;
  isRecurring: boolean;
  displayName?: string | null;
  email?: string | null;
  message?: string | null;
}

export interface DonationResult {
  success: boolean;
  donationId?: string;
  paymentIntentId?: string;
  checkoutUrl?: string;
  redirected?: boolean;
  error?: string;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function submitDonation(
  input: DonationInput
): Promise<DonationResult> {
  if (USE_MOCK) {
    // Simulate network + payment-processing latency so the "processing" state
    // is visible in preview mode. No real charge occurs.
    await delay(900);

    // Record into mock state so the need's progress, the Wall of Honor, and
    // the class-year leaderboard reflect the donation.
    const donation = useMockStore.getState().recordDonation(input);

    return {
      success: true,
      donationId: donation.id,
      paymentIntentId: donation.stripe_payment_intent_id ?? undefined,
    };
  }

  const res = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { success: false, error: data?.error ?? "Checkout failed." };
  }

  // Stripe hosted checkout: the donor pays on Stripe's page, then returns
  // to /donate/success. The webhook records the gift.
  if (typeof data?.url === "string") {
    if (typeof window !== "undefined") {
      window.location.href = data.url;
    }
    return { success: true, checkoutUrl: data.url, redirected: true };
  }

  return { success: false, error: "Checkout could not start. Please try again." };
}
