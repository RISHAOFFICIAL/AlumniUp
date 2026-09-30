"use client";

import { useEffect, useState } from "react";

type Status = "idle" | "submitting" | "success" | "error";

const INITIAL_FORM = {
  schoolName: "",
  contactName: "",
  role: "",
  workEmail: "",
  phone: "",
  message: "",
  website: "", // honeypot
};

const COOLDOWN_SECONDS = 30;

export default function ForSchoolsPage() {
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
      const res = await fetch("/api/schools/register", {
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
        <h1 className="font-serif text-4xl md:text-5xl font-semibold text-navy">For Schools</h1>
        <p className="font-sans text-lg text-navy/70 mt-4 max-w-2xl">
          A direct line from Detroit alumni to the classrooms, fields, and programs that need it most.
        </p>

        {/* Value prop */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <div className="card">
            <h3 className="font-serif text-xl font-semibold text-navy">For Coaches</h3>
            <p className="font-sans text-sm text-navy/70 mt-2">
              Fund uniforms, equipment, field repairs, and travel. Stop paying out of pocket for the
              teams you lead.
            </p>
          </div>
          <div className="card">
            <h3 className="font-serif text-xl font-semibold text-navy">For Teachers</h3>
            <p className="font-sans text-sm text-navy/70 mt-2">
              Fund classroom supplies, field trips, and project materials. Alumni want to help
              specific, verified needs.
            </p>
          </div>
          <div className="card">
            <h3 className="font-serif text-xl font-semibold text-navy">For Administrators</h3>
            <p className="font-sans text-sm text-navy/70 mt-2">
              Fund building improvements, program support, and staff stipends through a trusted,
              tax-deductible channel.
            </p>
          </div>
        </div>

        {/* How verification works */}
        <div className="mt-16">
          <h2 className="font-serif text-3xl font-semibold text-navy text-center">How Verification Works</h2>
          <p className="font-sans text-sm text-navy/60 text-center mt-2 max-w-xl mx-auto">
            Every school and every need is reviewed before it goes live, so donors give with confidence.
          </p>
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <div className="card">
              <p className="font-serif text-4xl text-gold font-bold">01</p>
              <h3 className="font-serif text-xl font-semibold mt-3">Register your school</h3>
              <p className="font-sans text-sm text-navy/70 mt-2">
                Submit the form below. We verify your school and confirm your staff role typically within a few business days.
              </p>
            </div>
            <div className="card">
              <p className="font-serif text-4xl text-gold font-bold">02</p>
              <h3 className="font-serif text-xl font-semibold mt-3">Post a verified need</h3>
              <p className="font-sans text-sm text-navy/70 mt-2">
                Each funding need is reviewed and confirmed with your school before it is published to donors.
              </p>
            </div>
            <div className="card">
              <p className="font-serif text-4xl text-gold font-bold">03</p>
              <h3 className="font-serif text-xl font-semibold mt-3">Receive funds</h3>
              <p className="font-sans text-sm text-navy/70 mt-2">
                88% of every donation is disbursed to your school through our fiscal sponsor, Childs Play Foundation.
              </p>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="mt-16">
          <h2 className="font-serif text-3xl font-semibold text-navy text-center">Pricing</h2>
          <div className="grid md:grid-cols-2 gap-6 mt-8 max-w-2xl mx-auto">
            <div className="card border-2 border-gold">
              <p className="font-serif text-xl font-semibold">Founding Partner</p>
              <p className="font-serif text-4xl font-bold text-gold mt-2">$99<span className="font-sans text-base text-navy/50">/year</span></p>
              <p className="font-sans text-sm text-navy/50 mt-1">Free Year 1 · First 7 schools</p>
              <ul className="font-sans text-sm text-navy/70 mt-4 space-y-2">
                <li>✓ Verified need posting</li>
                <li>✓ 88% of donations to your school via Childs Play Foundation</li>
                <li>✓ School profile page</li>
                <li>✓ Donor tax receipts</li>
                <li>✓ Locked $99/yr founding rate</li>
              </ul>
            </div>
            <div className="card">
              <p className="font-serif text-xl font-semibold">Standard</p>
              <p className="font-serif text-4xl font-bold text-navy mt-2">$129<span className="font-sans text-base text-navy/50">/year</span></p>
              <p className="font-sans text-sm text-navy/50 mt-1">Free Year 1</p>
              <ul className="font-sans text-sm text-navy/70 mt-4 space-y-2">
                <li>✓ Verified need posting</li>
                <li>✓ 88% of donations to your school via Childs Play Foundation</li>
                <li>✓ School profile page</li>
                <li>✓ Donor tax receipts</li>
              </ul>
            </div>
          </div>
          <p className="font-sans text-sm text-navy/50 text-center mt-6">
            Martin Luther King Jr. Senior High School — Free forever (Founding Partner).
          </p>
        </div>

        {/* Registration form */}
        <div className="mt-16 max-w-xl mx-auto">
          <h2 className="font-serif text-2xl font-semibold text-navy text-center">Register Your School</h2>

          {status === "success" ? (
            <div className="card border-2 border-gold text-center mt-8">
              <h3 className="font-serif text-xl font-semibold text-navy">Registration received</h3>
              <p className="font-sans text-sm text-navy/70 mt-2">
                Thank you. Our team will verify your school and respond typically within a few business days.
              </p>
              <button
                type="button"
                disabled={cooldown > 0}
                onClick={() => setStatus("idle")}
                className="btn-ghost text-sm px-6 py-3 mt-6 disabled:opacity-60"
              >
                {cooldown > 0 ? `Please wait ${cooldown}s` : "Register another school"}
              </button>
            </div>
          ) : (
            <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
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
                <label className="font-sans text-sm font-medium">School Name</label>
                <input
                  type="text"
                  required
                  value={form.schoolName}
                  onChange={(e) => update("schoolName", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="font-sans text-sm font-medium">Contact Name</label>
                <input
                  type="text"
                  required
                  value={form.contactName}
                  onChange={(e) => update("contactName", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="font-sans text-sm font-medium">Role</label>
                <input
                  type="text"
                  required
                  placeholder="Coach, Teacher, Principal, Athletic Director..."
                  value={form.role}
                  onChange={(e) => update("role", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="font-sans text-sm font-medium">Work Email</label>
                <input
                  type="email"
                  required
                  value={form.workEmail}
                  onChange={(e) => update("workEmail", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="font-sans text-sm font-medium">Phone</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="font-sans text-sm font-medium">Message (optional)</label>
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
                {status === "submitting" ? "Submitting..." : "Submit Registration"}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
