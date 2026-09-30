// Framework-agnostic donation submission service.
//
// Single interface for the checkout flow. In mock mode it records the donation
// into the Zustand mock store (so progress / Wall of Honor update) and returns
// a simulated success. In Supabase/Stripe mode it POSTs to the server route
// that owns Stripe. The UI never talks to Stripe directly — this is the one
// place to swap in a real payment provider (web + React Native).

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

  const res = await fetch("/api/donations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { success: false, error: data?.error ?? "Checkout failed." };
  }
  return data as DonationResult;
}
