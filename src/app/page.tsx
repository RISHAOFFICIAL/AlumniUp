"use client";

import { useNeeds, useDonationStats, useWallOfHonor, useTopSchools } from "@/hooks";
import type { Need, School } from "@/types";
import { CATEGORIES, CONTACT, CPF_INFO, URGENCY_LABELS } from "@/types";
import { FOUNDER } from "@/lib/content/founder";
import BragModal from "@/components/BragModal";
import DonationModal from "@/components/DonationModal";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { useState } from "react";

// Utility
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// ─── Hero ──────────────────────────────────────────────
function Hero() {
  const stats = useDonationStats();
  const { needs } = useNeeds();
  const featured = needs[0];

  return (
    <section className="relative bg-navy text-cream overflow-hidden">
      {/* Desktop: full-bleed photo covering the right side */}
      <div className="hidden md:block absolute inset-y-0 right-0 w-[46%]">
        <img
          src="/images/hero-students.webp"
          alt="Detroit public school students"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="relative max-w-page mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Left column: headline, copy, calls-to-action, stats */}
          <div className="py-14 md:py-20">
            <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-gold">
              Detroit Public Schools · Alumni Giving
            </p>
            <h1 className="font-serif text-5xl lg:text-6xl font-semibold text-white leading-[1.05] mt-4 text-balance">
              Your alma mater needs you. <span className="italic text-gold">Again.</span>
            </h1>
            <p className="font-sans text-lg text-cream/75 mt-6 leading-relaxed max-w-xl">
              AlumniUp connects Detroit public school alumni with verified funding needs posted by the coaches,
              teachers, and administrators shaping the next generation, right in the halls you walked.
            </p>

            <div className="flex flex-wrap gap-4 mt-8">
              <a href="#needs" className="btn-gold text-base px-8 py-4">
                Fund a Need
              </a>
              <a href="/for-schools" className="text-base px-8 py-4 rounded-lg border border-cream/50 text-cream font-sans font-medium transition-colors hover:bg-white/10">
                Register Your School
              </a>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-12 border-t border-white/15 pt-7">
              <StatCard label="Raised So Far" value={formatCurrency(stats.totalRaised)} />
              <StatCard label="Alumni Donors" value={String(stats.donorCount)} />
              <StatCard label="Schools Live" value={String(stats.schoolCount)} />
              <StatCard label="Goes to Schools" value="88%" />
            </div>

            <p className="text-xs text-cream/45 mt-6 font-sans">
              All donations tax-deductible through {CPF_INFO.name} ({CPF_INFO.classification} EIN {CPF_INFO.ein}).
            </p>
          </div>

          {/* Right column (desktop): featured card straddling the photo's lower edge */}
          <div className="relative hidden md:block">
            <div className="absolute bottom-10 -left-8 right-2">
              {featured ? (
                <FeaturedNeedCard need={featured} />
              ) : (
                <HeroAsideFallback />
              )}
            </div>
          </div>
        </div>

        {/* Mobile: photo and featured card stacked under the copy */}
        <div className="md:hidden pb-12">
          <img
            src="/images/hero-students.webp"
            alt="Detroit public school students"
            className="w-full h-56 object-cover rounded-2xl"
          />
          <div className="mt-4">
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
      <p className="font-serif text-3xl md:text-4xl font-bold text-white">{value}</p>
      <p className="font-sans text-[11px] uppercase tracking-wider text-cream/50 mt-1">{label}</p>
    </div>
  );
}

