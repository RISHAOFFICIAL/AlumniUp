"use client";

import { useEffect, useState } from "react";

type Status = "idle" | "submitting" | "success" | "error";

const INITIAL_FORM = {
  company: "",
  contact: "",
  email: "",
  tier: "gold",
  message: "",
  website: "", // honeypot
};

const COOLDOWN_SECONDS = 30;

export default function CorporateGivingPage() {
  const [form, setForm] = useState({ ...INITIAL_FORM });
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  function update(field: keyof typeof INITIAL_FORM, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "submitting" || cooldown > 0) return;
    setStatus("submitting");
    setErrorMsg("");

    try {
      const res = await fetch("/api/sponsors/inquire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        setErrorMsg(data.error || "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }

      setStatus("success");
      setCooldown(COOLDOWN_SECONDS);
      setForm({ ...INITIAL_FORM });
    } catch {
      setErrorMsg("Network error. Please try again.");
      setStatus("error");
    }
  }

  const inputClass =
    "w-full border border-border rounded px-4 py-3 font-sans text-sm mt-1 focus:outline-none focus:border-navy";

  return (
    <main className="min-h-screen bg-white">
      {/* Trust Bar */}
      <div className="bg-navy text-white text-xs text-center py-2 px-4 font-sans tracking-wide">
        Fiscal Sponsor: Childs Play Foundation, Inc. | 501(c)(3) EIN 86-2707543 | All Donations Tax-Deductible | 88% to Schools | Detroit, MI
      </div>

      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-page mx-auto px-4 py-3 flex items-center justify-between">
          <a href="/" className="font-serif text-2xl font-bold text-navy">AlumniUp</a>
          <a href="/" className="btn-ghost text-xs px-4 py-2">Back to Home</a>
        </div>
      </header>

      <div className="max-w-page mx-auto px-4 py-16 md:py-24">
        <h1 className="font-serif text-4xl md:text-5xl font-semibold text-navy">Corporate Giving</h1>
        <p className="font-sans text-lg text-navy/70 mt-4 max-w-2xl">
          Partner with AlumniUp to support Detroit public schools.
        </p>

        {/* Tiers */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <div className="card border-2 border-gold">
            <p className="font-serif text-2xl font-semibold text-gold">Gold</p>
            <p className="font-serif text-3xl font-bold text-navy mt-2">$2,500+</p>
            <ul className="font-sans text-sm text-navy/70 mt-4 space-y-2">
              <li>✓ Logo placement on homepage</li>
              <li>✓ Wall of Honor recognition</li>
              <li>✓ Impact summary</li>
            </ul>
          </div>
          <div className="card">
            <p className="font-serif text-2xl font-semibold text-navy">Silver</p>
            <p className="font-serif text-3xl font-bold text-navy mt-2">$1,000+</p>
            <ul className="font-sans text-sm text-navy/70 mt-4 space-y-2">
              <li>✓ Logo placement on school pages</li>
              <li>✓ Wall of Honor recognition</li>
              <li>✓ Impact summary</li>
            </ul>
          </div>
          <div className="card">
            <p className="font-serif text-2xl font-semibold text-navy">Bronze</p>
            <p className="font-serif text-3xl font-bold text-navy mt-2">$250+</p>
            <ul className="font-sans text-sm text-navy/70 mt-4 space-y-2">
              <li>✓ Wall of Honor recognition</li>
              <li>✓ Impact summary</li>
            </ul>
          </div>
        </div>

        <p className="font-sans text-sm text-navy/60 mt-8 p-4 bg-cream rounded">
          <strong>Tax Deductibility:</strong> Sponsorships can be structured as a tax-deductible
          donation through Childs Play Foundation, Inc. (501(c)(3) EIN 86-2707543), or as a
          non-deductible sponsorship contract. Consult your tax advisor.
        </p>

        <h2 className="font-serif text-2xl font-semibold text-navy mt-16 text-center">Inquire About Corporate Giving</h2>

        {status === "success" ? (
          <div className="card border-2 border-gold text-center mt-8 max-w-xl mx-auto">
            <h3 className="font-serif text-xl font-semibold text-navy">Inquiry received</h3>
            <p className="font-sans text-sm text-navy/70 mt-2">
              Thank you. Our partnerships team will reach out to discuss options with you.
            </p>
            <button
              type="button"
              disabled={cooldown > 0}
              onClick={() => setStatus("idle")}
              className="btn-ghost text-sm px-6 py-3 mt-6 disabled:opacity-60"
            >
              {cooldown > 0 ? `Please wait ${cooldown}s` : "Submit another inquiry"}
            </button>
          </div>
        ) : (
          <form className="mt-8 max-w-xl mx-auto space-y-4" onSubmit={handleSubmit}>
            {/* Honeypot (hidden from humans) */}
            <input
              type="text"
              name="website"
              value={form.website}
              onChange={(e) => update("website", e.target.value)}
              className="hidden"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
            />

            <div>
              <label className="font-sans text-sm font-medium">Company</label>
              <input
                type="text"
                required
                value={form.company}
                onChange={(e) => update("company", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="font-sans text-sm font-medium">Contact Name</label>
              <input
                type="text"
                required
                value={form.contact}
                onChange={(e) => update("contact", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="font-sans text-sm font-medium">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="font-sans text-sm font-medium">Interest Tier</label>
              <select
                value={form.tier}
                onChange={(e) => update("tier", e.target.value)}
                className={inputClass}
              >
                <option value="gold">Gold ($2,500+)</option>
                <option value="silver">Silver ($1,000+)</option>
                <option value="bronze">Bronze ($250+)</option>
              </select>
            </div>
            <div>
              <label className="font-sans text-sm font-medium">Message</label>
              <textarea
                rows={4}
                value={form.message}
                onChange={(e) => update("message", e.target.value)}
                className={inputClass}
              />
            </div>

            {status === "error" && (
              <p className="font-sans text-sm text-navy bg-cream border border-navy/30 rounded px-4 py-3">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={status === "submitting" || cooldown > 0}
              className="btn-gold w-full py-3 disabled:opacity-60"
            >
              {status === "submitting" ? "Submitting..." : "Submit Inquiry"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
