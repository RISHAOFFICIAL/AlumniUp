"use client";

import { useAdminSponsors } from "@/hooks";
import { formatCurrency, StatusPill } from "../ui";

const TIER_LABELS: Record<string, string> = {
  gold: "Gold",
  silver: "Silver",
  bronze: "Bronze",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  active: "Active",
  lapsed: "Lapsed",
};

const CONTRIBUTION_LABELS: Record<string, string> = {
  donation: "Tax-deductible donation",
  sponsorship_contract: "Sponsorship contract",
};

export default function AdminSponsorsPage() {
  const { sponsors, loading } = useAdminSponsors();

  return (
    <section>
      <h1 className="font-serif text-3xl font-semibold text-navy">Sponsors</h1>
      <p className="font-sans text-sm text-navy/60 mt-1">
        Corporate sponsors by tier and status.
      </p>

      {loading ? (
        <p className="font-sans text-sm text-navy/50 mt-6">Loading…</p>
      ) : sponsors.length === 0 ? (
        <div className="card text-center mt-6">
          <p className="font-sans text-sm text-navy/70">No sponsors yet.</p>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[560px]">
            <thead>
              <tr className="border-b border-border">
                <th className="font-sans text-xs uppercase tracking-wide text-navy/50 py-2 pr-4">
                  Organization
                </th>
                <th className="font-sans text-xs uppercase tracking-wide text-navy/50 py-2 pr-4">
                  Tier
                </th>
                <th className="font-sans text-xs uppercase tracking-wide text-navy/50 py-2 pr-4">
                  Committed
                </th>
                <th className="font-sans text-xs uppercase tracking-wide text-navy/50 py-2 pr-4">
                  Type
                </th>
                <th className="font-sans text-xs uppercase tracking-wide text-navy/50 py-2">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {sponsors.map((s) => (
                <tr key={s.id} className="border-b border-border/60">
                  <td className="py-3 pr-4 font-sans text-sm text-navy">
                    {s.organization_name}
                    {s.contact_name ? (
                      <span className="text-navy/50 text-xs block">{s.contact_name}</span>
                    ) : null}
                  </td>
                  <td className="py-3 pr-4 font-sans text-sm text-navy/80">
                    {s.tier ? TIER_LABELS[s.tier] : "—"}
                  </td>
                  <td className="py-3 pr-4 font-serif text-sm font-semibold text-gold">
                    {s.amount_committed != null ? formatCurrency(s.amount_committed) : "—"}
                  </td>
                  <td className="py-3 pr-4 font-sans text-sm text-navy/70">
                    {s.contribution_type ? CONTRIBUTION_LABELS[s.contribution_type] : "—"}
                  </td>
                  <td className="py-3 font-sans text-sm">
                    <StatusPill status={s.status} label={STATUS_LABELS[s.status]} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