function FeaturedNeedCard({ need }: { need: Need }) {
  const percentFunded = Math.min(Math.round((need.raised_amount / need.goal_amount) * 100), 100);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-xl text-navy">
      <div className="flex items-center justify-between gap-3">
        <span className="inline-block px-2.5 py-1 text-[11px] font-sans font-semibold uppercase tracking-wider bg-gold/15 text-[#7A5C14] rounded-full">
          Featured Need
        </span>
        <span className="font-sans text-[11px] font-semibold uppercase tracking-wider text-green">
          ✓ Verified by AlumniUp
        </span>
      </div>
      <h3 className="font-serif text-2xl font-semibold text-navy mt-3">
        {need.title}
      </h3>
      <p className="font-sans text-sm text-navy/60 mt-1">
        {need.school?.name} · {need.category}
      </p>

      <div className="mt-5">
        <div className="flex justify-between items-baseline text-sm font-sans mb-1.5">
          <span className="font-serif text-xl font-bold text-navy">{formatCurrency(need.raised_amount)} <span className="font-sans text-xs font-normal text-navy/50">raised</span></span>
          <span className="text-navy/60 text-xs">of {formatCurrency(need.goal_amount)} · {need.backer_count} donor{need.backer_count !== 1 ? "s" : ""}</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${percentFunded}%` }} />
        </div>
      </div>

      <a href="#needs" className="btn-gold w-full text-center text-sm mt-5 inline-block">
        Fund This Need
      </a>
    </div>
  );
}

function HeroAsideFallback() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-xl text-navy">
      <p className="font-serif text-2xl font-semibold leading-snug">
        “Your alma mater needs you. Again.”
      </p>
      <p className="font-sans text-sm text-navy/60 mt-3 leading-relaxed">
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
const NEED_PHOTOS: Record<string, string> = {
  baseball: "/images/need-baseball.jpg",
  stage: "/images/need-stage.jpg",
  debate: "/images/need-debate.jpg",
  students: "/images/hero-students.webp",
};

function photoForNeed(need: Need): string {
  const hay = `${need.title} ${need.category}`.toLowerCase();
  if (hay.includes("baseball") || hay.includes("field")) return NEED_PHOTOS.baseball;
  if (hay.includes("stage") || hay.includes("lighting") || hay.includes("arts")) return NEED_PHOTOS.stage;
  if (hay.includes("debate")) return NEED_PHOTOS.debate;
  return NEED_PHOTOS.students;
}

function NeedCard({ need }: { need: Need }) {
  const percentFunded = Math.min(Math.round((need.raised_amount / need.goal_amount) * 100), 100);
  const isFunded = need.status === "funded" || percentFunded >= 100;
  const [shareOpen, setShareOpen] = useState(false);
  const [donateOpen, setDonateOpen] = useState(false);

  return (
    <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow flex flex-col">
      <div className="relative h-44 shrink-0">
        <img src={photoForNeed(need)} alt="" className="w-full h-full object-cover" />
        <span className="absolute top-3 left-3 bg-white/95 text-navy text-[11px] font-sans font-semibold px-2.5 py-1 rounded-full shadow-sm">
          ✓ Verified
        </span>
        <span className="absolute bottom-3 left-3 bg-navy/85 text-white text-[11px] font-sans font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide">
          {need.category}
        </span>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-serif text-xl font-semibold text-navy leading-snug">{need.title}</h3>
        <p className="font-sans text-xs text-navy/50 mt-1.5">
          {need.school?.name}
          {need.submitted_by_name ? ` · Posted by ${need.submitted_by_name}` : ""}
        </p>
        <p className="font-sans text-sm text-navy/70 mt-3 leading-relaxed line-clamp-3">
          {need.description}
        </p>

        <div className="mt-auto pt-5">
          <div className="flex justify-between items-baseline font-sans mb-1.5">
            <span className="font-serif text-2xl font-bold text-navy">{formatCurrency(need.raised_amount)}</span>
            <span className="text-xs text-navy/60">of {formatCurrency(need.goal_amount)} goal</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${percentFunded}%` }} />
          </div>
          {need.minimum_amount && !isFunded && (
            <p className="text-xs font-sans text-[#7A5C14] mt-2">
              Can begin at {formatCurrency(need.minimum_amount)} funded
            </p>
          )}

          <div className="flex items-center gap-3 mt-4">
            <div className="flex items-center shrink-0">
              <span className="w-6 h-6 rounded-full bg-navy border-2 border-white inline-block" />
              <span className="w-6 h-6 rounded-full bg-gold border-2 border-white inline-block -ml-2" />
              <span className="w-6 h-6 rounded-full bg-green border-2 border-white inline-block -ml-2" />
            </div>
            <span className="text-xs font-sans text-navy/50 whitespace-nowrap">
              {need.backer_count} donor{need.backer_count !== 1 ? "s" : ""}
            </span>
            <button
              className="btn-gold flex-1 text-sm py-2.5"
              onClick={() => setDonateOpen(true)}
              disabled={isFunded}
            >
              {isFunded ? "Fully Funded" : "Contribute"}
            </button>
            <button
              className="btn-ghost text-sm px-3 py-2.5"
              aria-label="Share"
              onClick={() => setShareOpen(true)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" />
              </svg>
            </button>
          </div>
        </div>
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

  const filteredNeeds = needs.filter((need) => {
    if (selectedCategory && need.category !== selectedCategory) return false;
    if (searchQuery && !need.school?.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
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
        <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-gold">Open Needs</p>
        <div className="flex flex-wrap items-end justify-between gap-4 mt-3">
          <div>
            <h2 className="section-title">Fund a need. Change a season.</h2>
            <p className="font-sans text-navy/60 mt-3 max-w-2xl leading-relaxed">
              Every need is posted by verified school staff and reviewed before it goes live.
              When a need funds, the money moves through our fiscal sponsor directly to the school.
            </p>
          </div>
          <a href="#needs" className="btn-ghost text-sm hidden md:inline-block">Browse all needs</a>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mt-8 mb-8">
          <input
            type="text"
            placeholder="Search by school name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border border-border rounded-lg px-4 py-2 font-sans text-sm w-full md:w-64 focus:outline-none focus:border-navy"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-border rounded-lg px-4 py-2 font-sans text-sm focus:outline-none focus:border-navy"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNeeds.map((need) => (
            <NeedCard key={need.id} need={need} />
          ))}
        </div>

        {filteredNeeds.length === 0 && (
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

// ─── Page ──────────────────────────────────────────────
export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <Hero />
      <NeedsFeed />
      <HowItWorks />
      <FounderStory />
      <section className="bg-cream py-14">
        <div className="max-w-page mx-auto px-4 grid md:grid-cols-3 gap-6">
          <TrustBlock />
          <TopSchoolsWidget />
          <RecentDonorsWidget />
        </div>
      </section>
      <SiteFooter />
    </>
  );
}
