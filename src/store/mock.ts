// Mock donation state (Zustand). In preview mode there is no server, so a
// completed "donation" is client-side state. This store is the single source of
// truth the mock hooks read from, which is what makes progress bars, the Wall
// of Honor, and the class-year leaderboard move after a mock donation.
//
// Real mode bypasses this entirely — hooks go to Supabase, and donations POST
// through /api/donations.

import { create } from "zustand";
import {
  MOCK_NEEDS,
  MOCK_WALL_OF_HONOR,
  MOCK_DONATIONS,
} from "@/lib/data/mock";
import type { Donation, Need, WallOfHonorEntry } from "@/types";

export interface RecordDonationInput {
  needId: string;
  amount: number;
  isAnonymous: boolean;
  isRecurring: boolean;
  displayName?: string | null;
  email?: string | null;
  message?: string | null;
}

interface MockState {
  needs: Need[];
  wallOfHonor: WallOfHonorEntry[];
  donations: Donation[];
  recordDonation: (input: RecordDonationInput) => Donation;
}

export const useMockStore = create<MockState>((set) => ({
  needs: [...MOCK_NEEDS],
  wallOfHonor: [...MOCK_WALL_OF_HONOR],
  donations: [...MOCK_DONATIONS],

  recordDonation: (input) => {
    const now = new Date().toISOString();
    const stamp = Date.now();

    const donation: Donation = {
      id: `mock_d_${stamp}`,
      need_id: input.needId,
      user_id: null,
      amount: input.amount,
      is_anonymous: input.isAnonymous,
      display_name: input.isAnonymous ? null : input.displayName ?? null,
      message: input.isAnonymous ? null : input.message ?? null,
      // Stored for a future receipt path only — never surfaced in any UI.
      donor_email: input.email ?? null,
      stripe_payment_intent_id: `pi_mock_${stamp}`,
      stripe_subscription_id: input.isRecurring ? `sub_mock_${stamp}` : null,
      is_recurring: input.isRecurring,
      status: "completed",
      tax_receipt_sent: false,
      created_at: now,
    };

    set((state) => ({
      donations: [donation, ...state.donations],
      needs: state.needs.map((n) =>
        n.id === input.needId
          ? {
              ...n,
              raised_amount: n.raised_amount + input.amount,
              backer_count: n.backer_count + 1,
            }
          : n
      ),
      wallOfHonor: input.isAnonymous
        ? state.wallOfHonor
        : [
            {
              id: `mock_woh_${stamp}`,
              donation_id: donation.id,
              display_name: donation.display_name,
              graduation_year: null,
              message: donation.message,
              amount_display: input.amount,
              created_at: now,
            },
            ...state.wallOfHonor,
          ],
    }));

    return donation;
  },
}));
