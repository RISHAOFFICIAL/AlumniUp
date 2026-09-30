"use client";

import { useState } from "react";
import { mockGetPendingNeeds } from "@/lib/data/mock";
import type { Need } from "@/types";
import { formatCurrency } from "../ui";

export default function AdminPendingPage() {
  const [pending, setPending] = useState<Need[]>(() => mockGetPendingNeeds());
  const [busyId, setBusyId] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState<string | null>(null);

  async function setStatus(id: string, action: "approve" | "reject") {
    setBusyId(id);
    try {
      const res = await fetch(`/api/needs/${id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        setPending((prev) => prev.filter((n) => n.id !== id));
        setLastAction(
          `${action === "approve" ? "Approved" : "Rejected"} "${id.slice(0, 8)}…"`
        );
      }
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section>
      <h1 className="font-serif text-3xl font-semibold text-navy">Pending Needs</h1>
      <p className="font-sans text-sm text-navy/60 mt-1">
        Funding needs awaiting review and approval before they go live.
      </p>

      {lastAction && (
        <p className="font-sans text-xs text-navy/60 mt-3">{lastAction} (preview only)</p>
      )}

      {pending.length === 0 ? (
        <div className="card text-center mt-6">
          <p className="font-sans text-sm text-navy/70">No pending needs.</p>
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
                  onClick={() => setStatus(need.id, "reject")}
                  className="btn-ghost text-xs px-5 py-2 disabled:opacity-60"
                >
                  Reject
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
