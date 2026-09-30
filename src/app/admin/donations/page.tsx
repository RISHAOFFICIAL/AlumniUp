"use client";

import { useDonations } from "@/hooks";
import { formatCurrency, formatDate, StatusPill } from "../ui";

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  completed: "Completed",
  failed: "Failed",
  refunded: "Refunded",
};

export default function AdminDonationsPage() {
  const { donations, loading } = useDonations();

  return (
    <section>
      <h1 className="font-serif text-3xl font-semibold text-navy">Donations</h1>
      <p className="font-sans text-sm text-navy/60 mt-1">
        All contributions across the platform. Donor emails are never shown.
      </p>

      {loading ? (
        <p className="font-sans text-sm text-navy/50 mt-6">Loading…</p>
      ) : donations.length === 0 ? (
        <div className="card text-center mt-6">
          <p className="font-sans text-sm text-navy/70">No donations yet.</p>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[560px]">
            <thead>
              <tr className="border-b border-border">
                <th className="font-sans text-xs uppercase tracking-wide text-navy/50 py-2 pr-4">
                  Donor
                </th>
                <th className="font-sans text-xs uppercase tracking-wide text-navy/50 py-2 pr-4">
                  Need
                </th>
                <th className="font-sans text-xs uppercase tracking-wide text-navy/50 py-2 pr-4">
                  Amount
                </th>
                <th className="font-sans text-xs uppercase tracking-wide text-navy/50 py-2 pr-4">
                  Date
                </th>
                <th className="font-sans text-xs uppercase tracking-wide text-navy/50 py-2">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {donations.map((d) => (
                <tr key={d.id} className="border-b border-border/60">
                  <td className="py-3 pr-4 font-sans text-sm text-navy">
                    {d.is_anonymous ? "Anonymous" : d.display_name ?? "Anonymous"}
                    {d.is_recurring ? (
                      <span className="text-navy/50 text-xs"> · monthly</span>
                    ) : null}
                  </td>
                  <td className="py-3 pr-4 font-sans text-sm text-navy/80">{d.need_title}</td>
                  <td className="py-3 pr-4 font-serif text-sm font-semibold text-gold">
                    {formatCurrency(d.amount)}
                  </td>
                  <td className="py-3 pr-4 font-sans text-sm text-navy/70">
                    {formatDate(d.created_at)}
                  </td>
                  <td className="py-3 font-sans text-sm">
                    <StatusPill status={d.status} label={STATUS_LABELS[d.status]} />
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
