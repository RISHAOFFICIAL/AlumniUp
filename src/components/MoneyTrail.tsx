"use client";

// Public money trail: the dated timeline every donor sees on a need page,
// in My Donations, and in the school portal. Status is always a word, never
// color alone (Stage 3 accessibility rule).

import type { Need, TrailEntry, TrailStatus } from "@/types";
import { TRAIL_STATUS_LABELS, TRAIL_STATUS_DESCRIPTIONS, TRAIL_EVENT_LABELS } from "@/types";
import { formatTrailDate, isProofOverdue, proofDaysRemaining, trailStatusForNeed } from "@/lib/trail";

const BADGE_CLASSES: Record<TrailStatus, string> = {
  draft: "bg-navy/10 text-navy",
  in_review: "bg-gold/15 text-[#7A5C14]",
  live: "bg-green/15 text-green",
  funded: "bg-green/15 text-green",
  sent: "bg-gold/15 text-[#7A5C14]",
  received: "bg-green/15 text-green",
  awaiting_proof: "bg-gold/15 text-[#7A5C14]",
  use_verified: "bg-green/15 text-green",
  delayed: "bg-red-600/15 text-red-700",
  cancelled: "bg-red-600/15 text-red-700",
  proof_overdue: "bg-red-600/15 text-red-700",
  unfunded_at_close: "bg-navy/10 text-navy",
};

export function TrailStatusBadge({ status }: { status: TrailStatus }) {
  const cls = BADGE_CLASSES[status] ?? "bg-navy/10 text-navy";
  return (
    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-sans font-semibold whitespace-nowrap ${cls}`}>
      {TRAIL_STATUS_LABELS[status]}
    </span>
  );
}

// The five public milestones, in order, with the dates the need reached them.
const MILESTONES: { key: string; label: string; dateOf: (n: Need) => string | null | undefined }[] = [
  { key: "live", label: "Live", dateOf: (n) => n.approved_at ?? n.created_at },
  { key: "funded", label: "Funded", dateOf: (n) => n.funded_at },
  { key: "sent", label: "Sent", dateOf: (n) => n.sent_at },
  { key: "received", label: "Received", dateOf: (n) => n.received_at },
  { key: "use_verified", label: "Use Verified", dateOf: (n) => n.trail?.find((t) => t.event_type === "proof_verified")?.created_at },
];

const MILESTONE_ORDER = ["live", "funded", "sent", "received", "awaiting_proof", "use_verified"];

function milestoneIndex(status: TrailStatus): number {
  const idx = MILESTONE_ORDER.indexOf(status);
  if (idx >= 0) return idx;
  // Exception states sit where the need stalled.
  if (status === "delayed") return 2;
  if (status === "proof_overdue") return 4;
  return -1;
}

export default function MoneyTrail({ need, entries }: { need: Need; entries?: TrailEntry[] }) {
  const status = trailStatusForNeed(need);
  const trail = entries ?? need.trail ?? [];
  const currentIdx = milestoneIndex(status);
  const overdue = isProofOverdue(need);
  const daysLeft = proofDaysRemaining(need);
  const isException = ["delayed", "cancelled", "proof_overdue", "unfunded_at_close"].includes(status);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <TrailStatusBadge status={status} />
        <p className="font-sans text-sm text-navy/70">{TRAIL_STATUS_DESCRIPTIONS[status]}</p>
      </div>

      {status === "delayed" && need.delayed_reason && (
        <p className="mt-3 bg-red-600/5 border border-red-600/20 rounded-md px-4 py-3 font-sans text-sm text-navy/80">
          <span className="font-semibold text-navy">Why it is delayed: </span>
          {need.delayed_reason}
          {need.delay_updated_at && (
            <span className="text-navy/50"> (updated {formatTrailDate(need.delay_updated_at)})</span>
          )}
        </p>
      )}

      {status === "cancelled" && need.cancelled_reason && (
        <p className="mt-3 bg-red-600/5 border border-red-600/20 rounded-md px-4 py-3 font-sans text-sm text-navy/80">
          <span className="font-semibold text-navy">Why it was cancelled: </span>
          {need.cancelled_reason}
          <span className="block mt-1 text-navy/60">
            Donors choose a full refund or redirecting the gift to another open need at the same school.
            No response in 30 days means a refund.
          </span>
        </p>
      )}

      {(status === "awaiting_proof" || status === "proof_overdue") && (
        <p className={`mt-3 rounded-md px-4 py-3 font-sans text-sm ${overdue ? "bg-red-600/5 border border-red-600/20 text-navy/80" : "bg-gold/10 border border-gold/30 text-navy/80"}`}>
          {overdue
            ? "Proof of use is past due. The school cannot post new needs or receive new funds until it is filed."
            : daysLeft != null
            ? `Proof of use is due in ${daysLeft} day${daysLeft === 1 ? "" : "s"}${need.proof_due_at ? ` (${formatTrailDate(need.proof_due_at)})` : ""}.`
            : "Proof of use is due within 30 days of receipt."}
        </p>
      )}

      {/* Milestone stepper */}
      {!isException && (
        <ol className="mt-6 space-y-0">
          {MILESTONES.map((m, i) => {
            const reached = i <= currentIdx;
            const date = m.dateOf(need);
            const isCurrent = i === currentIdx;
            return (
              <li key={m.key} className="relative flex gap-3 pb-5 last:pb-0">
                {i < MILESTONES.length - 1 && (
                  <span
                    aria-hidden="true"
                    className={`absolute left-[9px] top-5 bottom-0 w-0.5 ${i < currentIdx ? "bg-green" : "bg-border"}`}
                  />
                )}
                <span
                  aria-hidden="true"
                  className={`relative z-10 mt-0.5 flex h-[19px] w-[19px] shrink-0 items-center justify-center rounded-full border-2 ${
                    reached ? "border-green bg-green text-white" : "border-border bg-white text-navy/30"
                  }`}
                >
                  {reached ? (
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-navy/20" />
                  )}
                </span>
                <div className="min-w-0">
                  <p className={`font-sans text-sm ${reached ? "font-semibold text-navy" : "text-navy/50"}`}>
                    {m.label}
                    {isCurrent && <span className="ml-2 text-xs font-normal text-gold">current step</span>}
                  </p>
                  <p className="font-sans text-xs text-navy/50">
                    {date ? formatTrailDate(date) : reached ? "Date on record" : "Not reached yet"}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      )}

      {/* Dated trail entries */}
      <div className="mt-6">
        <h3 className="font-sans text-xs font-semibold uppercase tracking-wider text-navy/50">
          Public trail
        </h3>
        {trail.length === 0 ? (
          <p className="font-sans text-sm text-navy/60 mt-2">
            The trail starts when this need is posted. Every step is dated here.
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            {trail.map((entry) => (
              <li key={entry.id} className="flex gap-3 font-sans text-sm">
                <span className="w-24 shrink-0 text-xs text-navy/50 pt-0.5">
                  {formatTrailDate(entry.created_at)}
                </span>
                <div className="min-w-0">
                  <p className="font-medium text-navy">{TRAIL_EVENT_LABELS[entry.event_type]}</p>
                  {entry.note && (
                    <p className="text-xs text-navy/60 mt-0.5 leading-relaxed">{entry.note}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
