// Mock donation state (Zustand). In preview mode there is no server, so a
// completed "donation" is client-side state. This store is the single source of
// truth the mock hooks read from, which is what makes progress bars, the Wall
// of Honor, and the class-year leaderboard move after a mock donation.
//
// The store also owns the public money trail in mock mode: every trail
// transition goes through `transitionNeed`, which validates the move against
// src/lib/trail.ts, updates the need's dated fields, and appends a dated
// trail entry. The live-mode mirror is POST /api/needs/[id]/trail.
//
// Real mode bypasses this entirely — hooks go to Supabase, and donations POST
// through /api/checkout.

import { create } from "zustand";
import {
  MOCK_NEEDS,
  MOCK_WALL_OF_HONOR,
  MOCK_DONATIONS,
  MOCK_TRAIL_ENTRIES,
  MOCK_PROOF_PACKETS,
  MOCK_DONATION_CHOICES,
} from "@/lib/data/mock";
import {
  canTransition,
  eventForTransition,
  legacyStatusForTrail,
  proofDueDate,
  trailStatusForNeed,
} from "@/lib/trail";
import type {
  Donation,
  DonationChoice,
  Need,
  ProofPacket,
  TrailEntry,
  TrailStatus,
  WallOfHonorEntry,
} from "@/types";

export interface RecordDonationInput {
  needId: string;
  amount: number;
  isAnonymous: boolean;
  isRecurring: boolean;
  displayName?: string | null;
  email?: string | null;
  message?: string | null;
}

export interface TransitionInput {
  needId: string;
  to: TrailStatus;
  note?: string | null;
  actorRole?: TrailEntry["actor_role"];
  // Action-specific fields, applied to the need when present.
  receivedBy?: string;
  delayedReason?: string;
  cancelledReason?: string;
  disbursementStructure?: Need["disbursement_structure"];
}

export interface ProofInput {
  needId: string;
  finalAmountSpent: number;
  invoicesNote: string;
  attestedBy: string;
}

interface MockState {
  needs: Need[];
  wallOfHonor: WallOfHonorEntry[];
  donations: Donation[];
  trailEntries: TrailEntry[];
  proofPackets: ProofPacket[];
  donationChoices: DonationChoice[];
  recordDonation: (input: RecordDonationInput) => Donation;
  transitionNeed: (input: TransitionInput) => boolean;
  updateDelayReason: (needId: string, reason: string) => boolean;
  confirmReceipt: (needId: string, confirmedBy: string) => boolean;
  recordDisbursement: (
    needId: string,
    structure: Need["disbursement_structure"],
    note?: string
  ) => boolean;
  submitProof: (input: ProofInput) => boolean;
  verifyProof: (needId: string, reviewNotes?: string) => boolean;
  requestProofInfo: (needId: string, reviewNotes: string) => boolean;
  recordDonationChoice: (
    donationId: string,
    choice: "refund" | "redirect",
    redirectNeedId?: string | null
  ) => boolean;
  cancelMonthlyDonation: (donationId: string) => boolean;
}

