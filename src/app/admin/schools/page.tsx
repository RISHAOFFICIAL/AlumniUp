"use client";

import { useAllSchools } from "@/hooks";
import { formatCurrency, formatDate, StatusPill } from "../ui";

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  active: "Active",
  suspended: "Suspended",
};

const SUB_LABELS: Record<string, string> = {
  active: "Active",
  expired: "Expired",
  exempt: "Exempt",
};

export default function AdminSchoolsPage() {
  const { schools, loading } = useAllSchools();

  return (
    <section>
      <h1 className="font-serif text-3xl font-semibold text-navy">Schools</h1>
      <p className="font-sans text-sm text-navy/60 mt-1">
        Partner schools, their subscription status, and tier.
      </p>

      {loading ? (
        <p className="font-sans text-sm text-navy/50 mt-6">Loading…</p>
      ) : schools.length === 0 ? (
        <div className="card text-center mt-6">
          <p className="font-sans text-sm text-navy/70">No schools yet.</p>
        </div>
      ) : (
        <ul className="space-y-4 mt-6">
          {schools.map((school) => (
            <li key={school.id} className="card">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-serif text-lg font-semibold text-navy">{school.name}</h2>
                  <p className="font-sans text-xs text-navy/50 mt-1">
                    {school.city}, {school.state} · {school.district ?? "—"}
                  </p>
                </div>
                <StatusPill status={school.status} label={STATUS_LABELS[school.status]} />
              </div>

              <dl className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div>
                  <dt className="font-sans text-[11px] uppercase tracking-wide text-navy/50">Tier</dt>
                  <dd className="font-sans text-sm text-navy mt-0.5 capitalize">{school.tier}</dd>
                </div>
                <div>
                  <dt className="font-sans text-[11px] uppercase tracking-wide text-navy/50">Subscription</dt>
                  <dd className="font-sans text-sm text-navy mt-0.5">
                    {school.subscription_status ? (
                      <StatusPill
                        status={school.subscription_status}
                        label={SUB_LABELS[school.subscription_status]}
                      />
                    ) : (
                      "—"
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="font-sans text-[11px] uppercase tracking-wide text-navy/50">Annual Fee</dt>
                  <dd className="font-sans text-sm text-navy mt-0.5">
                    {school.free_forever ? "Free forever" : formatCurrency(school.annual_fee)}
                  </dd>
                </div>
                <div>
                  <dt className="font-sans text-[11px] uppercase tracking-wide text-navy/50">Renews</dt>
                  <dd className="font-sans text-sm text-navy mt-0.5">
                    {school.subscription_expires_at
                      ? formatDate(school.subscription_expires_at)
                      : "—"}
                  </dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
