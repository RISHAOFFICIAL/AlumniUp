"use client";

// S3 Need detail (client half): story, funding state, the public money
// trail, and the donate entry. Supports ?donate=1&amount=50 deep links
// (used by the iOS app, which opens this page in the browser to give).

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useNeed, useProofPacket } from "@/hooks";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import DonationModal from "@/components/DonationModal";
import BragModal from "@/components/BragModal";
import MoneyTrail, { TrailStatusBadge } from "@/components/MoneyTrail";
import { acceptsDonations, trailStatusForNeed } from "@/lib/trail";
import { CPF_INFO } from "@/types";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function photoForNeed(title: string, category: string, photoUrl: string | null): string {
  if (photoUrl) return photoUrl;
  const hay = `${title} ${category}`.toLowerCase();
  if (hay.includes("baseball") || hay.includes("field")) return "/images/need-baseball.jpg";
  if (hay.includes("stage") || hay.includes("lighting") || hay.includes("arts")) return "/images/need-stage.jpg";
  if (hay.includes("debate")) return "/images/need-debate.jpg";
  return "/images/hero-students.webp";
}

export default function NeedDetailClient({ needId }: { needId: string }) {
  const { need, loading } = useNeed(needId);
  const { packet } = useProofPacket(needId);
  const searchParams = useSearchParams();
  const [donateOpen, setDonateOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [initialAmount, setInitialAmount] = useState<number | undefined>(undefined);
  const [initialFrequency, setInitialFrequency] = useState<"once" | "monthly" | undefined>(undefined);

  // Deep link from the iOS app (or any share): open the donate sheet with
  // the requested amount and frequency preselected.
  useEffect(() => {
    if (searchParams.get("donate") === "1") {
      const amount = Number(searchParams.get("amount"));
      if (Number.isFinite(amount) && amount > 0) setInitialAmount(amount);
      if (searchParams.get("monthly") === "1") setInitialFrequency("monthly");
      setDonateOpen(true);
    }
  }, [searchParams]);

  if (loading) {
    return (
      <>
        <SiteHeader />
        <div className="max-w-page mx-auto px-4 py-16">
          <p className="font-sans text-navy/60">Loading need…</p>
        </div>
        <SiteFooter />
      </>
    );
  }

  if (!need) {
    return (
      <>
        <SiteHeader />
        <div className="max-w-page mx-auto px-4 py-16 text-center">
          <h1 className="font-serif text-3xl font-semibold text-navy">Need not found</h1>
          <p className="font-sans text-navy/60 mt-3">
            This need may have been removed, or the link is out of date.
          </p>
          <a href="/#needs" className="btn-gold inline-block mt-6 text-sm">
            Browse open needs
          </a>
        </div>
        <SiteFooter />
      </>
    );
  }

  const status = trailStatusForNeed(need);
  const percentFunded = Math.min(Math.round((need.raised_amount / need.goal_amount) * 100), 100);
  const canDonate = acceptsDonations(status);

  return (
    <>
      <SiteHeader />
      <main className="bg-cream">
        <div className="max-w-page mx-auto px-4 py-8 md:py-12">
          <a href="/#needs" className="font-sans text-sm text-gold hover:underline">
            ← All open needs
          </a>

          <div className="grid lg:grid-cols-5 gap-8 mt-4">
            {/* Story column */}
            <div className="lg:col-span-3">
              <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden">
                <img
                  src={photoForNeed(need.title, need.category, need.photo_url)}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-3 left-3 bg-white/95 text-navy text-[11px] font-sans font-semibold px-2.5 py-1 rounded-full shadow-sm">
                  ✓ Verified
                </span>
                <span className="absolute bottom-3 left-3 bg-navy/85 text-white text-[11px] font-sans font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide">
                  {need.category}
                </span>
              </div>

              <h1 className="font-serif text-3xl md:text-4xl font-semibold text-navy mt-6 leading-tight">
                {need.title}
              </h1>
              <p className="font-sans text-sm text-navy/60 mt-2">
                {need.school?.name}
                {need.submitted_by_name ? ` · Posted by ${need.submitted_by_name}` : ""}
                {need.submitted_by_title ? `, ${need.submitted_by_title}` : ""}
              </p>

              <div className="mt-6 bg-white border border-border rounded-2xl p-6">
                <div className="flex justify-between items-baseline font-sans mb-1.5">
                  <span className="font-serif text-3xl font-bold text-navy">
                    {formatCurrency(need.raised_amount)}{" "}
                    <span className="font-sans text-sm font-normal text-navy/50">raised</span>
                  </span>
                  <span className="text-sm text-navy/60">
                    of {formatCurrency(need.goal_amount)} · {need.backer_count} donor
                    {need.backer_count !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${percentFunded}%` }} />
                </div>
                <p className="font-sans text-xs text-navy/50 mt-2">{percentFunded}% funded</p>
                {need.minimum_amount && status === "live" && (
                  <p className="text-xs font-sans text-[#7A5C14] mt-2">
                    Can begin at {formatCurrency(need.minimum_amount)} funded
                  </p>
                )}

                <div className="flex flex-wrap gap-3 mt-5">
                  <button
                    type="button"
                    className="btn-gold text-sm px-8 py-3"
                    onClick={() => setDonateOpen(true)}
                    disabled={!canDonate}
                  >
                    {canDonate ? "Donate to This Need" : "Not Accepting Donations"}
                  </button>
                  <button
                    type="button"
                    className="btn-ghost text-sm px-6 py-3"
                    onClick={() => setShareOpen(true)}
                  >
                    Share
                  </button>
                </div>
                {!canDonate && (
                  <p className="font-sans text-xs text-navy/50 mt-3">
                    This need is {status === "cancelled" ? "cancelled" : "no longer accepting donations"}.
                    The trail below shows exactly where its money stands.
                  </p>
                )}
              </div>

              <div className="bg-white border border-border rounded-2xl p-6 mt-6">
                <h2 className="font-serif text-2xl font-semibold text-navy">The Need</h2>
                <p className="font-sans text-sm text-navy/70 leading-relaxed mt-3">{need.description}</p>
                <p className="font-sans text-xs text-navy/50 mt-4">
                  Tax-deductible through {CPF_INFO.name} ({CPF_INFO.classification} EIN {CPF_INFO.ein}).
                </p>
              </div>

              {packet && packet.status === "verified" && (
                <div className="bg-white border border-border rounded-2xl p-6 mt-6">
                  <h2 className="font-serif text-2xl font-semibold text-navy">How the Money Was Used</h2>
                  <p className="font-sans text-sm text-navy/70 mt-3">
                    Final amount spent:{" "}
                    <span className="font-semibold text-navy">
                      {packet.final_amount_spent != null ? formatCurrency(packet.final_amount_spent) : "—"}
                    </span>
                    {packet.attested_by ? ` · Attested by ${packet.attested_by}` : ""}
                  </p>
                  {packet.invoices_note && (
                    <p className="font-sans text-sm text-navy/60 mt-2">{packet.invoices_note}</p>
                  )}
                  {packet.review_notes && (
                    <p className="font-sans text-sm text-navy/60 mt-2">{packet.review_notes}</p>
                  )}
                </div>
              )}
            </div>

            {/* Trail column */}
            <div className="lg:col-span-2">
              <div className="bg-white border border-border rounded-2xl p-6 lg:sticky lg:top-24">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-serif text-2xl font-semibold text-navy">Money Trail</h2>
                  <TrailStatusBadge status={status} />
                </div>
                <p className="font-sans text-xs text-navy/50 mt-1">
                  Every step is public and dated, from the day the need went live to verified classroom use.
                </p>
                <div className="mt-5">
                  <MoneyTrail need={need} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />

      <DonationModal
        need={need}
        open={donateOpen}
        initialAmount={initialAmount}
        initialFrequency={initialFrequency}
        onClose={() => setDonateOpen(false)}
        onShare={() => {
          setDonateOpen(false);
          setShareOpen(true);
        }}
      />
      <BragModal need={need} open={shareOpen} onClose={() => setShareOpen(false)} />
    </>
  );
}
