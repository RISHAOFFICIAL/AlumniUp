// Framework-agnostic donation submission service (mirrors the web app).
//
// Single interface for the checkout flow. In mock mode it records the donation
// into the Zustand mock store (so progress bars / Wall of Honor update) and
// returns a simulated success. In real mode it POSTs to the shared Next.js API
// route that owns Stripe. The UI never talks to Stripe directly — this is the
// one place to swap in a real payment provider.

import { useMockStore } from "@/store/mock";

const USE_MOCK =
  (process.env.EXPO_PUBLIC_DATA_SOURCE ?? "mock") === "mock";

// The mobile app reuses the web app's server routes. Override with
// EXPO_PUBLIC_API_URL for a local/staging backend.
const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? "https://alumniup.org";

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

    const donation = useMockStore.getState().recordDonation(input);

    return {
      success: true,
      donationId: donation.id,
      paymentIntentId: donation.stripe_payment_intent_id ?? undefined,
    };
  }

  const res = await fetch(`${API_BASE}/api/donations`, {
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
