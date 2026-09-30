"use client";

import { useNeeds, useDonationStats, useWallOfHonor, useTopSchools } from "@/hooks";
import type { Need, School } from "@/types";
import { CATEGORIES, CONTACT, CPF_INFO, URGENCY_LABELS } from "@/types";
import { FOUNDER } from "@/lib/content/founder";
import BragModal from "@/components/BragModal";
import DonationModal from "@/components/DonationModal";
import { useState } from "react";

// Mock mode is the default until real Supabase credentials are wired up.
const IS_MOCK = (process.env.NEXT_PUBLIC_DATA_SOURCE ?? "mock") === "mock";

// Utility
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// ─── Trust Bar ─────────────────────────────────────────
function TrustBar() {
  return (
    <div className="trust-bar">
      Fiscal Sponsor: {CPF_INFO.name} | {CPF_INFO.classification} EIN {CPF_INFO.ein} | All Donations Tax-Deductible | 88% to Schools | Detroit, MI
    </div>
  );
}

// Slim, unobtrusive label so mock/demo data is never mistaken for real activity.
function PreviewBanner() {
  if (!IS_MOCK) return null;
  return (
    <div className="bg-gold text-navy text-xs text-center py-1.5 px-4 font-sans">
      Preview — sample data for demonstration. No real donations have occurred.
    </div>
  );
}

// ─── Header ────────────────────────────────────────────
function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border">
      <div className="max-w-page mx-auto px-4 py-3 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2">
          <span className="font-serif text-2xl font-bold text-navy">AlumniUp</span>
        </a>

        <nav className="hidden md:flex items-center gap-6 font-sans text-sm">
          <a href="#how-it-works" className="hover:text-gold transition-colors">How It Works</a>
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
            <a href="#how-it-works" className="py-2">How It Works</a>
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

