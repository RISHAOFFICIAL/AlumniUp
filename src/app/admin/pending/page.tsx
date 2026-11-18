"use client";

// S12 Admin Review Queue: approve or reject needs before they go public.
// Rejecting requires a reason, which the poster sees (Stage 2 story 12).

import { useState } from "react";
import { mockGetPendingNeeds } from "@/lib/data/mock";
import type { Need } from "@/types";
import { formatCurrency } from "../ui";

export default function AdminPendingPage() {
  const [pending, setPending] = useState<Need[]>(() => mockGetPendingNeeds());
  const [busyId, setBusyId] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function setStatus(id: string, action: "approve" | "reject", reason?: string) {
    if (action === "reject" && !reason?.trim()) {
      setError("Rejecting a need requires a reason, which the poster sees.");
      return;
    }
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/needs/${id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setPending((prev) => prev.filter((n) => n.id !== id));
        setLastAction(
          `${action === "approve" ? "Approved" : "Rejected"} "${id.slice(0, 8)}…"`
        );
        setRejectingId(null);
        setRejectReason("");
      } else {
        setError(data?.error ?? "That action failed.");
      }
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section>
      <h1 className="font-serif text-3xl font-semibold text-navy">Pending Needs</h1>
      <p className="font-sans text-sm text-navy/60 mt-1">
        Funding needs awaiting review and approval before they go live. Nothing unapproved is
        visible to the public.
      </p>

      {lastAction && (
        <p className="font-sans text-xs text-navy/60 mt-3">{lastAction} (preview only)</p>
      )}
      {error && (
        <p className="font-sans text-sm text-red-700 mt-3">{error}</p>
      )}

      {pending.length === 0 ? (
        <div className="card text-center mt-6">
          <p className="font-sans text-sm text-navy/70">
            No pending needs. An empty review queue is a good day.
          </p>
        </div>
      ) : (
        <ul className="space-y-4 mt-6">
          {pending.map((need) => (
            <li key={need.id} className="card">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-serif text-lg font-semibold text-navy">{need.title}</h2>
                  <p className="font-sans text-xs text-navy/50 mt-1">
                    {need.school?.name ?? "Unknown school"} · {need.category} ·{" "}
                    {need.urgency === "high"
                      ? "High priority"
                      : need.urgency === "med"
                      ? "Medium priority"
                      : "Low priority"}
                  </p>
                </div>
                <p className="font-serif text-xl font-bold text-gold shrink-0">
                  {formatCurrency(need.goal_amount)}
                </p>
              </div>

              <p className="font-sans text-sm text-navy/70 mt-3">{need.description}</p>

              <p className="font-sans text-xs text-navy/50 mt-3">
                Submitted by {need.submitted_by_name ?? "—"}
                {need.submitted_by_title ? ` (${need.submitted_by_title})` : ""}
                {need.submitted_by_email ? ` · ${need.submitted_by_email}` : ""}
                {need.submitted_by_phone ? ` · ${need.submitted_by_phone}` : ""}
              </p>
              {need.minimum_amount != null && (
                <p className="font-sans text-xs text-navy/50 mt-1">
                  Minimum to begin: {formatCurrency(need.minimum_amount)}
                </p>
              )}

              {rejectingId === need.id ? (
                <div className="mt-4 space-y-3">
                  <label className="font-sans text-xs text-navy/60 block">
                    Reason for rejection (the poster sees this)
                  </label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    rows={2}
                    placeholder="e.g. The goal needs an itemized budget before it can go public."
                    className="border border-border rounded px-3 py-2 font-sans text-sm w-full focus:outline-none focus:border-navy"
                  />
                  <div className="flex gap-3">
                    <button
                      type="button"
                      disabled={busyId === need.id || !rejectReason.trim()}
                      onClick={() => setStatus(need.id, "reject", rejectReason)}
                      className="btn-ghost text-xs px-5 py-2 disabled:opacity-60"
                    >
                      Confirm rejection
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRejectingId(null);
                        setRejectReason("");
                      }}
                      className="btn-ghost text-xs px-5 py-2"
                    >
                      Back
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-3 mt-4">
                  <button
                    type="button"
                    disabled={busyId === need.id}
                    onClick={() => setStatus(need.id, "approve")}
                    className="btn-gold text-xs px-5 py-2 disabled:opacity-60"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    disabled={busyId === need.id}
                    onClick={() => setRejectingId(need.id)}
                    className="btn-ghost text-xs px-5 py-2 disabled:opacity-60"
                  >
                    Reject
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
