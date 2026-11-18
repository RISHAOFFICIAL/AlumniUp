"use client";

import { useEffect, useState } from "react";
import { useAuth, useSchool, useSchoolNeeds, useSchoolDonations, useTrail, useProofPacket } from "@/hooks";
import { useMockStore } from "@/store/mock";
import { MOCK_PORTAL_SCHOOL_ID } from "@/lib/data/mock";
import MoneyTrail, { TrailStatusBadge } from "@/components/MoneyTrail";
import { isProofOverdue, nextTrailAction, proofDaysRemaining, trailStatusForNeed } from "@/lib/trail";
import type { Need } from "@/types";

const IS_MOCK = (process.env.NEXT_PUBLIC_DATA_SOURCE ?? "mock") === "mock";

function formatCurrency(n: number): string {
  return `$${n.toLocaleString()}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const DONATION_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  completed: "Completed",
  failed: "Failed",
  refunded: "Refunded",
};

const STATUS_CLASSES: Record<string, string> = {
  pending: "bg-gold/15 text-gold",
  active: "bg-green/15 text-green",
  completed: "bg-green/15 text-green",
  funded: "bg-green/15 text-green",
  failed: "bg-red-600/15 text-red-700",
  rejected: "bg-red-600/15 text-red-700",
  refunded: "bg-red-600/15 text-red-700",
  closed: "bg-navy/10 text-navy",
};

function StatusBadge({ status, labels }: { status: string; labels: Record<string, string> }) {
  const cls = STATUS_CLASSES[status] ?? "bg-navy/10 text-navy";
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-sans whitespace-nowrap ${cls}`}>
      {labels[status] ?? status}
    </span>
  );
}

