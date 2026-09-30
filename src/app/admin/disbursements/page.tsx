"use client";

import { useDisbursements } from "@/hooks";
import { formatCurrency, formatDate, StatusPill } from "../ui";

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  processed: "Processed",
  confirmed: "Confirmed",
};

export default function AdminDisbursementsPage() {
  const { disbursements, loading } = useDisbursements();

  return (
    <section>
      <h1 className="font-serif text-3xl font-semibold text-navy">Disbursements</h1>
      <p className="font-sans text-sm text-navy/60 mt-1">
        Read-only record of payouts to schools via Childs Play Foundation.
      </p>

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
    </section>
  );
}
