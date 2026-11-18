"use client";

// S14 Disbursements: record each disbursement (to the school, through the
// fiscal sponsor, with its date) so the public status can advance honestly
// (Stage 2 story 15). Recording a disbursement moves the need to SENT;
// only the school's confirmation moves it to Received.

import { useState } from "react";
import { useDisbursements, useAllNeeds } from "@/hooks";
import { useMockStore } from "@/store/mock";
import { formatCurrency, formatDate, StatusPill } from "../ui";
import { TrailStatusBadge } from "@/components/MoneyTrail";
import { DISBURSEMENT_STRUCTURE_LABELS, type DisbursementStructure, type Need } from "@/types";
import { trailStatusForNeed } from "@/lib/trail";

const IS_MOCK = (process.env.NEXT_PUBLIC_DATA_SOURCE ?? "mock") === "mock";

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  processed: "Processed",
  confirmed: "Confirmed",
};

function RecordDisbursementForm({ needs }: { needs: Need[] }) {
  const recordDisbursement = useMockStore((s) => s.recordDisbursement);
  const [needId, setNeedId] = useState("");
  const [structure, setStructure] = useState<DisbursementStructure>("single");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const awaiting = needs.filter((n) => trailStatusForNeed(n) === "funded");
  const selected = needs.find((n) => n.id === needId);

  async function submit() {
    if (!needId) {
      setNotice("Pick a funded need.");
      return;
    }
    setBusy(true);
    setNotice(null);
    if (IS_MOCK) {
      const ok = recordDisbursement(needId, structure, note.trim() || undefined);
      setNotice(
        ok
          ? "Disbursement recorded. The need now shows Sent to School, and the school is prompted to confirm receipt."
          : "That need could not be marked as sent."
      );
      if (ok) {
        setNeedId("");
        setNote("");
      }
      setBusy(false);
      return;
    }
    try {
      const res = await fetch(`/api/needs/${needId}/trail`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "disburse", structure, note: note.trim() || undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setNotice(data?.error ?? "The disbursement could not be recorded.");
      } else {
        setNotice("Disbursement recorded. The need now shows Sent to School.");
        setNeedId("");
        setNote("");
      }
    } catch {
      setNotice("The disbursement could not be recorded. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card mt-6">
      <h2 className="font-serif text-xl font-semibold text-navy">Record a disbursement</h2>
      <p className="font-sans text-sm text-navy/60 mt-1">
        AlumniUp records the event. The fiscal sponsor moves the actual money. Recording moves
        the need to Sent and notifies the poster to watch for the funds.
      </p>

      {awaiting.length === 0 ? (
        <p className="font-sans text-sm text-navy/60 mt-4">
          No funded needs are awaiting disbursement.
        </p>
      ) : (
        <div className="grid gap-3 mt-4 sm:grid-cols-2">
          <div>
            <label className="font-sans text-xs text-navy/60 block mb-1">Funded need</label>
            <select
              value={needId}
              onChange={(e) => setNeedId(e.target.value)}
              className="border border-border rounded px-3 py-2 font-sans text-sm w-full focus:outline-none focus:border-navy"
            >
              <option value="">Choose a need…</option>
              {awaiting.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.title} · {formatCurrency(n.raised_amount)} raised
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="font-sans text-xs text-navy/60 block mb-1">Structure</label>
            <select
              value={structure}
              onChange={(e) => setStructure(e.target.value as DisbursementStructure)}
              className="border border-border rounded px-3 py-2 font-sans text-sm w-full focus:outline-none focus:border-navy"
            >
              {(Object.keys(DISBURSEMENT_STRUCTURE_LABELS) as DisbursementStructure[]).map((s) => (
                <option key={s} value={s}>
                  {DISBURSEMENT_STRUCTURE_LABELS[s]}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="font-sans text-xs text-navy/60 block mb-1">
              Note (appears on the public trail)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Sent by ACH to the school district account on Mar 12"
              className="border border-border rounded px-3 py-2 font-sans text-sm w-full focus:outline-none focus:border-navy"
            />
          </div>
          {selected && (
            <p className="font-sans text-xs text-navy/60 sm:col-span-2">
              School receives {formatCurrency(Math.round(selected.raised_amount * 0.88 * 100) / 100)} of{" "}
              {formatCurrency(selected.raised_amount)} raised.
            </p>
          )}
          <div className="sm:col-span-2">
            <button
              type="button"
              disabled={busy || !needId}
              onClick={submit}
              className="btn-gold text-xs px-6 py-2.5 disabled:opacity-60"
            >
              Record disbursement
            </button>
            {notice && <p className="font-sans text-xs text-navy/70 mt-3">{notice}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminDisbursementsPage() {
  const { disbursements, loading } = useDisbursements();
  const { needs } = useAllNeeds();

  return (
    <section>
      <h1 className="font-serif text-3xl font-semibold text-navy">Disbursements</h1>
      <p className="font-sans text-sm text-navy/60 mt-1">
        Record payouts to schools via Childs Play Foundation, and the record of payouts already made.
      </p>

      <RecordDisbursementForm needs={needs} />

      <h2 className="font-serif text-2xl font-semibold text-navy mt-10">Record</h2>
      {loading ? (
        <p className="font-sans text-sm text-navy/50 mt-6">Loading…</p>
      ) : disbursements.length === 0 ? (
        <div className="card text-center mt-6">
          <p className="font-sans text-sm text-navy/70">No disbursements yet.</p>
        </div>
      ) : (
        <ul className="space-y-4 mt-6">
          {disbursements.map((d) => (
            <li key={d.id} className="card">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-serif text-lg font-semibold text-navy">{d.school_name}</h2>
                  <p className="font-sans text-xs text-navy/50 mt-1">
                    {d.need_title ?? "General disbursement"}
                  </p>
                </div>
                <StatusPill status={d.status} label={STATUS_LABELS[d.status]} />
              </div>

              <dl className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                <div>
                  <dt className="font-sans text-[11px] uppercase tracking-wide text-navy/50">Gross</dt>
                  <dd className="font-serif text-sm font-semibold text-navy mt-0.5">
                    {d.gross_amount != null ? formatCurrency(d.gross_amount) : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="font-sans text-[11px] uppercase tracking-wide text-navy/50">School (88%)</dt>
                  <dd className="font-sans text-sm text-navy mt-0.5">
                    {d.school_amount != null ? formatCurrency(d.school_amount) : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="font-sans text-[11px] uppercase tracking-wide text-navy/50">AlumniUp (7%)</dt>
                  <dd className="font-sans text-sm text-navy mt-0.5">
                    {d.alumniup_fee != null ? formatCurrency(d.alumniup_fee) : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="font-sans text-[11px] uppercase tracking-wide text-navy/50">CPF (5%)</dt>
                  <dd className="font-sans text-sm text-navy mt-0.5">
                    {d.cpf_fee != null ? formatCurrency(d.cpf_fee) : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="font-sans text-[11px] uppercase tracking-wide text-navy/50">Requested</dt>
                  <dd className="font-sans text-sm text-navy mt-0.5">{formatDate(d.requested_at)}</dd>
                </div>
              </dl>

              {d.notes ? (
                <p className="font-sans text-xs text-navy/50 mt-3">{d.notes}</p>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-10">
        <h2 className="font-serif text-2xl font-semibold text-navy">Needs by trail state</h2>
        <ul className="space-y-3 mt-4">
          {needs.map((n) => (
            <li key={n.id} className="flex items-center justify-between gap-4 border border-border rounded-md px-4 py-3 bg-white">
              <div className="min-w-0">
                <a href={`/needs/${n.id}`} className="font-sans text-sm font-medium text-navy hover:text-gold">
                  {n.title}
                </a>
                <p className="font-sans text-xs text-navy/50">
                  {n.school?.name ?? ""} · {formatCurrency(n.raised_amount)} of {formatCurrency(n.goal_amount)}
                </p>
              </div>
              <TrailStatusBadge status={trailStatusForNeed(n)} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
