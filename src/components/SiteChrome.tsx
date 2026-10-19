"use client";

import { useState } from "react";
import { CONTACT, CPF_INFO } from "@/types";

const IS_MOCK = (process.env.NEXT_PUBLIC_DATA_SOURCE ?? "mock") === "mock";

export function TrustBar() {
  return (
    <div className="trust-bar">
      Fiscal Sponsor: <span className="text-gold-light font-semibold">{CPF_INFO.name}</span>
      {" · "}{CPF_INFO.classification} EIN {CPF_INFO.ein}
      {" · "}All donations tax-deductible
      {" · "}<span className="text-gold-light font-semibold">88% of every gift goes to schools</span>
      {" · "}Detroit, MI
    </div>
  );
}

export function PreviewBanner() {
  if (!IS_MOCK) return null;
  return (
    <div className="bg-gold text-navy text-xs text-center py-1.5 px-4 font-sans">
      Preview — sample data for demonstration. No real donations have occurred.
    </div>
  );
}

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-border">
      <div className="max-w-page mx-auto px-4 py-3 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2">
          <span className="font-serif text-2xl font-bold text-navy">
            Alumni<span className="text-gold">Up</span>
          </span>
        </a>

        <nav className="hidden md:flex items-center gap-6 font-sans text-sm">
          <a href="/#how-it-works" className="hover:text-gold transition-colors">How It Works</a>
          <a href="/for-schools" className="hover:text-gold transition-colors">For Schools</a>
          <a href="#" className="hover:text-gold transition-colors">My Donations</a>
          <a href="/press" className="hover:text-gold transition-colors">Press</a>
          <a href="/wall-of-honor" className="hover:text-gold transition-colors">Wall of Honor</a>
          <a href="#" className="hover:text-gold transition-colors">Contact</a>
        </nav>

        <div className="flex items-center gap-3">
          <a href="/corporate-giving" className="btn-ghost text-xs px-4 py-2 hidden md:inline-block">
            Corporate Giving
          </a>
          <a href="/submit-need" className="btn-gold text-xs px-4 py-2">
            Submit a Need
          </a>
          <button
            className="md:hidden p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-border px-4 py-4 bg-white">
          <nav className="flex flex-col gap-3 font-sans text-sm">
            <a href="/#how-it-works" className="py-2">How It Works</a>
            <a href="/for-schools" className="py-2">For Schools</a>
            <a href="#" className="py-2">My Donations</a>
            <a href="/press" className="py-2">Press</a>
            <a href="/wall-of-honor" className="py-2">Wall of Honor</a>
            <a href="#" className="py-2">Contact</a>
            <a href="/corporate-giving" className="py-2">Corporate Giving</a>
          </nav>
        </div>
      )}
    </header>
  );
}

export function SiteHeader() {
  return (
    <>
      <TrustBar />
      <Header />
    </>
  );
}

export function Footer() {
  return (
    <footer className="bg-navy text-white py-12">
      <div className="max-w-page mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <p className="font-serif text-xl font-bold">
              Alumni<span className="text-gold">Up</span>
            </p>
            <p className="font-sans text-xs text-white/50 mt-2">
              Connecting Detroit alumni with school needs, and tracking every gift in public until the school confirms it arrived.
            </p>
          </div>
          <div>
            <h4 className="font-sans text-sm font-semibold mb-3">Quick Links</h4>
            <ul className="font-sans text-xs text-white/60 space-y-2">
              <li><a href="/#how-it-works" className="hover:text-gold">How It Works</a></li>
              <li><a href="/for-schools" className="hover:text-gold">For Schools</a></li>
              <li><a href="/corporate-giving" className="hover:text-gold">Corporate Giving</a></li>
              <li><a href="/press" className="hover:text-gold">Press</a></li>
              <li><a href="/wall-of-honor" className="hover:text-gold">Wall of Honor</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-sans text-sm font-semibold mb-3">Contact</h4>
            <ul className="font-sans text-xs text-white/60 space-y-2">
              <li><a href={`mailto:${CONTACT.hello}`} className="hover:text-gold">{CONTACT.hello}</a></li>
              <li><a href={`mailto:${CONTACT.schools}`} className="hover:text-gold">{CONTACT.schools}</a></li>
              <li><a href={`mailto:${CONTACT.sponsors}`} className="hover:text-gold">{CONTACT.sponsors}</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-sans text-sm font-semibold mb-3">Legal</h4>
            <ul className="font-sans text-xs text-white/60 space-y-2">
              <li>Terms of Service</li>
              <li>Privacy Policy</li>
              <li>
                <a href="/admin/pending" className="text-white/30 hover:text-white/60">Admin</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 mt-8 pt-6 text-center">
          <p className="font-sans text-xs text-white/40">
            © {new Date().getFullYear()} AlumniUp · Built in Detroit by HGH Management Group. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export function SiteFooter() {
  return (
    <>
      <PreviewBanner />
      <Footer />
    </>
  );
}
