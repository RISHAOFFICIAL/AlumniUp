// Public money trail: the Stage 3 state machine, made mechanical.
//
// Every need moves through these public states:
//   LIVE -> FUNDED -> SENT -> RECEIVED -> AWAITING PROOF -> USE VERIFIED
// Exception states, all public with a plain-language reason:
//   DELAYED, CANCELLED, PROOF OVERDUE, UNFUNDED AT CLOSE.
// DRAFT and IN REVIEW are never public.
//
// Rules enforced here (Stage 3 + Oct 19 proof-of-use addendum + Stage 7
// refund/delay/redirect policy):
// - Every status change writes a dated entry to the need's public trail.
// - After receipt confirmation the school has 30 days to file proof of use.
//   From day 31 the need shows PROOF OVERDUE and the school cannot post new
//   needs or receive new funds until the proof is filed.
// - A DELAYED reason must be updated at least every 14 days.
// - A cancelled need (before disbursement) lets every donor choose a full
//   refund or a redirect to another open need at the same school. No response
//   in 30 days means a refund.
// - After disbursement, gifts cannot be refunded; receipt confirmation and
//   the outcome post are the donor's record.
//
// This module is framework-agnostic and shared by the mock store, the API
// routes, and the UI. The Supabase mirror lives in
// supabase/migrations/20261118_money_trail.sql.

import type { Need, TrailStatus, TrailEventType } from "@/types";

export const PROOF_WINDOW_DAYS = 30;
export const DELAY_UPDATE_DAYS = 14;
export const CANCEL_RESPONSE_DAYS = 30;

// Allowed transitions. DELAYED can be entered from any funded-or-later
// state and returns to the state it came from (tracked by the trail entry's
// from_status). CANCELLED is only allowed before disbursement.
export const TRAIL_TRANSITIONS: Record<TrailStatus, TrailStatus[]> = {
  draft: ["in_review", "cancelled"],
  in_review: ["live", "cancelled"],
  live: ["funded", "cancelled", "unfunded_at_close"],
  funded: ["sent", "delayed", "cancelled", "unfunded_at_close"],
  sent: ["received", "delayed"],
  received: ["awaiting_proof"],
  awaiting_proof: ["use_verified", "proof_overdue"],
  use_verified: [],
  delayed: ["funded", "sent", "received", "cancelled"],
  cancelled: [],
  proof_overdue: ["awaiting_proof", "use_verified"],
  unfunded_at_close: ["live", "cancelled"],
};

export function canTransition(from: TrailStatus, to: TrailStatus): boolean {
  return (TRAIL_TRANSITIONS[from] ?? []).includes(to);
}

// The event type recorded for a transition, for the public trail.
export const TRANSITION_EVENTS: Record<string, TrailEventType> = {
  "draft->in_review": "posted",
  "in_review->live": "approved",
  "live->funded": "funded",
  "funded->sent": "disbursed",
  "sent->received": "received",
  "received->awaiting_proof": "proof_submitted",
  "awaiting_proof->use_verified": "proof_verified",
  "awaiting_proof->proof_overdue": "proof_overdue",
  "proof_overdue->awaiting_proof": "proof_submitted",
  "proof_overdue->use_verified": "proof_verified",
  "funded->delayed": "delayed",
  "sent->delayed": "delayed",
  "received->delayed": "delayed",
  "delayed->funded": "delay_updated",
  "delayed->sent": "delay_updated",
  "delayed->received": "delay_updated",
  "live->cancelled": "cancelled",
  "funded->cancelled": "cancelled",
  "delayed->cancelled": "cancelled",
  "draft->cancelled": "cancelled",
  "in_review->cancelled": "cancelled",
  "live->unfunded_at_close": "cancelled",
  "funded->unfunded_at_close": "cancelled",
  "unfunded_at_close->live": "extended",
  "unfunded_at_close->cancelled": "cancelled",
};

export function eventForTransition(from: TrailStatus, to: TrailStatus): TrailEventType {
  return TRANSITION_EVENTS[`${from}->${to}`] ?? "delay_updated";
}

