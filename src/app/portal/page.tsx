"use client";

import { useEffect, useState } from "react";
import { useAuth, useSchool, useSchoolNeeds, useSchoolDonations } from "@/hooks";
import { MOCK_PORTAL_SCHOOL_ID } from "@/lib/data/mock";
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

const NEED_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  active: "Active",
  funded: "Funded",
  closed: "Closed",
  rejected: "Rejected",
};

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

  return (
    <li className="border border-border rounded-md p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-serif text-lg font-semibold text-navy">{need.title}</p>
          <p className="font-sans text-xs text-navy/50 mt-0.5">{need.category}</p>
        </div>
        <StatusBadge status={need.status} labels={NEED_STATUS_LABELS} />
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
    </li>
  );
}
