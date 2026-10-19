"use client";

import { useWallOfHonor } from "@/hooks";
import { CPF_INFO } from "@/types";
import ClassYearLeaderboard from "@/components/ClassYearLeaderboard";

const IS_MOCK = (process.env.NEXT_PUBLIC_DATA_SOURCE ?? "mock") === "mock";

function formatCurrency(n: number): string {
  return `$${n.toLocaleString()}`;
}

export default function WallOfHonorPage() {
  const entries = useWallOfHonor();

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-page mx-auto px-4 py-12 md:py-16">
        <h1 className="font-serif text-4xl md:text-5xl font-semibold text-navy">Wall of Honor</h1>
        <p className="font-sans text-navy/60 mt-3 max-w-2xl">
          A public record of the alumni and supporters helping Detroit schools.
          Donors who choose to remain anonymous appear simply as &ldquo;Anonymous.&rdquo;
        </p>

        {/* Class Year Leaderboard */}
        <section className="mt-10">
          <div className="card">
            <h2 className="font-serif text-2xl font-semibold text-navy">Class Year Leaderboard</h2>
            <p className="font-sans text-sm text-navy/60 mt-1">
              Which graduating class is leading the way for Detroit students?
            </p>
            <div className="mt-6">
              <ClassYearLeaderboard />
            </div>
          </div>
        </section>

        {/* Recognized supporters */}
        <section className="mt-12">
          <h2 className="font-serif text-2xl font-semibold text-navy">Recognized Supporters</h2>
          <p className="font-sans text-sm text-navy/60 mt-1">
            Most recent contributions in recognition of these needs.
          </p>

          {entries.length === 0 ? (
            <div className="card text-center mt-6">
              <p className="font-sans text-sm text-navy/70">
                Be the first donor to appear on the Wall of Honor.
              </p>
            </div>
          ) : (
            <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              {entries.map((entry) => (
                <li key={entry.id} className="card">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-serif text-lg font-semibold text-navy truncate">
                        {entry.display_name ?? "Anonymous"}
                      </p>
                      {entry.graduation_year ? (
                        <p className="font-sans text-xs text-navy/50 mt-0.5">
                          Class of {entry.graduation_year}
                        </p>
                      ) : (
                        <p className="font-sans text-xs text-navy/50 mt-0.5">
                          Class year not shared
                        </p>
                      )}
                    </div>
                    {entry.amount_display != null && (
                      <p className="font-serif text-base font-semibold text-gold shrink-0">
                        {formatCurrency(entry.amount_display)}
                      </p>
                    )}
                  </div>
                  {entry.message && (
                    <p className="font-sans text-sm text-navy/70 italic mt-3">
                      &ldquo;{entry.message}&rdquo;
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
