"use client";

// S7 My Donations: a donor's private gift history, each gift with its
// delivery status from the public money trail (Stage 2 story 6).
// Monthly gifts can be cancelled here; gifts to a cancelled need get the
// refund-or-redirect choice (Stage 7 policy).

import { useState } from "react";
import { useMyDonations, useNeeds } from "@/hooks";
import { useMockStore } from "@/store/mock";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { TrailStatusBadge } from "@/components/MoneyTrail";
import { trailStatusForNeed } from "@/lib/trail";
import type { DonationRow, Need } from "@/types";

const IS_MOCK = (process.env.NEXT_PUBLIC_DATA_SOURCE ?? "mock") === "mock";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function GiftCard({ gift, openNeeds }: { gift: DonationRow; openNeeds: Need[] }) {
  const [choiceOpen, setChoiceOpen] = useState(false);
  const [redirectNeedId, setRedirectNeedId] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const recordChoice = useMockStore((s) => s.recordDonationChoice);
  const cancelMonthly = useMockStore((s) => s.cancelMonthlyDonation);

  const trailStatus = gift.need_trail_status ?? null;
  const isCancelledNeed = trailStatus === "cancelled";
  const hasChoice = Boolean(gift.choice);
  const redirectTargets = openNeeds.filter((n) => n.school_id === gift.need_school_id);

  async function submitChoice(choice: "refund" | "redirect") {
    if (choice === "redirect" && !redirectNeedId) {
      setNotice("Pick the open need your gift should go to.");
      return;
    }
    setBusy(true);
    setNotice(null);
    if (IS_MOCK) {
      const ok = recordChoice(gift.id, choice, choice === "redirect" ? redirectNeedId : null);
      setNotice(
        ok
          ? choice === "refund"
            ? "Refund recorded. In live mode the fiscal sponsor refunds to your original payment method within 7 business days."
            : "Redirect recorded. The operator moves your gift to the need you picked."
          : "A choice was already recorded for this gift."
      );
      setChoiceOpen(false);
      setBusy(false);
      return;
    }
    try {
      const res = await fetch(`/api/donations/${gift.id}/choice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ choice, redirectNeedId: choice === "redirect" ? redirectNeedId : null }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setNotice(data?.error ?? "Your choice could not be saved.");
      } else {
        setNotice(
          choice === "refund"
            ? "Refund recorded. The fiscal sponsor refunds to your original payment method, typically within 7 business days."
            : "Redirect recorded. The operator moves your gift to the need you picked."
        );
        setChoiceOpen(false);
      }
    } catch {
      setNotice("Your choice could not be saved. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function cancelMonthlyGift() {
    setBusy(true);
    setNotice(null);
    if (IS_MOCK) {
      cancelMonthly(gift.id);
      setNotice("Monthly gift cancelled. No future charges.");
      setBusy(false);
      return;
    }
    try {
      const res = await fetch(`/api/donations/${gift.id}/cancel`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      setNotice(res.ok ? "Monthly gift cancelled. No future charges." : data?.error ?? "Could not cancel.");
    } catch {
      setNotice("Could not cancel. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className="card">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <a href={`/needs/${gift.need_id}`} className="font-serif text-lg font-semibold text-navy hover:text-gold">
            {gift.need_title}
          </a>
          <p className="font-sans text-xs text-navy/50 mt-1">
            {formatDate(gift.created_at)}
            {gift.is_recurring ? " · Monthly gift" : " · One-time gift"}
            {gift.is_anonymous ? " · Anonymous" : ""}
            {gift.status === "refunded" ? " · Refunded" : ""}
            {gift.status === "pending" ? " · Payment pending" : ""}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="font-serif text-xl font-bold text-gold">{formatCurrency(gift.amount)}</p>
          <p className="font-sans text-xs text-navy/50 mt-1">
            {gift.tax_receipt_sent ? "Receipt sent" : "Receipt by email"}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mt-4">
        {trailStatus ? (
          <>
            <TrailStatusBadge status={trailStatus} />
            <span className="font-sans text-xs text-navy/50">
              Delivery status from the public money trail
            </span>
          </>
        ) : (
          <span className="font-sans text-xs text-navy/50">Delivery status not available yet</span>
        )}
      </div>

      {gift.message && (
        <p className="font-sans text-sm text-navy/60 mt-3">
          Your Wall of Honor message: &ldquo;{gift.message}&rdquo;
        </p>
      )}

      {isCancelledNeed && !hasChoice && gift.status !== "refunded" && (
        <div className="mt-4 bg-red-600/5 border border-red-600/20 rounded-md p-4">
          <p className="font-sans text-sm text-navy/80">
            This need was cancelled before the funds were sent. Choose what happens to your gift:
          </p>
          {!choiceOpen ? (
            <button
              type="button"
              onClick={() => setChoiceOpen(true)}
              className="btn-gold text-xs px-5 py-2 mt-3"
            >
              Choose refund or redirect
            </button>
          ) : (
            <div className="mt-3 space-y-3">
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => submitChoice("refund")}
                  className="btn-gold text-xs px-5 py-2 disabled:opacity-60"
                >
                  Full refund
                </button>
                <select
                  value={redirectNeedId}
                  onChange={(e) => setRedirectNeedId(e.target.value)}
                  className="border border-border rounded px-3 py-2 font-sans text-xs focus:outline-none focus:border-navy"
                >
                  <option value="">Redirect to an open need at this school…</option>
                  {redirectTargets.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.title}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  disabled={busy || !redirectNeedId}
                  onClick={() => submitChoice("redirect")}
                  className="btn-ghost text-xs px-5 py-2 disabled:opacity-60"
                >
                  Redirect my gift
                </button>
              </div>
              <p className="font-sans text-xs text-navy/50">
                No response in 30 days means a refund. Refunds go to your original payment method,
                typically within 7 business days.
              </p>
            </div>
          )}
        </div>
      )}

      {isCancelledNeed && hasChoice && (
        <p className="font-sans text-xs text-navy/60 mt-3">
          Your choice is recorded:{" "}
          {gift.choice?.choice === "refund" ? "full refund" : "redirect to another need at this school"}.
        </p>
      )}

      {gift.is_recurring && gift.status === "completed" && (
        <div className="mt-4">
          <button
            type="button"
            disabled={busy}
            onClick={cancelMonthlyGift}
            className="btn-ghost text-xs px-5 py-2 disabled:opacity-60"
          >
            Cancel monthly gift
          </button>
          <p className="font-sans text-xs text-navy/50 mt-2">
            Cancellation stops future charges. Past gifts follow the refund rules.
          </p>
        </div>
      )}

      {notice && <p className="font-sans text-xs text-navy/70 mt-3">{notice}</p>}
    </li>
  );
}

export default function MyDonationsPage() {
  const { donations, loading, signedIn } = useMyDonations();
  const { needs } = useNeeds();
  const openNeeds = needs.filter((n) => trailStatusForNeed(n) === "live");

  const totalGiven = donations
    .filter((d) => d.status === "completed")
    .reduce((sum, d) => sum + d.amount, 0);

  return (
    <>
      <SiteHeader />
      <main className="bg-cream min-h-screen">
        <div className="max-w-page mx-auto px-4 py-12">
          <h1 className="font-serif text-3xl md:text-4xl font-semibold text-navy">My Donations</h1>
          <p className="font-sans text-sm text-navy/60 mt-2 max-w-2xl">
            Your private gift history. Each gift shows its delivery status from the public money
            trail, so you can follow your own money to the school.
          </p>

          {IS_MOCK && (
            <p className="font-sans text-xs text-navy/60 mt-3 bg-gold/10 border border-gold/30 rounded-md px-4 py-3">
              Preview: showing sample gifts. With live data, this page shows your own gifts after
              sign-in.
            </p>
          )}

          {!IS_MOCK && !signedIn && !loading && (
            <div className="card text-center mt-8">
              <p className="font-sans text-sm text-navy/70">
                Sign in to see your gifts. Your gifts are matched by email, so you lose nothing.
              </p>
              <a href="/login?next=/my-donations" className="btn-gold text-sm px-6 py-2.5 inline-block mt-4">
                Sign in
              </a>
            </div>
          )}

          {(IS_MOCK || signedIn) && (
            <>
              <div className="grid grid-cols-2 gap-3 mt-8 max-w-md">
                <div className="card">
                  <p className="font-sans text-[11px] uppercase tracking-wide text-navy/50">Total given</p>
                  <p className="font-serif text-2xl font-bold text-navy mt-1">{formatCurrency(totalGiven)}</p>
                </div>
                <div className="card">
                  <p className="font-sans text-[11px] uppercase tracking-wide text-navy/50">Gifts</p>
                  <p className="font-serif text-2xl font-bold text-navy mt-1">{donations.length}</p>
                </div>
              </div>

              {loading ? (
                <p className="font-sans text-sm text-navy/50 mt-8">Loading your gifts…</p>
              ) : donations.length === 0 ? (
                <div className="card text-center mt-8">
                  <p className="font-sans text-sm text-navy/70">
                    No gifts yet. When you give, each gift appears here with its delivery status,
                    and you get an email when the school confirms receipt.
                  </p>
                  <a href="/#needs" className="btn-gold text-sm px-6 py-2.5 inline-block mt-4">
                    Browse open needs
                  </a>
                </div>
              ) : (
                <ul className="space-y-4 mt-8">
                  {donations.map((gift) => (
                    <GiftCard key={gift.id} gift={gift} openNeeds={openNeeds} />
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
