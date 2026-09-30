"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  // Same guard the middleware uses: without a real URL/key, auth is off.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const configured =
    supabaseUrl.startsWith("https://") && !supabaseUrl.includes("placeholder");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError("");
    setMessage("");

    if (!configured) {
      setError("Sign-in is not configured yet. Supabase credentials are required.");
      return;
    }

    const rawNext = new URLSearchParams(window.location.search).get("next") || "/";
    const next = rawNext.startsWith("/") ? rawNext : "/";

    setBusy(true);
    try {
      const supabase = createClient();
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        window.location.href = next;
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { first_name: firstName, last_name: lastName } },
        });
        if (error) throw error;
        if (data.session) {
          window.location.href = next;
        } else {
          setMessage("Check your email to confirm your account.");
        }
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const inputClass =
    "w-full border border-border rounded px-4 py-3 font-sans text-sm mt-1 focus:outline-none focus:border-navy";

  return (
    <main className="min-h-screen bg-cream flex flex-col">
      <header className="bg-navy text-white">
        <div className="max-w-page mx-auto px-4 py-3 flex items-center justify-between">
          <a href="/" className="font-serif text-2xl font-bold">AlumniUp</a>
          <a href="/" className="btn-ghost text-xs px-4 py-2">Back to Home</a>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="card">
            <h1 className="font-serif text-2xl font-semibold text-navy text-center">
              {mode === "signin" ? "Sign In" : "Create an Account"}
            </h1>
            <p className="font-sans text-sm text-navy/60 text-center mt-2">
              {mode === "signin"
                ? "Sign in to access your AlumniUp account."
                : "New accounts start as donors. Staff roles are granted by an administrator."}
            </p>

            <form className="mt-6 space-y-3" onSubmit={handleSubmit}>
              {mode === "signup" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-sans text-sm font-medium">First Name</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="font-sans text-sm font-medium">Last Name</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="font-sans text-sm font-medium">Email</label>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="font-sans text-sm font-medium">Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass}
                />
              </div>

              {error && (
                <p className="font-sans text-sm text-navy bg-cream border border-navy/30 rounded px-3 py-2">
                  {error}
                </p>
              )}
              {message && (
                <p className="font-sans text-sm text-green bg-cream border border-navy/30 rounded px-3 py-2">
                  {message}
                </p>
              )}

              <button
                type="submit"
                disabled={busy}
                className="btn-gold w-full py-3 disabled:opacity-60"
              >
                {busy ? "Please wait..." : mode === "signin" ? "Sign In" : "Sign Up"}
              </button>
            </form>

            <button
              type="button"
              onClick={() => {
                setMode(mode === "signin" ? "signup" : "signin");
                setError("");
                setMessage("");
              }}
              className="font-sans text-sm text-navy/70 underline mt-4 w-full text-center"
            >
              {mode === "signin"
                ? "New here? Create an account"
                : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