// ─── Hero ──────────────────────────────────────────────
function Hero() {
  const stats = useDonationStats();
  const { needs } = useNeeds();
  const featured = needs[0];

  return (
    <section className="bg-cream py-16 md:py-24">
      <div className="max-w-page mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left column: headline, stats, calls-to-action */}
          <div>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold text-navy leading-tight text-balance">
              Your alma mater needs you. Again.
            </h1>
            <p className="font-sans text-lg md:text-xl text-navy/80 mt-6 max-w-2xl leading-relaxed">
              AlumniUp connects Detroit public school alumni with verified funding needs posted by coaches,
              teachers, and administrators. Every donation is tax-deductible through our fiscal sponsor,
              Childs Play Foundation, Inc.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10">
              <StatCard label="Total Raised" value={formatCurrency(stats.totalRaised)} />
              <StatCard label="Needs Funded" value={String(stats.needsFunded)} />
              <StatCard label="Alumni Donors" value={String(stats.donorCount)} />
              <StatCard label="Schools" value={String(stats.schoolCount)} />
            </div>

            <div className="flex flex-wrap gap-4 mt-10">
              <a href="#needs" className="btn-gold text-base px-8 py-4">
                Fund a Need
              </a>
              <a href="/for-schools" className="btn-ghost text-base px-8 py-4">
                Register Your School
              </a>
            </div>

            <p className="text-xs text-navy/60 mt-4 font-sans">
              All donations tax-deductible. Fiscal Sponsor: {CPF_INFO.name} ({CPF_INFO.classification} EIN {CPF_INFO.ein}).
              Contributions are subject to AlumniUp's fee structure: 88% to school, 7% platform fee, 5% fiscal sponsorship fee.
            </p>
          </div>

          {/* Right column: featured need (desktop only) */}
          <div className="hidden md:block">
            {featured ? (
              <FeaturedNeedCard need={featured} />
            ) : (
              <HeroAsideFallback />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-serif text-3xl md:text-4xl font-bold text-navy">{value}</p>
      <p className="font-sans text-sm text-navy/60 mt-1">{label}</p>
    </div>
  );
}

// Restrained editorial card highlighting one featured need.
function FeaturedNeedCard({ need }: { need: Need }) {
  const percentFunded = Math.min(Math.round((need.raised_amount / need.goal_amount) * 100), 100);

  return (
    <div className="bg-white border border-gold/40 rounded-lg p-6 lg:p-8 shadow-sm">
      <p className="font-sans text-xs font-medium uppercase tracking-wider text-gold">
        Featured Need
      </p>
      <h3 className="font-serif text-2xl lg:text-3xl font-semibold text-navy mt-2">
        {need.title}
      </h3>
      <p className="font-sans text-sm text-navy/60 mt-1">
        {need.school?.name}
      </p>

      <div className="mt-6">
        <div className="flex justify-between text-sm font-sans mb-1">
          <span className="font-semibold text-navy">{formatCurrency(need.raised_amount)}</span>
          <span className="text-navy/60">of {formatCurrency(need.goal_amount)}</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${percentFunded}%` }} />
        </div>
        <p className="text-xs font-sans text-navy/50 mt-2">
          {percentFunded}% funded · {need.backer_count} donor{need.backer_count !== 1 ? "s" : ""}
        </p>
      </div>

      <a href="#needs" className="btn-gold w-full text-center text-sm mt-6 inline-block">
        Fund This Need
      </a>
    </div>
  );
}

// Fallback for the hero right column when no featured need is available.
function HeroAsideFallback() {
  return (
    <div className="bg-navy text-cream rounded-lg p-8 lg:p-10">
      <p className="font-serif text-2xl lg:text-3xl font-semibold leading-snug">
        “Your alma mater needs you. Again.”
      </p>
      <p className="font-sans text-sm text-cream/70 mt-4 leading-relaxed">
        Connecting Detroit alumni with verified funding needs posted by the coaches,
        teachers, and administrators who know them best.
      </p>
    </div>
  );
}

// ─── How It Works ──────────────────────────────────────
function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Alumni & supporters browse verified school needs",
      description:
        "Coaches, teachers, and administrators post specific funding needs. Each need is reviewed and verified before going live.",
    },
    {
      number: "02",
      title: "Donors contribute directly to what matters most",
      description:
        "Choose the need you care about, contribute any amount, and your donation goes directly to the school through our fiscal sponsor.",
    },
    {
      number: "03",
      title: "Schools receive funds, donors get tax receipts",
      description:
        "Once funded, schools receive 88% of funds. Donors receive an official tax receipt from Childs Play Foundation, Inc. (EIN 86-2707543).",
    },
  ];

  return (
    <section id="how-it-works" className="py-16 md:py-24 bg-white">
      <div className="max-w-page mx-auto px-4">
        <h2 className="section-title text-center">How It Works</h2>
        <p className="font-sans text-navy/60 text-center mt-3 max-w-xl mx-auto">
          Three simple steps to make a difference in Detroit schools.
        </p>

        <div className="grid md:grid-cols-3 gap-8 mt-12">
          {steps.map((step) => (
            <div key={step.number} className="card text-center">
              <p className="font-serif text-5xl text-gold font-bold">{step.number}</p>
              <h3 className="font-serif text-xl font-semibold mt-4 mb-3">{step.title}</h3>
              <p className="font-sans text-sm text-navy/70 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Founder Story ─────────────────────────────────────
function FounderStory() {
  return (
    <section className="bg-cream py-16 md:py-24">
      <div className="max-w-page mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="section-title text-center">Why I Built AlumniUp</h2>
          <div className="mt-8 font-sans text-navy/80 leading-relaxed space-y-4">
            <p>
              I am {FOUNDER.name}, a graduate of {FOUNDER.schoolFullName}. Like so many
              Detroit alumni, {FOUNDER.schoolShortName} gave me the foundation I needed to {FOUNDER.careerSentence}.
              But when I looked back at my school, I saw coaches buying equipment out
              of their own pockets, teachers funding classroom supplies, and programs struggling to survive.
            </p>
            <p>
              AlumniUp is built for Detroit, by Detroit. Every feature, every decision, every partnership
              is designed to put resources directly into the hands of the people who need them most: our
              coaches, teachers, and administrators. With the support of Childs Play Foundation, every
              donation is tax-deductible and every dollar is accounted for.
            </p>
            <p className="font-semibold text-navy">
              {FOUNDER.closingLine}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Need Card ─────────────────────────────────────────
function NeedCard({ need }: { need: Need }) {
  const percentFunded = Math.min(Math.round((need.raised_amount / need.goal_amount) * 100), 100);
  const isFunded = need.status === "funded" || percentFunded >= 100;
  const [shareOpen, setShareOpen] = useState(false);
  const [donateOpen, setDonateOpen] = useState(false);

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-3">
        <div className="flex gap-2">
          <span className="inline-block px-2 py-1 text-xs font-sans font-medium bg-cream text-navy rounded">
            {need.category}
          </span>
          <span className={`inline-block px-2 py-1 text-xs font-sans font-medium rounded border ${
            need.urgency === "high"
              ? "bg-gold/20 text-navy border-gold/60"
              : need.urgency === "med"
              ? "bg-gold/10 text-navy border-gold/40"
              : "bg-cream text-navy/70 border-border"
          }`}>
            {URGENCY_LABELS[need.urgency]}
          </span>
        </div>
        {need.minimum_amount && (
          <span className="text-xs font-sans text-navy/50">
            Min: {formatCurrency(need.minimum_amount)} to begin
          </span>
        )}
      </div>

      <h3 className="font-serif text-xl font-semibold text-navy">{need.title}</h3>
      {need.submitted_by_name && (
        <p className="font-sans text-sm text-navy/50 mt-1">Posted by {need.submitted_by_name}</p>
      )}
      <p className="font-sans text-sm text-navy/70 mt-3 leading-relaxed line-clamp-3">
        {need.description}
      </p>

      <div className="mt-5">
        <div className="flex justify-between text-sm font-sans mb-1">
          <span className="font-semibold text-navy">{formatCurrency(need.raised_amount)}</span>
          <span className="text-navy/60">of {formatCurrency(need.goal_amount)}</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${percentFunded}%` }} />
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs font-sans text-navy/50">{percentFunded}% funded</span>
          <span className="text-xs font-sans text-navy/50">{need.backer_count} donor{need.backer_count !== 1 ? "s" : ""}</span>
        </div>
      </div>

      <div className="flex gap-3 mt-5">
        <button
          className="btn-gold flex-1 text-sm"
          onClick={() => setDonateOpen(true)}
          disabled={isFunded}
        >
          {isFunded ? "Fully Funded" : "Contribute"}
        </button>
        <button
          className="btn-ghost text-sm px-4"
          aria-label="Share"
          onClick={() => setShareOpen(true)}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" />
          </svg>
        </button>
      </div>

      <BragModal
        need={need}
        open={shareOpen}
        onClose={() => setShareOpen(false)}
      />
      <DonationModal
        need={need}
        open={donateOpen}
        onClose={() => setDonateOpen(false)}
        onShare={() => {
          setDonateOpen(false);
          setShareOpen(true);
        }}
      />
    </div>
  );
}

