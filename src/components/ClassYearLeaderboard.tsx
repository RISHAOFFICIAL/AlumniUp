"use client";

import { useClassYearLeaderboard } from "@/hooks";

function formatCurrency(n: number): string {
  return `$${n.toLocaleString()}`;
}

/**
 * Alumni competition by graduation year. Donors are aggregated by class year
 * and ranked by total raised. Only recognized donors with a known graduation
 * year appear here; anonymous donors are excluded by design.
 */
export default function ClassYearLeaderboard() {
  const { ranks, loading } = useClassYearLeaderboard();
  const top = ranks[0]?.total_raised ?? 0;

  return (
    <div>
      {loading ? (
        <p className="font-sans text-sm text-navy/50">Loading…</p>
      ) : ranks.length === 0 ? (
        <p className="font-sans text-sm text-navy/50">
          Class rankings will appear once recognized donors contribute.
        </p>
      ) : (
        <ol className="space-y-4">
          {ranks.map((rank, index) => {
            const share = top > 0 ? Math.round((rank.total_raised / top) * 100) : 0;
            return (
              <li key={rank.graduation_year}>
                <div className="flex items-baseline justify-between gap-3">
                  <div className="flex items-baseline gap-3 min-w-0">
                    <span className="font-serif text-lg font-semibold text-navy/40 w-6 shrink-0">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="font-sans text-sm font-medium text-navy truncate">
                        Class of {rank.graduation_year}
                      </p>
                      <p className="font-sans text-xs text-navy/50">
                        {rank.donor_count} donor{rank.donor_count !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <p className="font-serif text-base font-semibold text-gold shrink-0">
                    {formatCurrency(rank.total_raised)}
                  </p>
                </div>
                <div className="ml-9 mt-2 h-2 rounded-full bg-cream overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gold"
                    style={{ width: `${share}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
