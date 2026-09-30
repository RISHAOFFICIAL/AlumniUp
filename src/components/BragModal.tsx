"use client";

import { useEffect, useState } from "react";
import type { Need } from "@/types";

/**
 * "Brag" / share modal — the flow a donor sees after contributing. Because the
 * donation checkout isn't built yet, it is wired to the Share button on need
 * cards so a supporter can preview and share a need right now.
 *
 * Privacy: shares only the need title + school name, never donor identity or
 * email. Anonymous donors are unaffected (no identity is ever read here).
 */
export default function BragModal({
  need,
  open,
  onClose,
}: {
  need: Need | null;
  open: boolean;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !need) return null;

  const shareUrl =
    typeof window !== "undefined" ? `${window.location.origin}/#needs` : "/#needs";
  const schoolName = need.school?.name ?? "a Detroit school";
  const shareText = `I'm supporting "${need.title}" at ${schoolName} on AlumniUp. Join me.`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard may be unavailable (non-secure context); fail silently.
    }
  }

  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    shareText
  )}&url=${encodeURIComponent(shareUrl)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
    shareUrl
  )}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
    shareUrl
  )}`;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Share this need"
    >
      <div
        className="absolute inset-0 bg-navy/60"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6 md:p-8">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 p-2 text-navy/50 hover:text-navy"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <p className="font-sans text-xs font-medium uppercase tracking-wider text-gold">
          Share this need
        </p>
        <h3 className="font-serif text-xl md:text-2xl font-semibold text-navy mt-2">
          I&apos;m supporting &ldquo;{need.title}&rdquo;
        </h3>
        <p className="font-sans text-sm text-navy/60 mt-1">{schoolName}</p>

        <div className="bg-cream rounded-md p-4 mt-5 font-sans text-sm text-navy/80 leading-relaxed">
          {shareText}
        </div>

        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={copyLink}
            className="btn-gold w-full py-2.5 text-sm"
          >
            {copied ? "Link copied" : "Copy link"}
          </button>

          <div className="grid grid-cols-3 gap-3">
            <a
              href={tweetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost text-center text-sm py-2.5"
            >
              X
            </a>
            <a
              href={facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost text-center text-sm py-2.5"
            >
              Facebook
            </a>
            <a
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost text-center text-sm py-2.5"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