function newTrailEntry(
  needId: string,
  from: TrailStatus,
  to: TrailStatus,
  note: string | null,
  actorRole: TrailEntry["actor_role"]
): TrailEntry {
  return {
    id: `mock_trail_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    need_id: needId,
    event_type: eventForTransition(from, to),
    from_status: from,
    to_status: to,
    note: note ?? null,
    actor_role: actorRole ?? null,
    created_at: new Date().toISOString(),
  };
}

export const useMockStore = create<MockState>((set, get) => ({
  needs: [...MOCK_NEEDS],
  wallOfHonor: [...MOCK_WALL_OF_HONOR],
  donations: [...MOCK_DONATIONS],
  trailEntries: [...MOCK_TRAIL_ENTRIES],
  proofPackets: [...MOCK_PROOF_PACKETS],
  donationChoices: [...MOCK_DONATION_CHOICES],

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
      stripe_checkout_session_id: `cs_mock_${stamp}`,
      stripe_subscription_id: input.isRecurring ? `sub_mock_${stamp}` : null,
      is_recurring: input.isRecurring,
      status: "completed",
      tax_receipt_sent: false,
      created_at: now,
    };

    // A donation that reaches the goal moves the need LIVE -> FUNDED and
    // writes the dated trail entry, exactly like the live webhook does.
    const entries: TrailEntry[] = [];
    const needs = get().needs.map((n) => {
      if (n.id !== input.needId) return n;
      const raised = n.raised_amount + input.amount;
      const next: Need = {
        ...n,
        raised_amount: raised,
        backer_count: n.backer_count + 1,
      };
      const current = trailStatusForNeed(n);
      if (current === "live" && raised >= n.goal_amount) {
        next.trail_status = "funded";
        next.status = "funded";
        next.funded_at = now;
        next.updated_at = now;
        entries.push(
          newTrailEntry(
            n.id,
            "live",
            "funded",
            `Goal of $${n.goal_amount.toLocaleString()} reached.`,
            "system"
          )
        );
      }
      return next;
    });

    set((state) => ({
      donations: [donation, ...state.donations],
      needs,
      trailEntries: [...state.trailEntries, ...entries],
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

  transitionNeed: (input) => {
    const need = get().needs.find((n) => n.id === input.needId);
    if (!need) return false;
    const from = trailStatusForNeed(need);
    if (!canTransition(from, input.to)) return false;

    const now = new Date().toISOString();
    const next: Need = {
      ...need,
      trail_status: input.to,
      status: legacyStatusForTrail(input.to),
      updated_at: now,
    };
    // Dated trail fields, kept in step with the transition.
    if (input.to === "funded") next.funded_at = now;
    if (input.to === "sent") {
      next.sent_at = now;
      if (input.disbursementStructure) next.disbursement_structure = input.disbursementStructure;
    }
    if (input.to === "received") {
      next.received_at = now;
      next.received_by = input.receivedBy ?? need.submitted_by_name ?? "School";
      next.proof_due_at = proofDueDate(now);
    }
    if (input.to === "delayed") {
      next.delayed_reason = input.delayedReason ?? null;
      next.delay_updated_at = now;
    }
    if (input.to === "cancelled") {
      next.cancelled_reason = input.cancelledReason ?? null;
    }
    // Leaving DELAYED keeps the old reason on the trail entries, but the
    // live reason clears so the badge does not linger.
    if (from === "delayed" && input.to !== "delayed") {
      next.delayed_reason = null;
      next.delay_updated_at = null;
    }

    const entry = newTrailEntry(
      need.id,
      from,
      input.to,
      input.note ?? null,
      input.actorRole ?? "platform_admin"
    );

    set((state) => ({
      needs: state.needs.map((n) => (n.id === need.id ? next : n)),
      trailEntries: [...state.trailEntries, entry],
    }));
    return true;
  },

  updateDelayReason: (needId, reason) => {
    const need = get().needs.find((n) => n.id === needId);
    if (!need || trailStatusForNeed(need) !== "delayed") return false;
    const now = new Date().toISOString();
    const entry: TrailEntry = {
      id: `mock_trail_${Date.now()}`,
      need_id: needId,
      event_type: "delay_updated",
      from_status: "delayed",
      to_status: "delayed",
      note: reason,
      actor_role: "platform_admin",
      created_at: now,
    };
    set((state) => ({
      needs: state.needs.map((n) =>
        n.id === needId ? { ...n, delayed_reason: reason, delay_updated_at: now, updated_at: now } : n
      ),
      trailEntries: [...state.trailEntries, entry],
    }));
    return true;
  },

  confirmReceipt: (needId, confirmedBy) => {    const ok = get().transitionNeed({
      needId,
      to: "received",
      note: `Confirmed by ${confirmedBy}. Proof of use due in 30 days.`,
      actorRole: "school_admin",
      receivedBy: confirmedBy,
    });
    if (!ok) return false;
    // Receipt confirmation opens the proof window: RECEIVED -> AWAITING PROOF.
    return get().transitionNeed({
      needId,
      to: "awaiting_proof",
      note: "Proof of use is due within 30 days of receipt.",
      actorRole: "system",
    });
  },

  recordDisbursement: (needId, structure, note) => {
    return get().transitionNeed({
      needId,
      to: "sent",
      note:
        note ??
        `Funds sent through Childs Play Foundation, Inc. (${structure === "direct_vendor" ? "direct vendor payment" : structure === "tranches" ? "tranches" : "single payment"}).`,
      actorRole: "platform_admin",
      disbursementStructure: structure,
    });
  },

  submitProof: (input) => {
    const need = get().needs.find((n) => n.id === input.needId);
    if (!need) return false;
    const status = trailStatusForNeed(need);
    if (status !== "received" && status !== "awaiting_proof" && status !== "proof_overdue") {
      return false;
    }
    const now = new Date().toISOString();
    const packet: ProofPacket = {
      id: `mock_pp_${Date.now()}`,
      need_id: input.needId,
      final_amount_spent: input.finalAmountSpent,
      invoices_note: input.invoicesNote,
      completion_photo_url: null,
      attested_by: input.attestedBy,
      attested_at: now,
      status: "submitted",
      review_notes: null,
      created_at: now,
      updated_at: now,
    };
    set((state) => ({
      proofPackets: [
        ...state.proofPackets.filter((p) => p.need_id !== input.needId),
        packet,
      ],
    }));
    // Filing proof moves the need to AWAITING PROOF (or out of PROOF OVERDUE).
    if (status === "proof_overdue") {
      return get().transitionNeed({
        needId: input.needId,
        to: "awaiting_proof",
        note: `Proof of use filed: $${input.finalAmountSpent.toLocaleString()} spent. Attested by ${input.attestedBy}.`,
        actorRole: "school_staff",
      });
    }
    if (status === "received") {
      return get().transitionNeed({
        needId: input.needId,
        to: "awaiting_proof",
        note: `Proof of use filed: $${input.finalAmountSpent.toLocaleString()} spent. Attested by ${input.attestedBy}.`,
        actorRole: "school_staff",
      });
    }
    return true;
  },

  verifyProof: (needId, reviewNotes) => {
    const now = new Date().toISOString();
    set((state) => ({
      proofPackets: state.proofPackets.map((p) =>
        p.need_id === needId
          ? { ...p, status: "verified" as const, review_notes: reviewNotes ?? null, updated_at: now }
          : p
      ),
    }));
    return get().transitionNeed({
      needId,
      to: "use_verified",
      note: reviewNotes ?? "Fiscal sponsor verified the funds were spent as stated.",
      actorRole: "cpf_admin",
    });
  },

  requestProofInfo: (needId, reviewNotes) => {
    const now = new Date().toISOString();
    set((state) => ({
      proofPackets: state.proofPackets.map((p) =>
        p.need_id === needId
          ? { ...p, status: "needs_more_info" as const, review_notes: reviewNotes, updated_at: now }
          : p
      ),
    }));
    // Requesting more info writes a trail entry but does not change state.
    const need = get().needs.find((n) => n.id === needId);
    if (!need) return false;
    const entry: TrailEntry = {
      id: `mock_trail_${Date.now()}`,
      need_id: needId,
      event_type: "proof_requested",
      from_status: trailStatusForNeed(need),
      to_status: trailStatusForNeed(need),
      note: reviewNotes,
      actor_role: "cpf_admin",
      created_at: now,
    };
    set((state) => ({ trailEntries: [...state.trailEntries, entry] }));
    return true;
  },

  recordDonationChoice: (donationId, choice, redirectNeedId) => {
    const existing = get().donationChoices.find((c) => c.donation_id === donationId);
    if (existing) return false;
    const now = new Date().toISOString();
    const record: DonationChoice = {
      id: `mock_choice_${Date.now()}`,
      donation_id: donationId,
      choice,
      redirect_need_id: choice === "redirect" ? redirectNeedId ?? null : null,
      created_at: now,
      resolved_at: null,
    };
    const donation = get().donations.find((d) => d.id === donationId);
    set((state) => ({
      donationChoices: [...state.donationChoices, record],
      donations:
        choice === "refund" && donation
          ? state.donations.map((d) =>
              d.id === donationId ? { ...d, status: "refunded" as const } : d
            )
          : state.donations,
    }));
    // A refund or redirect writes a trail entry on the cancelled need.
    if (donation) {
      const entry: TrailEntry = {
        id: `mock_trail_${Date.now()}`,
        need_id: donation.need_id,
        event_type: choice === "refund" ? "refund_issued" : "redirected",
        from_status: "cancelled",
        to_status: "cancelled",
        note:
          choice === "refund"
            ? `A $${donation.amount.toLocaleString()} gift was refunded to the original payment method.`
            : "A gift was redirected to another open need at the same school.",
        actor_role: "donor",
        created_at: now,
      };
      set((state) => ({ trailEntries: [...state.trailEntries, entry] }));
    }
    return true;
  },

  cancelMonthlyDonation: (donationId) => {
    const donation = get().donations.find((d) => d.id === donationId);
    if (!donation || !donation.is_recurring) return false;
    set((state) => ({
      donations: state.donations.map((d) =>
        d.id === donationId ? { ...d, stripe_subscription_id: null, is_recurring: false } : d
      ),
    }));
    return true;
  },
}));
