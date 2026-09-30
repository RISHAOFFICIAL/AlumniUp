"use client";

import { useDonationStats } from "@/hooks";

function formatCurrency(n: number): string {
  return `$${n.toLocaleString()}`;
}

export default function AdminStatsBar() {
  const stats = useDonationStats();

  const items = [
    { label: "Total Raised", value: formatCurrency(stats.totalRaised) },
    { label: "Needs Funded", value: String(stats.needsFunded) },
    { label: "Donors", value: String(stats.donorCount) },
    { label: "Schools", value: String(stats.schoolCount) },
  ];

  return (
    <section className="bg-white border-b border-border">
      <div className="max-w-5xl mx-auto px-4 py-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="border border-border rounded-md p-3 bg-cream/50"
          >
            <p className="font-sans text-[11px] uppercase tracking-wide text-navy/50">
              {item.label}
            </p>
            <p className="font-serif text-2xl font-bold text-navy mt-1">
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
