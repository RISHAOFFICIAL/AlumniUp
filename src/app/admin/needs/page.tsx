"use client";

// S14 Needs and Trail: the operator's view of every need's public money
// state, with the safety-valve actions. The trail may be late; it may
// never be silent. Marking a need DELAYED or CANCELLED always needs a
// public reason, and donors are emailed.

import { useState } from "react";
import { useAllNeeds, useTrail } from "@/hooks";
import { useMockStore } from "@/store/mock";
import { formatCurrency } from "../ui";
import MoneyTrail, { TrailStatusBadge } from "@/components/MoneyTrail";
import { isDelayUpdateOverdue, trailStatusForNeed } from "@/lib/trail";
import type { Need } from "@/types";

const IS_MOCK = (process.env.NEXT_PUBLIC_DATA_SOURCE ?? "mock") === "mock";

function NeedTrailRow({ need }: { need: Need }) {
  const transitionNeed = useMockStore((s) => s.transitionNeed);
  const updateDelayReason = useMockStore((s) => s.updateDelayReason);
  const [showTrail, setShowTrail] = useState(false);
  const [action, setAction] = useState<"delay" | "cancel" | "delay_update" | null>(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const status = trailStatusForNeed(need);
  const { entries } = useTrail(need.id);
  const canDelay = ["funded", "sent", "received"].includes(status);
  const canCancel = ["live", "funded", "delayed"].includes(status);
  const delayStale = isDelayUpdateOverdue(need);

  async function submit() {
    if (!action || !reason.trim()) {
      setNotice("A public reason is required.");
      return;
    }
    setBusy(true);
    setNotice(null);
    if (IS_MOCK) {
      let ok = false;
      if (action === "delay") {
        ok = transitionNeed({ needId: need.id, to: "delayed", note: reason.trim(), actorRole: "platform_admin", delayedReason: reason.trim() });
      } else if (action === "cancel") {
        ok = transitionNeed({ needId: need.id, to: "cancelled", note: `${reason.trim()} Donors choose a refund or a redirect.`, actorRole: "platform_admin", cancelledReason: reason.trim() });
      } else {
        // delay_update: refresh the reason without changing state.
        ok = updateDelayReason(need.id, reason.trim());
      }
      setNotice(ok ? "Saved. The public trail shows the new reason." : "That action is not allowed from this state.");
      if (ok) {
        setAction(null);
        setReason("");
      }
      setBusy(false);
      return;
    }
    try {
      const res = await fetch(`/api/needs/${need.id}/trail`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason: reason.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setNotice(data?.error ?? "That action failed.");
      } else {
        setNotice("Saved. Donors have been emailed.");
        setAction(null);
        setReason("");
      }
    } catch {
      setNotice("That action failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className="card">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <a href={`/needs/${need.id}`} className="font-serif text-lg font-semibold text-navy hover:text-gold">
            {need.title}
          </a>
          <p className="font-sans text-xs text-navy/50 mt-1">
            {need.school?.name ?? ""} · {formatCurrency(need.raised_amount)} of{" "}
            {formatCurrency(need.goal_amount)} · {need.backer_count} backer
            {need.backer_count !== 1 ? "s" : ""}
          </p>
        </div>
        <TrailStatusBadge status={status} />
      </div>

      {status === "delayed" && need.delayed_reason && (
        <p className="font-sans text-sm text-navy/70 mt-3">
          <span className="font-semibold text-navy">Delay reason: </span>
          {need.delayed_reason}
          {delayStale && (
            <span className="text-red-700 font-medium"> The reason is over 14 days old. Update it.</span>
          )}
        </p>
      )}

      <div className="flex flex-wrap gap-3 mt-4">
        <button type="button" onClick={() => setShowTrail((v) => !v)} className="btn-ghost text-xs px-4 py-2">
          {showTrail ? "Hide trail" : "Show trail"}
        </button>
        {canDelay && (
          <button
            type="button"
            onClick={() => setAction(action === "delay" ? null : "delay")}
            className="btn-ghost text-xs px-4 py-2"
          >
            Mark delayed
          </button>
        )}
        {status === "delayed" && (
          <button
            type="button"
            onClick={() => setAction(action === "delay_update" ? null : "delay_update")}
            className="btn-ghost text-xs px-4 py-2"
          >
            Update delay reason
          </button>
        )}
        {canCancel && (
          <button
            type="button"
            onClick={() => setAction(action === "cancel" ? null : "cancel")}
            className="btn-ghost text-xs px-4 py-2"
          >
            Cancel need
          </button>
        )}
      </div>

      {action && (
        <div className="mt-4 space-y-3">
          <label className="font-sans text-xs text-navy/60 block">
            {action === "cancel"
              ? "Public reason for cancelling (donors see this, and choose a refund or a redirect)"
              : action === "delay_update"
              ? "Updated public delay reason"
              : "Public reason for the delay (donors are emailed)"}
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            className="border border-border rounded px-3 py-2 font-sans text-sm w-full focus:outline-none focus:border-navy"
          />
          <div className="flex gap-3">
            <button
              type="button"
              disabled={busy || !reason.trim()}
              onClick={submit}
              className="btn-gold text-xs px-5 py-2 disabled:opacity-60"
            >
              {action === "cancel" ? "Cancel need" : action === "delay_update" ? "Update reason" : "Mark delayed"}
            </button>
            <button type="button" onClick={() => setAction(null)} className="btn-ghost text-xs px-5 py-2">
              Back
            </button>
          </div>
        </div>
      )}

      {notice && <p className="font-sans text-xs text-navy/70 mt-3">{notice}</p>}

      {showTrail && (
        <div className="mt-4 border-t border-border pt-4">
          <MoneyTrail need={need} entries={entries} />
        </div>
      )}
    </li>
  );
}

export default function AdminNeedsPage() {
  const { needs, loading } = useAllNeeds();

  return (
    <section>
      <h1 className="font-serif text-3xl font-semibold text-navy">Needs and Trail</h1>
      <p className="font-sans text-sm text-navy/60 mt-1">
        Every need&apos;s public money state. The trail may be late; it may never be silent.
      </p>

      {loading ? (
        <p className="font-sans text-sm text-navy/50 mt-6">Loading…</p>
      ) : needs.length === 0 ? (
        <div className="card text-center mt-6">
          <p className="font-sans text-sm text-navy/70">No needs yet.</p>
        </div>
      ) : (
        <ul className="space-y-4 mt-6">
          {needs.map((need) => (
            <NeedTrailRow key={need.id} need={need} />
          ))}
        </ul>
      )}
    </section>
  );
}