// ─── Needs Feed ────────────────────────────────────────
function NeedsFeed() {
  const { needs, loading } = useNeeds();
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  // Group needs by school
  const groupedNeeds: Record<string, { school: School; needs: Need[] }> = {};
  needs.forEach((need) => {
    if (selectedCategory && need.category !== selectedCategory) return;
    if (searchQuery && !need.school?.name.toLowerCase().includes(searchQuery.toLowerCase())) return;

    const schoolId = need.school_id;
    if (!groupedNeeds[schoolId]) {
      groupedNeeds[schoolId] = { school: need.school!, needs: [] };
    }
    groupedNeeds[schoolId].needs.push(need);
  });

  if (loading) {
    return (
      <section id="needs" className="py-16 md:py-24 bg-white">
        <div className="max-w-page mx-auto px-4 text-center">
          <p className="font-sans text-navy/60">Loading needs...</p>
        </div>
      </section>
    );
  }

  return (
    <section id="needs" className="py-16 md:py-24 bg-white">
      <div className="max-w-page mx-auto px-4">
        <h2 className="section-title">School Needs</h2>
        <p className="font-sans text-navy/60 mt-3">
          Browse verified funding needs from Detroit public schools.
        </p>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mt-6 mb-8">
          <input
            type="text"
            placeholder="Search by school name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border border-border rounded px-4 py-2 font-sans text-sm w-full md:w-64 focus:outline-none focus:border-navy"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-border rounded px-4 py-2 font-sans text-sm focus:outline-none focus:border-navy"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* School Groups */}
        {Object.entries(groupedNeeds).map(([schoolId, group]) => {
          const schoolTotalRaised = group.needs.reduce((sum, n) => sum + n.raised_amount, 0);
          const schoolTotalGoal = group.needs.reduce((sum, n) => sum + n.goal_amount, 0);

          return (
            <div key={schoolId} className="mb-10">
              <div className="school-header flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-xl md:text-2xl font-semibold">{group.school.name}</h3>
                  <p className="font-sans text-xs text-white/60 mt-1">
                    {group.needs.length} active need{group.needs.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-serif text-lg text-gold font-semibold">{formatCurrency(schoolTotalRaised)}</p>
                  <p className="font-sans text-xs text-white/60">raised of {formatCurrency(schoolTotalGoal)}</p>
                </div>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {group.needs.map((need) => (
                  <NeedCard key={need.id} need={need} />
                ))}
              </div>
            </div>
          );
        })}

        {Object.keys(groupedNeeds).length === 0 && (
          <p className="text-center font-sans text-navy/60 py-12">No needs found matching your filters.</p>
        )}
      </div>
    </section>
  );
}

// ─── Sidebar Components ─────────────────────────────
function TrustBlock() {
  return (
    <div className="card">
      <h3 className="font-serif text-lg font-semibold mb-3">Trust & Transparency</h3>
      <div className="font-sans text-sm text-navy/70 space-y-2">
        <p><strong>Fiscal Sponsor:</strong> {CPF_INFO.name}</p>
        <p><strong>Classification:</strong> {CPF_INFO.classification}</p>
        <p><strong>EIN:</strong> {CPF_INFO.ein}</p>
        <p><strong>Location:</strong> Detroit, MI</p>
        <a href="https://childsplayfoundation.org" target="_blank" rel="noopener noreferrer"
          className="text-gold hover:underline inline-block mt-2">
          childsplayfoundation.org →
        </a>
      </div>
    </div>
  );
}

function TopSchoolsWidget() {
  const { schools, loading } = useTopSchools();

  return (
    <div className="card">
      <h3 className="font-serif text-lg font-semibold mb-3">Top Schools</h3>
      {loading ? (
        <p className="font-sans text-sm text-navy/50">Loading…</p>
      ) : schools.length === 0 ? (
        <p className="font-sans text-sm text-navy/50">Schools will appear here as needs are funded.</p>
      ) : (
        <ul className="space-y-3">
          {schools.map((s) => (
            <li key={s.id} className="font-sans text-sm flex items-start justify-between gap-2 border-b border-border pb-2 last:border-0">
              <div className="min-w-0">
                <p className="font-medium text-navy truncate">{s.name}</p>
                <p className="text-navy/50 text-xs">
                  {s.freeForever ? "Founding partner · free forever" : "Founding partner"}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-serif font-semibold text-gold">{formatCurrency(s.totalRaised)}</p>
                <p className="text-navy/40 text-xs">raised</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function RecentDonorsWidget() {
  const entries = useWallOfHonor(3);

  return (
    <div className="card">
      <h3 className="font-serif text-lg font-semibold mb-3">Recent Donors</h3>
      {entries.length === 0 ? (
        <p className="font-sans text-sm text-navy/50">
          Be the first donor to appear on the Wall of Honor.
        </p>
      ) : (
        <ul className="space-y-3">
          {entries.map((entry) => (
            <li key={entry.id} className="font-sans text-sm border-b border-border pb-2 last:border-0">
              <span className="font-medium">{entry.display_name || "Anonymous"}</span>
              {entry.graduation_year && (
                <span className="text-navy/50"> · Class of {entry.graduation_year}</span>
              )}
              {entry.message && <p className="text-navy/60 text-xs mt-1">&ldquo;{entry.message}&rdquo;</p>}
            </li>
          ))}
        </ul>
      )}
      <a href="/wall-of-honor" className="inline-block text-xs font-sans text-gold hover:underline mt-3">
        View Wall of Honor →
      </a>
    </div>
  );
}

// ─── Footer ────────────────────────────────────────────
function Footer() {
  return (
    <footer className="bg-navy text-white py-12">
      <div className="max-w-page mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <p className="font-serif text-xl font-bold">AlumniUp</p>
            <p className="font-sans text-xs text-white/50 mt-2">
              Connecting Detroit alumni with school needs.
            </p>
          </div>
          <div>
            <h4 className="font-sans text-sm font-semibold mb-3">Quick Links</h4>
            <ul className="font-sans text-xs text-white/60 space-y-2">
              <li><a href="#how-it-works" className="hover:text-gold">How It Works</a></li>
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
            Powered by{" "}
            <a href="https://lexsapphirestudio.com" target="_blank" rel="noopener noreferrer" className="hover:text-gold">
              Lexis Sapphire Studio
            </a>{" "}
            | © {new Date().getFullYear()} AlumniUp. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

// ─── Page ──────────────────────────────────────────────
export default function HomePage() {
  return (
    <>
      <TrustBar />
      <PreviewBanner />
      <Header />
      <Hero />
      <HowItWorks />
      <FounderStory />
      <div className="max-w-page mx-auto px-4 py-16 md:py-24 flex flex-col md:flex-row gap-8">
        <div className="flex-1">
          <NeedsFeed />
        </div>
        <aside className="w-full md:w-80 space-y-6">
          <TrustBlock />
          <TopSchoolsWidget />
          <RecentDonorsWidget />
        </aside>
      </div>
      <Footer />
    </>
  );
}