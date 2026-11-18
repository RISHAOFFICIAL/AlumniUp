"use client";

// Stripe cancel return target. No charge was made; the need is one tap away.

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";

function CancelledBody() {
  const searchParams = useSearchParams();
  const needId = searchParams.get("need_id");

  return (
    <div className="max-w-page mx-auto px-4 py-16 text-center">
      <h1 className="font-serif text-3xl md:text-4xl font-semibold text-navy">No charge was made</h1>
      <p className="font-sans text-sm text-navy/70 mt-3 max-w-md mx-auto leading-relaxed">
        You left checkout before completing your gift. Nothing was saved and nothing was charged.
        The need is still here whenever you are ready.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {needId ? (
          <a href={`/needs/${needId}`} className="btn-gold text-sm px-6 py-2.5">
            Back to the need
          </a>
        ) : null}
        <a href="/#needs" className="btn-ghost text-sm px-6 py-2.5">Browse open needs</a>
      </div>
    </div>
  );
}

export default function DonateCancelledPage() {
  return (
    <>
      <SiteHeader />
      <Suspense
        fallback={
          <div className="max-w-page mx-auto px-4 py-16 text-center">
            <p className="font-sans text-navy/60">Loading…</p>
          </div>
        }
      >
        <CancelledBody />
      </Suspense>
      <SiteFooter />
    </>
  );
}
