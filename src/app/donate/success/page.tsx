"use client";

// S6 Donation confirmation (Stripe return target). The webhook records the
// gift; this page confirms the checkout session so the donor sees their
// gift and its reference right away, even if the receipt email is slow.

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

interface SessionInfo {
  status: string;
  paymentStatus: string;
  amountTotal: number | null;
  customerEmail: string | null;
  needId: string | null;
  isRecurring: boolean;
}

function SuccessBody() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [info, setInfo] = useState<SessionInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setError("No checkout session was found.");
      return;
    }
    fetch(`/api/checkout/session?session_id=${encodeURIComponent(sessionId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.error) setError(data.error);
        else setInfo(data as SessionInfo);
      })
      .catch(() => setError("We could not confirm your checkout session."));
  }, [sessionId]);

  return (
    <div className="max-w-page mx-auto px-4 py-16 text-center">
      <div className="w-12 h-12 mx-auto rounded-full bg-green/15 flex items-center justify-center">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1B6B42" strokeWidth="2">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      </div>
      <h1 className="font-serif text-3xl md:text-4xl font-semibold text-navy mt-4">Thank you</h1>

      {error ? (
        <p className="font-sans text-sm text-navy/70 mt-3 max-w-md mx-auto leading-relaxed">
          {error} If you completed a payment, your receipt is on its way by email and your gift
          appears in My Donations.
        </p>
      ) : !info ? (
        <p className="font-sans text-sm text-navy/60 mt-3">Confirming your gift…</p>
      ) : (
        <>
          <p className="font-sans text-sm text-navy/70 mt-3 max-w-md mx-auto leading-relaxed">
            Your {info.isRecurring ? "monthly" : "one-time"} donation
            {info.amountTotal != null ? (
              <>
                {" "}of <span className="font-semibold text-navy">{formatCurrency(info.amountTotal)}</span>
              </>
            ) : null}{" "}
            is complete.
          </p>
          {info.customerEmail && (
            <p className="font-sans text-xs text-navy/60 mt-2">
              Your tax receipt will be sent to {info.customerEmail}.
            </p>
          )}
          {info.needId && (
            <p className="font-sans text-sm text-navy/70 mt-4">
              <a href={`/needs/${info.needId}`} className="text-gold hover:underline">
                Follow this gift on the public money trail →
              </a>
            </p>
          )}
        </>
      )}

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <a href="/my-donations" className="btn-gold text-sm px-6 py-2.5">My Donations</a>
        <a href="/#needs" className="btn-ghost text-sm px-6 py-2.5">Browse more needs</a>
      </div>
    </div>
  );
}

export default function DonateSuccessPage() {
  return (
    <>
      <SiteHeader />
      <Suspense
        fallback={
          <div className="max-w-page mx-auto px-4 py-16 text-center">
            <p className="font-sans text-navy/60">Confirming your gift…</p>
          </div>
        }
      >
        <SuccessBody />
      </Suspense>
      <SiteFooter />
    </>
  );
}