// Resolve the public trail state for a need. Prefers the stored
// trail_status; falls back to the legacy workflow status so rows created
// before the migration still display a real money state.
export function trailStatusForNeed(need: Need): TrailStatus {
  if (need.trail_status) return need.trail_status;
  switch (need.status) {
    case "pending":
      return "in_review";
    case "active":
      return "live";
    case "funded":
      return "funded";
    case "closed":
      return "unfunded_at_close";
    case "rejected":
      return "cancelled";
    default:
      return "live";
  }
}

// Legacy workflow status kept in step with a trail transition, so the
// homepage feed (which filters on `status`) keeps working.
export function legacyStatusForTrail(trail: TrailStatus): Need["status"] {
  switch (trail) {
    case "draft":
    case "in_review":
      return "pending";
    case "live":
      return "active";
    case "funded":
    case "sent":
    case "received":
    case "awaiting_proof":
    case "use_verified":
    case "delayed":
    case "proof_overdue":
      return "funded";
    case "cancelled":
    case "unfunded_at_close":
      return "closed";
    default:
      return "active";
  }
}

// States in which the public can see the need at all.
export function isPublicTrailStatus(status: TrailStatus): boolean {
  return !["draft", "in_review"].includes(status);
}

// States in which the need still accepts donations.
export function acceptsDonations(status: TrailStatus): boolean {
  return status === "live";
}

// Proof of use is due 30 days after receipt confirmation.
export function proofDueDate(receivedAt: string): string {
  const d = new Date(receivedAt);
  d.setDate(d.getDate() + PROOF_WINDOW_DAYS);
  return d.toISOString();
}

// True when proof is past due and the need has not been verified yet.
// A need in this state blocks its school from posting new needs.
export function isProofOverdue(need: Need, now: Date = new Date()): boolean {
  const status = trailStatusForNeed(need);
  if (status === "proof_overdue") return true;
  if (status !== "awaiting_proof" && status !== "received") return false;
  const due = need.proof_due_at ?? (need.received_at ? proofDueDate(need.received_at) : null);
  if (!due) return false;
  return new Date(due).getTime() < now.getTime();
}

// Days remaining in the proof window (negative when overdue).
export function proofDaysRemaining(need: Need, now: Date = new Date()): number | null {
  const due = need.proof_due_at ?? (need.received_at ? proofDueDate(need.received_at) : null);
  if (!due) return null;
  return Math.ceil((new Date(due).getTime() - now.getTime()) / 86_400_000);
}

// True when a DELAYED reason is stale (not updated in 14 days).
export function isDelayUpdateOverdue(need: Need, now: Date = new Date()): boolean {
  if (trailStatusForNeed(need) !== "delayed") return false;
  const updated = need.delay_updated_at ?? need.updated_at;
  if (!updated) return false;
  return now.getTime() - new Date(updated).getTime() > DELAY_UPDATE_DAYS * 86_400_000;
}

// The next operator/school action for a need, used by the portal and admin.
export function nextTrailAction(need: Need): {
  action: "approve" | "disburse" | "confirm_receipt" | "submit_proof" | "verify_proof" | "update_delay" | "resolve_cancel" | null;
  label: string;
} {
  const status = trailStatusForNeed(need);
  switch (status) {
    case "in_review":
      return { action: "approve", label: "Approve or reject this need" };
    case "funded":
      return { action: "disburse", label: "Record the disbursement to the school" };
    case "sent":
      return { action: "confirm_receipt", label: "Confirm the school received the funds" };
    case "received":
    case "awaiting_proof":
      return isProofOverdue(need)
        ? { action: "submit_proof", label: "Proof of use is overdue. File it now." }
        : { action: "submit_proof", label: "Submit proof of use" };
    case "proof_overdue":
      return { action: "submit_proof", label: "Proof of use is overdue. File it now." };
    case "delayed":
      return { action: "update_delay", label: "Update the delay reason" };
    case "cancelled":
      return { action: "resolve_cancel", label: "Resolve donor refunds or redirects" };
    default:
      return { action: null, label: "" };
  }
}

export function formatTrailDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
