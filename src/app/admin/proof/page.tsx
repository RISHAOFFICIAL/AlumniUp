"use client";

// S14 Proof Queue: the fiscal sponsor (or the operator acting for the
// sponsor) reviews proof-of-use packets, marks the need USE VERIFIED, or
// requests specific missing items (Stage 2 story A19).

import { useState } from "react";
import { useProofQueue } from "@/hooks";
import { useMockStore } from "@/store/mock";
import { formatCurrency, formatDate } from "../ui";
import { TrailStatusBadge } from "@/components/MoneyTrail";
import { useNeed } from "@/hooks";
import { trailStatusForNeed } from "@/lib/trail";
import type { ProofPacket } from "@/types";

const IS_MOCK = (process.env.NEXT_PUBLIC_DATA_SOURCE ?? "mock") === "mock";

const PACKET_LABELS: Record<string, string> = {
  draft: "Draft",
  submitted: "Submitted",
  verified: "Verified",
  needs_more_info: "Needs more info",
};

function ProofRow({
  packet,
}: {
  packet: ProofPacket & { need_title: string; school_name: string };
}) {
  const verifyProof = useMockStore((s) => s.verifyProof);
  const requestProofInfo = useMockStore((s) => s.requestProofInfo);
  const { need } = useNeed(packet.need_id);
  const [reviewNotes, setReviewNotes] = useState("");
  const [requesting, setRequesting] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const reviewable = packet.status === "submitted" || packet.status === "needs_more_info";

  async function callTrail(action: "proof_verify" | "proof_request_info") {
    if (IS_MOCK) return { ok: true };
    const res = await fetch(`/api/needs/${packet.need_id}/trail`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, reviewNotes: reviewNotes.trim() || undefined }),
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, error: data?.error as string | undefined };
  }

  async function verify() {
    setBusy(true);
    setNotice(null);
    if (IS_MOCK) {
      const ok = verifyProof(packet.need_id, reviewNotes.trim() || undefined);
      setNotice(
        ok
          ? "Verified. The need now shows Use Verified on its public trail."
          : "That packet could not be verified."
      );
      setBusy(false);
      return;
    }
    const res = await callTrail("proof_verify");
    setNotice(res.ok ? "Verified. Donors have been emailed." : res.error ?? "Verification failed.");
    setBusy(false);
  }

  async function requestInfo() {
    if (!reviewNotes.trim()) {
      setNotice("Say what is missing, so the school can file it.");
      return;
    }
    setBusy(true);
    setNotice(null);
    if (IS_MOCK) {
      requestProofInfo(packet.need_id, reviewNotes.trim());
      setNotice("More information requested. The school sees the note in the portal.");
      setRequesting(false);
      setBusy(false);
      return;
    }
    const res = await callTrail("proof_request_info");
    setNotice(res.ok ? "More information requested." : res.error ?? "That request failed.");
    if (res.ok) setRequesting(false);
    setBusy(false);
  }

  return (
    <li className="card">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <a href={`/needs/${packet.need_id}`} className="font-serif text-lg font-semibold text-navy hover:text-gold">
            {packet.need_title}
          </a>
          <p className="font-sans text-xs text-navy/50 mt-1">
            {packet.school_name} · Submitted {formatDate(packet.created_at)}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <span className="inline-block px-2 py-0.5 rounded-full text-xs font-sans bg-navy/10 text-navy">
            {PACKET_LABELS[packet.status]}
          </span>
          {need && <TrailStatusBadge status={trailStatusForNeed(need)} />}
        </div>
      </div>

      <dl className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
        <div>
          <dt className="font-sans text-[11px] uppercase tracking-wide text-navy/50">Final amount spent</dt>
          <dd className="font-serif text-sm font-semibold text-navy mt-0.5">
            {packet.final_amount_spent != null ? formatCurrency(packet.final_amount_spent) : "—"}
          </dd>
        </div>
        <div>
          <dt className="font-sans text-[11px] uppercase tracking-wide text-navy/50">Attested by</dt>
          <dd className="font-sans text-sm text-navy mt-0.5">{packet.attested_by ?? "—"}</dd>
        </div>
        <div>
          <dt className="font-sans text-[11px] uppercase tracking-wide text-navy/50">Attested</dt>
          <dd className="font-sans text-sm text-navy mt-0.5">
            {packet.attested_at ? formatDate(packet.attested_at) : "—"}
          </dd>
        </div>
      </dl>

      {packet.invoices_note && (
        <p className="font-sans text-sm text-navy/70 mt-3">
          <span className="font-semibold text-navy">Invoices/receipts: </span>
          {packet.invoices_note}
        </p>
      )}
      {packet.review_notes && (
        <p className="font-sans text-sm text-navy/70 mt-2">
          <span className="font-semibold text-navy">Review notes: </span>
          {packet.review_notes}
        </p>
      )}

      {reviewable && (
        <div className="mt-4 space-y-3">
          <label className="font-sans text-xs text-navy/60 block">
            Review notes (shown on the public trail when verified)
          </label>
          <textarea
            value={reviewNotes}
            onChange={(e) => setReviewNotes(e.target.value)}
            rows={2}
            placeholder="e.g. Verified against invoices. $60 unspent, returned."
            className="border border-border rounded px-3 py-2 font-sans text-sm w-full focus:outline-none focus:border-navy"
          />
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={busy}
              onClick={verify}
              className="btn-gold text-xs px-5 py-2 disabled:opacity-60"
            >
              Mark Use Verified
            </button>
            {!requesting ? (
              <button
                type="button"
                onClick={() => setRequesting(true)}
                className="btn-ghost text-xs px-5 py-2"
              >
                Request more info
              </button>
            ) : (
              <button
                type="button"
                disabled={busy || !reviewNotes.trim()}
                onClick={requestInfo}
                className="btn-ghost text-xs px-5 py-2 disabled:opacity-60"
              >
                Send request
              </button>
            )}
          </div>
        </div>
      )}

      {notice && <p className="font-sans text-xs text-navy/70 mt-3">{notice}</p>}
    </li>
  );
}

export default function AdminProofPage() {
  const { queue, loading } = useProofQueue();

  return (
    <section>
      <h1 className="font-serif text-3xl font-semibold text-navy">Proof Queue</h1>
      <p className="font-sans text-sm text-navy/60 mt-1">
        Proof-of-use packets from schools. Verify the packet to mark the need Use Verified, or
        request the specific items that are missing.
      </p>

      {loading ? (
        <p className="font-sans text-sm text-navy/50 mt-6">Loading…</p>
      ) : queue.length === 0 ? (
        <div className="card text-center mt-6">
          <p className="font-sans text-sm text-navy/70">No proof packets yet.</p>
        </div>
      ) : (
        <ul className="space-y-4 mt-6">
          {queue.map((packet) => (
            <ProofRow key={packet.id} packet={packet} />
          ))}
        </ul>
      )}
    </section>
  );
}