export default function PortalPage() {
  const { profile } = useAuth();
  const schoolId = IS_MOCK ? MOCK_PORTAL_SCHOOL_ID : profile?.school_id ?? "";

  const { school, loading: schoolLoading } = useSchool(schoolId);
  const { needs, loading: needsLoading } = useSchoolNeeds(schoolId);
  const { donations, loading: donationsLoading } = useSchoolDonations(schoolId);

  const totalRaised = needs.reduce((sum, n) => sum + n.raised_amount, 0);
  const totalBackers = needs.reduce((sum, n) => sum + n.backer_count, 0);

  // Profile form state (school contact info).
  const [form, setForm] = useState({
    contact_name: "",
    contact_title: "",
    contact_email: "",
    contact_phone: "",
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (school) {
      setForm({
        contact_name: school.contact_name ?? "",
        contact_title: school.contact_title ?? "",
        contact_email: school.contact_email ?? "",
        contact_phone: school.contact_phone ?? "",
      });
    }
  }, [school]);

  function update(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  }

  function saveProfile() {
    // Mock: no persistence. Real path would POST to /api/schools/[id]/profile.
    setSaved(true);
  }

  return (
    <div className="space-y-8">
      {/* School header + stats */}
      <section>
        {schoolLoading ? (
          <p className="font-sans text-sm text-navy/50">Loading…</p>
        ) : school ? (
          <>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="font-serif text-3xl md:text-4xl font-semibold text-navy">
                  {school.name}
                </h1>
                <p className="font-sans text-sm text-navy/60 mt-1">
                  {school.city}, {school.state} · {school.district ?? "—"}
                </p>
              </div>
              <div className="flex gap-2">
                <span className="inline-block px-2 py-1 text-xs font-sans font-medium bg-cream text-navy rounded capitalize">
                  {school.tier}
                </span>
                <StatusBadge status={school.status} labels={{ active: "Active", pending: "Pending", suspended: "Suspended" }} />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
              <Stat label="Total Raised" value={formatCurrency(totalRaised)} />
              <Stat label="Needs" value={String(needs.length)} />
              <Stat label="Backers" value={String(totalBackers)} />
              <Stat
                label="Subscription"
                value={
                  school.free_forever
                    ? "Free forever"
                    : school.subscription_status === "active"
                    ? "Active"
                    : school.subscription_status === "exempt"
                    ? "Exempt"
                    : "—"
                }
              />
            </div>
          </>
        ) : (
          <p className="font-sans text-sm text-navy/50">
            No school associated with this account.
          </p>
        )}
      </section>

      {/* Needs */}
      <section className="card">
        <div className="flex items-center justify-between gap-4 mb-4">
          <h2 className="font-serif text-2xl font-semibold text-navy">Your Needs</h2>
          <a href="/submit-need" className="btn-gold text-xs px-4 py-2">
            Submit a Need
          </a>
        </div>

        {needs.some((n) => isProofOverdue(n)) && (
          <p className="bg-red-600/5 border border-red-600/20 rounded-md px-4 py-3 font-sans text-sm text-navy/80 mb-4">
            <span className="font-semibold text-navy">Proof of use is overdue on one of your needs.</span>{" "}
            Your school cannot post new needs or receive new funds until the proof is filed. File it
            below on the overdue need.
          </p>
        )}

        {needsLoading ? (
          <p className="font-sans text-sm text-navy/50">Loading…</p>
        ) : needs.length === 0 ? (
          <p className="font-sans text-sm text-navy/60">No needs posted yet.</p>
        ) : (
          <ul className="space-y-4">
            {needs.map((need) => (
              <NeedRow key={need.id} need={need} />
            ))}
          </ul>
        )}
      </section>

      {/* Donation activity */}
      <section className="card">
        <h2 className="font-serif text-2xl font-semibold text-navy mb-1">Donation Activity</h2>
        <p className="font-sans text-sm text-navy/60 mb-4">
          Recent contributions to your school&apos;s needs. Donor emails are never shown.
        </p>

        {donationsLoading ? (
          <p className="font-sans text-sm text-navy/50">Loading…</p>
        ) : donations.length === 0 ? (
          <p className="font-sans text-sm text-navy/60">No donations yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {donations.map((d) => (
              <li key={d.id} className="py-3 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-sans text-sm text-navy">
                    {d.is_anonymous ? "Anonymous" : d.display_name ?? "Anonymous"}
                    {d.is_recurring ? (
                      <span className="text-navy/50 text-xs"> · monthly</span>
                    ) : null}
                  </p>
                  <p className="font-sans text-xs text-navy/50 truncate">{d.need_title}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-serif text-sm font-semibold text-gold">
                    {formatCurrency(d.amount)}
                  </p>
                  <p className="font-sans text-xs text-navy/50">
                    {formatDate(d.created_at)} ·{" "}
                    <StatusBadge status={d.status} labels={DONATION_STATUS_LABELS} />
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* School profile */}
      <section className="card">
        <h2 className="font-serif text-2xl font-semibold text-navy mb-1">School Profile</h2>
        <p className="font-sans text-sm text-navy/60 mb-4">
          Contact information used for outreach and verification.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Contact Name">
            <input
              value={form.contact_name}
              onChange={(e) => update("contact_name", e.target.value)}
              className="border border-border rounded px-4 py-2 font-sans text-sm w-full focus:outline-none focus:border-navy"
            />
          </Field>
          <Field label="Contact Title">
            <input
              value={form.contact_title}
              onChange={(e) => update("contact_title", e.target.value)}
              className="border border-border rounded px-4 py-2 font-sans text-sm w-full focus:outline-none focus:border-navy"
            />
          </Field>
          <Field label="Contact Email">
            <input
              type="email"
              value={form.contact_email}
              onChange={(e) => update("contact_email", e.target.value)}
              className="border border-border rounded px-4 py-2 font-sans text-sm w-full focus:outline-none focus:border-navy"
            />
          </Field>
          <Field label="Contact Phone">
            <input
              value={form.contact_phone}
              onChange={(e) => update("contact_phone", e.target.value)}
              className="border border-border rounded px-4 py-2 font-sans text-sm w-full focus:outline-none focus:border-navy"
            />
          </Field>
        </div>

        <div className="flex items-center gap-4 mt-5">
          <button type="button" onClick={saveProfile} className="btn-gold text-sm px-6 py-2.5">
            Save Profile
          </button>
          {saved && (
            <span className="font-sans text-xs text-navy/60">
              Saved (preview only — not persisted)
            </span>
          )}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border rounded-md p-3 bg-white">
      <p className="font-sans text-[11px] uppercase tracking-wide text-navy/50">{label}</p>
      <p className="font-serif text-2xl font-bold text-navy mt-1">{value}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="font-sans text-xs text-navy/60 block mb-1">{label}</span>
      {children}
    </label>
  );
}

function NeedRow({ need }: { need: Need }) {
  const percent = Math.min(
    Math.round((need.raised_amount / need.goal_amount) * 100),
    100
  );
  const status = trailStatusForNeed(need);
  const next = nextTrailAction(need);
  const { entries } = useTrail(need.id);
  const { packet } = useProofPacket(need.id);
  const confirmReceipt = useMockStore((s) => s.confirmReceipt);
  const submitProof = useMockStore((s) => s.submitProof);
  const [showTrail, setShowTrail] = useState(false);
  const [showProofForm, setShowProofForm] = useState(false);
  const [confirmedBy, setConfirmedBy] = useState("");
  const [proofAmount, setProofAmount] = useState("");
  const [proofNotes, setProofNotes] = useState("");
  const [attestedBy, setAttestedBy] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const overdue = isProofOverdue(need);
  const daysLeft = proofDaysRemaining(need);
  const canConfirmReceipt = status === "sent";
  const canSubmitProof =
    status === "received" || status === "awaiting_proof" || status === "proof_overdue";

  async function callTrail(action: string, payload: Record<string, unknown>) {
    if (IS_MOCK) return { ok: true, mock: true };
    const res = await fetch(`/api/needs/${need.id}/trail`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...payload }),
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, error: data?.error as string | undefined };
  }

  async function handleConfirmReceipt() {
    const name = confirmedBy.trim();
    if (!name) {
      setNotice("Enter the name of the person confirming receipt.");
      return;
    }
    setBusy(true);
    setNotice(null);
    if (IS_MOCK) {
      const ok = confirmReceipt(need.id, name);
      setNotice(
        ok
          ? "Receipt confirmed. The public trail now shows Received, and proof of use is due in 30 days."
          : "Receipt could not be confirmed for this need."
      );
      setBusy(false);
      return;
    }
    const res = await callTrail("receipt", { confirmedBy: name });
    setNotice(res.ok ? "Receipt confirmed. Donors have been emailed." : res.error ?? "Could not confirm receipt.");
    setBusy(false);
  }

  async function handleSubmitProof() {
    const amount = Number(proofAmount);
    if (!Number.isFinite(amount) || amount < 0) {
      setNotice("Enter the final amount spent.");
      return;
    }
    if (!attestedBy.trim()) {
      setNotice("Enter the name of the administrator attesting the funds were spent as stated.");
      return;
    }
    setBusy(true);
    setNotice(null);
    if (IS_MOCK) {
      const ok = submitProof({
        needId: need.id,
        finalAmountSpent: amount,
        invoicesNote: proofNotes.trim(),
        attestedBy: attestedBy.trim(),
      });
      setNotice(
        ok
          ? "Proof of use submitted. The fiscal sponsor reviews it before the need is marked Use Verified."
          : "Proof could not be submitted for this need."
      );
      setShowProofForm(false);
      setBusy(false);
      return;
    }
    const res = await callTrail("proof_submit", {
      finalAmountSpent: amount,
      invoicesNote: proofNotes.trim() || undefined,
      attestedBy: attestedBy.trim(),
    });
    setNotice(res.ok ? "Proof of use submitted." : res.error ?? "Could not submit proof.");
    if (res.ok) setShowProofForm(false);
    setBusy(false);
  }

  return (
    <li className="border border-border rounded-md p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-serif text-lg font-semibold text-navy">
            <a href={`/needs/${need.id}`} className="hover:text-gold">{need.title}</a>
          </p>
          <p className="font-sans text-xs text-navy/50 mt-0.5">{need.category}</p>
        </div>
        <TrailStatusBadge status={status} />
      </div>

      <div className="mt-3">
        <div className="flex justify-between text-sm font-sans mb-1">
          <span className="font-semibold text-navy">{formatCurrency(need.raised_amount)}</span>
          <span className="text-navy/60">of {formatCurrency(need.goal_amount)}</span>
        </div>
        <div className="h-2 rounded-full bg-cream overflow-hidden">
          <div className="h-full rounded-full bg-gold" style={{ width: `${percent}%` }} />
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-xs font-sans text-navy/50">{percent}% funded</span>
          <span className="text-xs font-sans text-navy/50">
            {need.backer_count} backer{need.backer_count !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {next.action && (
        <p className="font-sans text-xs text-navy/70 mt-3">
          <span className="font-semibold text-navy">Next step: </span>
          {next.label}
          {(status === "awaiting_proof" || status === "proof_overdue") && daysLeft != null && !overdue && (
            <span> ({daysLeft} day{daysLeft === 1 ? "" : "s"} left)</span>
          )}
        </p>
      )}

      {canConfirmReceipt && (
        <div className="mt-4 bg-gold/10 border border-gold/30 rounded-md p-4">
          <p className="font-sans text-sm font-medium text-navy">Funds sent. Confirm receipt.</p>
          <p className="font-sans text-xs text-navy/60 mt-1">
            One action moves the need to Received everywhere, and donors get their payoff email.
          </p>
          <div className="flex flex-wrap gap-3 mt-3">
            <input
              type="text"
              placeholder="Your name"
              value={confirmedBy}
              onChange={(e) => setConfirmedBy(e.target.value)}
              className="border border-border rounded px-3 py-2 font-sans text-sm flex-1 min-w-40 focus:outline-none focus:border-navy"
            />
            <button
              type="button"
              disabled={busy}
              onClick={handleConfirmReceipt}
              className="btn-gold text-xs px-5 py-2 disabled:opacity-60"
            >
              Confirm receipt
            </button>
          </div>
        </div>
      )}

      {canSubmitProof && (
        <div className="mt-4">
          {!showProofForm ? (
            <button
              type="button"
              onClick={() => setShowProofForm(true)}
              className="btn-ghost text-xs px-5 py-2"
            >
              {packet ? "Update proof of use" : "Submit proof of use"}
            </button>
          ) : (
            <div className="border border-border rounded-md p-4 space-y-3">
              <p className="font-sans text-sm font-medium text-navy">Proof of use packet</p>
              <p className="font-sans text-xs text-navy/60">
                Due within 30 days of receipt. Invoices or receipts, a completion photo, and the
                final amount spent. The school administrator attests the funds were spent as
                stated, and the fiscal sponsor verifies the packet.
              </p>
              {packet?.status === "needs_more_info" && packet.review_notes && (
                <p className="font-sans text-xs text-red-700 bg-red-600/5 border border-red-600/20 rounded px-3 py-2">
                  The sponsor asked for more: {packet.review_notes}
                </p>
              )}
              <div>
                <label className="font-sans text-xs text-navy/60 block mb-1">Final amount spent ($)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={proofAmount}
                  onChange={(e) => setProofAmount(e.target.value)}
                  placeholder={String(need.raised_amount)}
                  className="border border-border rounded px-3 py-2 font-sans text-sm w-full focus:outline-none focus:border-navy"
                />
              </div>
              <div>
                <label className="font-sans text-xs text-navy/60 block mb-1">
                  Invoices or receipts (list what is attached)
                </label>
                <textarea
                  value={proofNotes}
                  onChange={(e) => setProofNotes(e.target.value)}
                  rows={2}
                  placeholder="e.g. Vendor invoice #1042, $2,940, seating and shelving"
                  className="border border-border rounded px-3 py-2 font-sans text-sm w-full focus:outline-none focus:border-navy"
                />
              </div>
              <div>
                <label className="font-sans text-xs text-navy/60 block mb-1">
                  Attested by (administrator name)
                </label>
                <input
                  type="text"
                  value={attestedBy}
                  onChange={(e) => setAttestedBy(e.target.value)}
                  placeholder="Full name"
                  className="border border-border rounded px-3 py-2 font-sans text-sm w-full focus:outline-none focus:border-navy"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  disabled={busy}
                  onClick={handleSubmitProof}
                  className="btn-gold text-xs px-5 py-2 disabled:opacity-60"
                >
                  Submit proof of use
                </button>
                <button
                  type="button"
                  onClick={() => setShowProofForm(false)}
                  className="btn-ghost text-xs px-5 py-2"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          {packet && !showProofForm && (
            <p className="font-sans text-xs text-navy/50 mt-2">
              Proof packet: {packet.status}
              {packet.final_amount_spent != null ? ` · ${formatCurrency(packet.final_amount_spent)} spent` : ""}
              {packet.attested_by ? ` · attested by ${packet.attested_by}` : ""}
            </p>
          )}
        </div>
      )}

      {notice && <p className="font-sans text-xs text-navy/70 mt-3">{notice}</p>}

      <button
        type="button"
        onClick={() => setShowTrail((v) => !v)}
        className="font-sans text-xs text-gold hover:underline mt-4"
      >
        {showTrail ? "Hide money trail" : "Show money trail"}
      </button>
      {showTrail && (
        <div className="mt-3 border-t border-border pt-4">
          <MoneyTrail need={need} entries={entries} />
        </div>
      )}
    </li>
  );
}
