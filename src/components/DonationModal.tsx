"use client";

import { useEffect, useState } from "react";
import type { Need } from "@/types";
import { DONATION_PRESETS, FEE_SPLIT } from "@/types";
import { submitDonation, type DonationResult } from "@/lib/donations";

type Frequency = "once" | "monthly";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Donation checkout modal. Mock mode simulates a successful donation through
 * `submitDonation()` (no real charge); Supabase/Stripe mode calls the server
 * route that owns Stripe. Privacy: an anonymous donation sends no identity.
 */
export default function DonationModal({
  need,
  open,
  onClose,
  onShare,
}: {
  need: Need | null;
  open: boolean;
  onClose: () => void;
  onShare?: (need: Need) => void;
}) {
  const [amount, setAmount] = useState<number>(50);
  const [customAmount, setCustomAmount] = useState("");
  const [frequency, setFrequency] = useState<Frequency>("once");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"form" | "processing" | "success">("form");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DonationResult | null>(null);

  // Reset form whenever the modal opens (or the selected need changes).
  useEffect(() => {
    if (open) {
      setStatus("form");
      setError(null);
      setResult(null);
      setAmount(50);
      setCustomAmount("");
      setFrequency("once");
      setName("");
      setEmail("");
      setAnonymous(false);
      setMessage("");
    }
  }, [open, need?.id]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && status !== "processing") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, status]);

  if (!open || !need) return null;

  const usingCustom = customAmount !== "";
  const finalAmount = usingCustom ? Number(customAmount) : amount;
  const emailValid = /.+@.+\..+/.test(email.trim());
  const isValid = Number.isFinite(finalAmount) && finalAmount > 0 && emailValid;
  const schoolAmount = isValid ? Math.round(finalAmount * FEE_SPLIT.school * 100) / 100 : 0;
  const schoolName = need.school?.name ?? "this school";
  const isMock = (process.env.NEXT_PUBLIC_DATA_SOURCE ?? "mock") === "mock";

  async function handleSubmit() {
    if (!isValid || status === "processing") return;
    setStatus("processing");
    setError(null);

    const res = await submitDonation({
      needId: need!.id,
      amount: finalAmount,
      isAnonymous: anonymous,
      isRecurring: frequency === "monthly",
      displayName: name.trim() || null,
      email: email.trim(),
      message: message.trim() || null,
    });

    if (res.success) {
      setResult(res);
      setStatus("success");
    } else {
      setError(res.error ?? "Something went wrong. Please try again.");
      setStatus("form");
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Donate to this need"
    >
      <div
        className="absolute inset-0 bg-navy/60"
        onClick={status === "processing" ? undefined : onClose}
        aria-hidden="true"
      />

      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6 md:p-8 max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          disabled={status === "processing"}
          aria-label="Close"
          className="absolute top-3 right-3 p-2 text-navy/50 hover:text-navy disabled:opacity-40"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {status === "success" ? (
          <SuccessState
            need={need}
            finalAmount={finalAmount}
            frequency={frequency}
            isMock={isMock}
            schoolName={schoolName}
            email={email.trim()}
            result={result}
            onShare={() => onShare?.(need)}
            onClose={onClose}
          />
        ) : (
          <>
            <p className="font-sans text-xs font-medium uppercase tracking-wider text-gold">
              Support this need
            </p>
            <h3 className="font-serif text-xl md:text-2xl font-semibold text-navy mt-2">
              {need.title}
            </h3>
            <p className="font-sans text-sm text-navy/60 mt-1">{schoolName}</p>

            {/* Amount */}
            <div className="mt-5">
              <p className="font-sans text-sm font-medium text-navy mb-2">Amount</p>
              <div className="grid grid-cols-3 gap-2">
                {DONATION_PRESETS.map((preset) => {
                  const selected = !usingCustom && amount === preset;
                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        setAmount(preset);
                        setCustomAmount("");
                      }}
                      className={`py-2 rounded font-sans text-sm border transition-colors ${
                        selected
                          ? "bg-navy text-white border-navy"
                          : "bg-white text-navy border-border hover:border-navy"
                      }`}
                    >
                      {formatCurrency(preset)}
                    </button>
                  );
                })}
              </div>
              <input
                type="number"
                min="1"
                step="1"
                inputMode="numeric"
                placeholder="Custom amount"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="mt-2 w-full border border-border rounded px-4 py-2 font-sans text-sm focus:outline-none focus:border-navy"
              />
            </div>

            {/* Frequency */}
            <div className="mt-5">
              <p className="font-sans text-sm font-medium text-navy mb-2">Frequency</p>
              <div className="grid grid-cols-2 gap-2">
                {(["once", "monthly"] as Frequency[]).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFrequency(f)}
                    className={`py-2 rounded font-sans text-sm border transition-colors ${
                      frequency === f
                        ? "bg-navy text-white border-navy"
                        : "bg-white text-navy border-border hover:border-navy"
                    }`}
                  >
                    {f === "once" ? "One-time" : "Monthly"}
                  </button>
                ))}
              </div>
            </div>

            {/* Donor info */}
            <div className="mt-5">
              <p className="font-sans text-sm font-medium text-navy mb-2">Your details</p>
              <input
                type="text"
                placeholder="Name (optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-border rounded px-4 py-2 font-sans text-sm focus:outline-none focus:border-navy"
              />
              <input
                type="email"
                placeholder="Email (required for tax receipt)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full border border-border rounded px-4 py-2 font-sans text-sm focus:outline-none focus:border-navy"
              />
              {email !== "" && !emailValid && (
                <p className="mt-1 font-sans text-xs text-red-700">
                  Enter a valid email to receive your tax receipt.
                </p>
              )}
            </div>

            {/* Anonymous + message */}
            <label className="flex items-start gap-3 mt-5 cursor-pointer">
              <input
                type="checkbox"
                checked={anonymous}
                onChange={(e) => setAnonymous(e.target.checked)}
                className="mt-1"
              />
              <span className="font-sans text-sm text-navy/80">
                Give anonymously (your name will not appear on the Wall of Honor)
              </span>
            </label>

            {!anonymous && (
              <input
                type="text"
                placeholder="Optional message for the Wall of Honor"
                value={message}
                maxLength={140}
                onChange={(e) => setMessage(e.target.value)}
                className="mt-3 w-full border border-border rounded px-4 py-2 font-sans text-sm focus:outline-none focus:border-navy"
              />
            )}

            {/* Fee transparency */}
            <div className="bg-cream rounded-md p-4 mt-5 font-sans text-xs text-navy/70 leading-relaxed">
              <p className="font-medium text-navy mb-1">
                {isValid
                  ? `School receives ${formatCurrency(schoolAmount)} (88%)`
                  : "88% of every donation goes to the school"}
              </p>
              <p>
                7% platform fee · 5% fiscal-sponsor fee · Stripe processing separate.
                Donations are tax-deductible via Childs Play Foundation, Inc. (501(c)(3)).
              </p>
            </div>

            {error && (
              <p className="mt-4 font-sans text-sm text-red-700">{error}</p>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={!isValid || status === "processing"}
              className="btn-gold w-full py-3 text-sm mt-5 disabled:opacity-50"
            >
              {status === "processing"
                ? "Processing…"
                : `Donate ${isValid ? formatCurrency(finalAmount) : ""}`}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function SuccessState({
  need,
  finalAmount,
  frequency,
  isMock,
  schoolName,
  email,
  result,
  onShare,
  onClose,
}: {
  need: Need;
  finalAmount: number;
  frequency: Frequency;
  isMock: boolean;
  schoolName: string;
  email: string;
  result: DonationResult | null;
  onShare: () => void;
  onClose: () => void;
}) {
  return (
    <div className="text-center">
      <div className="w-12 h-12 mx-auto rounded-full bg-green/15 flex items-center justify-center">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1B6B42" strokeWidth="2">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      </div>
      <h3 className="font-serif text-2xl font-semibold text-navy mt-4">Thank you</h3>
      <p className="font-sans text-sm text-navy/70 mt-3 leading-relaxed">
        Your {frequency === "monthly" ? "monthly" : "one-time"} donation of{" "}
        <span className="font-semibold text-navy">{formatCurrency(finalAmount)}</span> to{" "}
        {schoolName} is complete.
      </p>
      <p className="font-sans text-xs text-navy/50 mt-2">
        Supporting &ldquo;{need.title}&rdquo;
        {result?.paymentIntentId ? ` · Reference ${result.paymentIntentId}` : ""}
      </p>
      {email && (
        <p className="font-sans text-xs text-navy/60 mt-2">
          Your tax receipt will be sent to {email}.
        </p>
      )}

      {isMock && (
        <p className="bg-cream rounded-md p-3 mt-4 font-sans text-xs text-navy/70">
          Preview — no real payment was processed.
        </p>
      )}

      <div className="mt-6 space-y-3">
        <button type="button" onClick={onShare} className="btn-gold w-full py-2.5 text-sm">
          Share your support
        </button>
        <button type="button" onClick={onClose} className="btn-ghost w-full py-2.5 text-sm">
          Done
        </button>
      </div>
    </div>
  );
}
