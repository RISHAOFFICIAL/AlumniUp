"use client";

import { useEffect, useState } from "react";
import { useSchools } from "@/hooks";
import { CATEGORIES, URGENCY_LABELS } from "@/types";

type Status = "idle" | "submitting" | "success" | "error";

const INITIAL_FORM = {
  schoolId: "",
  title: "",
  description: "",
  category: "Sports",
  urgency: "med",
  goalAmount: "",
  minimumAmount: "",
  submittedByName: "",
  submittedByTitle: "",
  submittedByEmail: "",
  submittedByPhone: "",
  website: "", // honeypot
};

const COOLDOWN_SECONDS = 30;
const MAX_PHOTO_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

// Same mock/supabase toggle as src/hooks/index.ts.
const USE_MOCK = (process.env.NEXT_PUBLIC_DATA_SOURCE ?? "mock") === "mock";

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export default function SubmitNeedPage() {
  const { schools, loading: schoolsLoading } = useSchools();
  const [form, setForm] = useState({ ...INITIAL_FORM });
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [cooldown, setCooldown] = useState(0);

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const [attestStaff, setAttestStaff] = useState(false);
  const [attestNoStudentInfo, setAttestNoStudentInfo] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  function update(field: keyof typeof INITIAL_FORM, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    if (!file) {
      setPhotoFile(null);
      setPhotoPreview(null);
      setPhotoError(null);
      return;
    }
    if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
      setPhotoFile(null);
      setPhotoPreview(null);
      setPhotoError("Please upload a JPG, PNG, or WebP image.");
      e.target.value = "";
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setPhotoFile(null);
      setPhotoPreview(null);
      setPhotoError("Image must be 5 MB or smaller.");
      e.target.value = "";
      return;
    }
    setPhotoError(null);
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "submitting" || cooldown > 0) return;

    if (!attestStaff || !attestNoStudentInfo) {
      setErrorMsg("Please confirm both statements below before submitting.");
      setStatus("error");
      return;
    }

    setStatus("submitting");
    setErrorMsg("");

    try {
      // In mock mode the photo is preview-only (not uploaded). In supabase mode
      // we read it as a data URL so the server can store it in need-photos.
      let photoData: string | null = null;
      if (photoFile && !USE_MOCK) {
        photoData = await readAsDataUrl(photoFile);
      }

      const payload = {
        schoolId: form.schoolId,
        title: form.title,
        description: form.description,
        category: form.category,
        urgency: form.urgency,
        goalAmount: Number(form.goalAmount),
        minimumAmount:
          form.minimumAmount.trim() === "" ? null : Number(form.minimumAmount),
        submittedByName: form.submittedByName,
        submittedByTitle: form.submittedByTitle,
        submittedByEmail: form.submittedByEmail,
        submittedByPhone: form.submittedByPhone,
        photoData,
        attestStaff,
        attestNoStudentInfo,
        website: form.website,
      };

      const res = await fetch("/api/needs/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
      setPhotoFile(null);
      setPhotoPreview(null);
      setPhotoError(null);
      setAttestStaff(false);
      setAttestNoStudentInfo(false);
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
        Fiscal Sponsor: Childs Play Foundation, Inc. | 501(c)(3) EIN 86-2707543 | 88% to Schools | Detroit, MI
      </div>

      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-page mx-auto px-4 py-3 flex items-center justify-between">
          <a href="/" className="font-serif text-2xl font-bold text-navy">AlumniUp</a>
          <a href="/" className="btn-ghost text-xs px-4 py-2">Back to Home</a>
        </div>
      </header>

      <div className="max-w-page mx-auto px-4 py-16 md:py-24">
        <h1 className="font-serif text-4xl md:text-5xl font-semibold text-navy">Submit a Need</h1>
        <p className="font-sans text-lg text-navy/70 mt-4 max-w-2xl">
          For coaches, teachers, and administrators at participating Detroit public schools. Every
          submission is reviewed before it goes live.
        </p>

        <div className="grid md:grid-cols-3 gap-6 mt-10 max-w-4xl">
          <div className="card">
            <p className="font-serif text-3xl text-gold font-bold">01</p>
            <p className="font-sans text-sm text-navy/70 mt-2">Submit your funding need with a clear description and target amount.</p>
          </div>
          <div className="card">
            <p className="font-serif text-3xl text-gold font-bold">02</p>
            <p className="font-sans text-sm text-navy/70 mt-2">Our team verifies the need and your school role before approving it.</p>
          </div>
          <div className="card">
            <p className="font-serif text-3xl text-gold font-bold">03</p>
            <p className="font-sans text-sm text-navy/70 mt-2">Approved needs go live, and 88% of donations are disbursed to your school.</p>
          </div>
        </div>

        <div className="mt-14 max-w-xl mx-auto">
          <h2 className="font-serif text-2xl font-semibold text-navy text-center">Funding Need Details</h2>

          {status === "success" ? (
            <div className="card border-2 border-gold text-center mt-8">
              <h3 className="font-serif text-xl font-semibold text-navy">Submission received</h3>
              <p className="font-sans text-sm text-navy/70 mt-2">
                Your need has been sent for review. It will appear on the platform once our team has
                verified and approved it.
              </p>
              <button
                type="button"
                disabled={cooldown > 0}
                onClick={() => setStatus("idle")}
                className="btn-ghost text-sm px-6 py-3 mt-6 disabled:opacity-60"
              >
                {cooldown > 0 ? `Please wait ${cooldown}s` : "Submit another need"}
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
                <label className="font-sans text-sm font-medium">School</label>
                <select
                  required
                  value={form.schoolId}
                  onChange={(e) => update("schoolId", e.target.value)}
                  className={inputClass}
                >
                  <option value="" disabled>
                    {schoolsLoading ? "Loading schools..." : "Select your school"}
                  </option>
                  {schools.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-sans text-sm font-medium">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Varsity Track Uniforms"
                  value={form.title}
                  onChange={(e) => update("title", e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="font-sans text-sm font-medium">Description</label>
                <textarea
                  rows={5}
                  required
                  placeholder="What do you need, why does it matter, and how will it help students?"
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-sans text-sm font-medium">Category</label>
                  <select
                    required
                    value={form.category}
                    onChange={(e) => update("category", e.target.value)}
                    className={inputClass}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-sans text-sm font-medium">Priority</label>
                  <select
                    required
                    value={form.urgency}
                    onChange={(e) => update("urgency", e.target.value)}
                    className={inputClass}
                  >
                    {(Object.keys(URGENCY_LABELS) as Array<keyof typeof URGENCY_LABELS>).map(
                      (u) => (
                        <option key={u} value={u}>
                          {URGENCY_LABELS[u]}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-sans text-sm font-medium">Target Amount ($)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="1"
                    value={form.goalAmount}
                    onChange={(e) => update("goalAmount", e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="font-sans text-sm font-medium">Minimum to Launch ($, optional)</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={form.minimumAmount}
                    onChange={(e) => update("minimumAmount", e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="font-sans text-sm font-medium">Photo (optional)</label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePhotoChange}
                  className={inputClass}
                />
                <p className="font-sans text-xs text-navy/50 mt-1">
                  JPG, PNG, or WebP up to 5 MB. Do not include student faces or names.
                </p>
                {photoError && (
                  <p className="font-sans text-xs text-navy mt-1">{photoError}</p>
                )}
                {photoPreview && (
                  <img
                    src={photoPreview}
                    alt="Need photo preview"
                    className="mt-2 max-h-48 rounded border border-border"
                  />
                )}
              </div>

              <div>
                <label className="font-sans text-sm font-medium">Your Name</label>
                <input
                  type="text"
                  required
                  value={form.submittedByName}
                  onChange={(e) => update("submittedByName", e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="font-sans text-sm font-medium">Role</label>
                <input
                  type="text"
                  placeholder="Coach, Teacher, Principal, Athletic Director..."
                  value={form.submittedByTitle}
                  onChange={(e) => update("submittedByTitle", e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-sans text-sm font-medium">Work Email</label>
                  <input
                    type="email"
                    required
                    value={form.submittedByEmail}
                    onChange={(e) => update("submittedByEmail", e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="font-sans text-sm font-medium">Phone</label>
                  <input
                    type="tel"
                    value={form.submittedByPhone}
                    onChange={(e) => update("submittedByPhone", e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Attestations */}
              <div className="border border-border rounded p-4 space-y-3">
                <label className="flex items-start gap-3 font-sans text-sm text-navy/70">
                  <input
                    type="checkbox"
                    required
                    checked={attestStaff}
                    onChange={(e) => setAttestStaff(e.target.checked)}
                    className="mt-0.5"
                  />
                  <span>I am a coach, teacher, or administrator at the selected school.</span>
                </label>
                <label className="flex items-start gap-3 font-sans text-sm text-navy/70">
                  <input
                    type="checkbox"
                    required
                    checked={attestNoStudentInfo}
                    onChange={(e) => setAttestNoStudentInfo(e.target.checked)}
                    className="mt-0.5"
                  />
                  <span>This request does not include student names or images of students.</span>
                </label>
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
                {status === "submitting" ? "Submitting..." : "Submit for Review"}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
