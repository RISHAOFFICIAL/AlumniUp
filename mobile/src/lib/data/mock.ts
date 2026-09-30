// Typed mock data layer for AlumniUp.
//
// This mirrors `supabase/schema.sql` exactly and contains the same seed rows
// (4 founding schools + King High's 3 needs) so the public homepage can be
// built and previewed before real Supabase credentials exist.
//
// Swap mock -> Supabase with a single env toggle:
//   NEXT_PUBLIC_DATA_SOURCE=mock      (default)
//   NEXT_PUBLIC_DATA_SOURCE=supabase
//
// The hooks in src/hooks/index.ts read this value and choose the backing
// source, so components never touch Supabase (or mock) directly.

import type {
  School,
  Need,
  WallOfHonorEntry,
  ClassYearRank,
  Sponsor,
  DonationRow,
  DisbursementRow,
} from "@/types";

// Fixed UUIDs (stable keys for joins; production uses uuid_generate_v4()).
const KING_ID = "11111111-1111-4111-8111-111111111111";
const HENRY_FORD_ID = "22222222-2222-4222-8222-222222222222";
const CASS_TECH_ID = "33333333-3333-4333-8333-333333333333";
const RENAISSANCE_ID = "44444444-4444-4444-8444-444444444444";

const NEED_BASEBALL_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const NEED_LIGHTING_ID = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const NEED_DEBATE_ID = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";

// ─────────────────────────────────────────────────────────────
// Schools (seed rows)
// ─────────────────────────────────────────────────────────────
export const MOCK_SCHOOLS: School[] = [
  {
    id: KING_ID,
    name: "Martin Luther King Jr. Senior High School",
    city: "Detroit",
    state: "MI",
    district: "Detroit Public Schools",
    contact_name: null,
    contact_email: null,
    contact_phone: null,
    contact_title: null,
    status: "active",
    tier: "founding",
    is_founding_partner: true,
    free_forever: true,
    subscription_status: "exempt",
    subscription_expires_at: null,
    annual_fee: 0,
    logo_url: null,
    created_at: "2025-01-01T00:00:00.000Z",
    updated_at: "2025-01-01T00:00:00.000Z",
  },
  {
    id: HENRY_FORD_ID,
    name: "Detroit Henry Ford High School",
    city: "Detroit",
    state: "MI",
    district: "Detroit Public Schools",
    contact_name: null,
    contact_email: null,
    contact_phone: null,
    contact_title: null,
    status: "active",
    tier: "founding",
    is_founding_partner: true,
    free_forever: false,
    subscription_status: "active",
    subscription_expires_at: "2026-06-01T00:00:00.000Z",
    annual_fee: 99,
    logo_url: null,
    created_at: "2025-01-01T00:00:00.000Z",
    updated_at: "2025-01-01T00:00:00.000Z",
  },
  {
    id: CASS_TECH_ID,
    name: "Cass Technical High School",
    city: "Detroit",
    state: "MI",
    district: "Detroit Public Schools",
    contact_name: null,
    contact_email: null,
    contact_phone: null,
    contact_title: null,
    status: "active",
    tier: "founding",
    is_founding_partner: true,
    free_forever: false,
    subscription_status: "active",
    subscription_expires_at: "2026-06-01T00:00:00.000Z",
    annual_fee: 99,
    logo_url: null,
    created_at: "2025-01-01T00:00:00.000Z",
    updated_at: "2025-01-01T00:00:00.000Z",
  },
  {
    id: RENAISSANCE_ID,
    name: "Renaissance High School",
    city: "Detroit",
    state: "MI",
    district: "Detroit Public Schools",
    contact_name: null,
    contact_email: null,
    contact_phone: null,
    contact_title: null,
    status: "active",
    tier: "founding",
    is_founding_partner: true,
    free_forever: false,
    subscription_status: "active",
    subscription_expires_at: "2026-06-01T00:00:00.000Z",
    annual_fee: 99,
    logo_url: null,
    created_at: "2025-01-01T00:00:00.000Z",
    updated_at: "2025-01-01T00:00:00.000Z",
  },
];

// ─────────────────────────────────────────────────────────────
// Needs (King High seed rows)
// ─────────────────────────────────────────────────────────────
const kingSchool = MOCK_SCHOOLS[0];

export const MOCK_NEEDS: Need[] = [
  {
    id: NEED_BASEBALL_ID,
    school_id: KING_ID,
    title: "Varsity Baseball Field Flood Repair",
    description:
      "The varsity baseball field at King High suffers from severe drainage issues, causing flooding after every rain. Games are frequently cancelled and the field is becoming unsafe for play. We need to install proper drainage systems and regrade the field to keep our student-athletes safe and competitive.",
    category: "Sports",
    urgency: "high",
    goal_amount: 18000,
    minimum_amount: 8500,
    raised_amount: 3200,
    backer_count: 12,
    submitted_by_name: "Sample Coach",
    submitted_by_email: null,
    submitted_by_title: "Varsity Baseball Coach",
    submitted_by_phone: null,
    photo_url: null,
    status: "active",
    approved_at: "2025-01-15T00:00:00.000Z",
    approved_by: null,
    created_at: "2025-01-10T00:00:00.000Z",
    updated_at: "2025-01-15T00:00:00.000Z",
    school: kingSchool,
  },
  {
    id: NEED_LIGHTING_ID,
    school_id: KING_ID,
    title: "Performing Arts Stage Lighting Upgrade",
    description:
      "Our auditorium lighting system was installed in 1998 and is now failing. Several lights have stopped working, and we cannot find replacement parts. This upgrade will give our students a professional-grade performance experience for plays, concerts, and assemblies.",
    category: "Arts",
    urgency: "high",
    goal_amount: 5500,
    minimum_amount: null,
    raised_amount: 1800,
    backer_count: 8,
    submitted_by_name: "Sample Teacher",
    submitted_by_email: null,
    submitted_by_title: "Performing Arts Director",
    submitted_by_phone: null,
    photo_url: null,
    status: "active",
    approved_at: "2025-01-16T00:00:00.000Z",
    approved_by: null,
    created_at: "2025-01-12T00:00:00.000Z",
    updated_at: "2025-01-16T00:00:00.000Z",
    school: kingSchool,
  },
  {
    id: NEED_DEBATE_ID,
    school_id: KING_ID,
    title: "Debate Team Coach Stipend",
    description:
      "Our nationally-ranked debate team has been without a dedicated coach for the current season. We need to fund a stipend for a qualified debate coach who can prepare our students for competitions. King High has a proud tradition of debate excellence, but we are at risk of losing our program without dedicated coaching support.",
    category: "Program Support",
    urgency: "med",
    goal_amount: 4000,
    minimum_amount: null,
    raised_amount: 950,
    backer_count: 5,
    submitted_by_name: "Sample Principal",
    submitted_by_email: null,
    submitted_by_title: "Principal",
    submitted_by_phone: null,
    photo_url: null,
    status: "active",
    approved_at: "2025-01-18T00:00:00.000Z",
    approved_by: null,
    created_at: "2025-01-14T00:00:00.000Z",
    updated_at: "2025-01-18T00:00:00.000Z",
    school: kingSchool,
  },
];

// ─────────────────────────────────────────────────────────────
// Wall of Honor (illustrative placeholder — no real donations yet)
// ─────────────────────────────────────────────────────────────
export const MOCK_WALL_OF_HONOR: WallOfHonorEntry[] = [
  {
    id: "dddddddd-dddd-4ddd-8ddd-ddddddddddd1",
    donation_id: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeee1",
    display_name: null,
    graduation_year: null,
    message: null,
    amount_display: 1000,
    created_at: "2025-03-02T10:00:00.000Z",
  },
  {
    id: "dddddddd-dddd-4ddd-8ddd-ddddddddddd2",
    donation_id: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeee2",
    display_name: "Marcus Reed '94",
    graduation_year: "1994",
    message: "Every contribution counts.",
    amount_display: 500,
    created_at: "2025-02-28T14:15:00.000Z",
  },
  {
    id: "dddddddd-dddd-4ddd-8ddd-ddddddddddd3",
    donation_id: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeee3",
    display_name: "James Carter '92",
    graduation_year: "1992",
    message: "Go Crusaders!",
    amount_display: 250,
    created_at: "2025-02-24T09:30:00.000Z",
  },
  {
    id: "dddddddd-dddd-4ddd-8ddd-ddddddddddd4",
    donation_id: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeee4",
    display_name: "Alicia Bennett '08",
    graduation_year: "2008",
    message: "Proud to support Detroit students.",
    amount_display: 100,
    created_at: "2025-02-20T16:45:00.000Z",
  },
  {
    id: "dddddddd-dddd-4ddd-8ddd-ddddddddddd5",
    donation_id: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeee5",
    display_name: null,
    graduation_year: null,
    message: null,
    amount_display: 75,
    created_at: "2025-02-15T12:00:00.000Z",
  },
  {
    id: "dddddddd-dddd-4ddd-8ddd-ddddddddddd6",
    donation_id: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeee6",
    display_name: "Dana Washington '11",
    graduation_year: "2011",
    message: "For the debate team!",
    amount_display: 150,
    created_at: "2025-02-10T18:20:00.000Z",
  },
  {
    id: "dddddddd-dddd-4ddd-8ddd-ddddddddddd7",
    donation_id: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeee7",
    display_name: "Robert Hayes '87",
    graduation_year: "1987",
    message: null,
    amount_display: 200,
    created_at: "2025-02-06T11:10:00.000Z",
  },
  {
    id: "dddddddd-dddd-4ddd-8ddd-ddddddddddd8",
    donation_id: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeee8",
    display_name: "Tanya Brooks '19",
    graduation_year: "2019",
    message: "Keep the arts alive.",
    amount_display: 120,
    created_at: "2025-02-02T08:05:00.000Z",
  },
];

export const MOCK_SPONSORS: Sponsor[] = [];

// ─────────────────────────────────────────────────────────────
// Query helpers (mirror the Supabase calls the hooks make)
// ─────────────────────────────────────────────────────────────
const URGENCY_ORDER: Record<string, number> = { high: 0, med: 1, low: 2 };

export function mockGetNeeds(options?: {
  category?: string;
  schoolId?: string;
  status?: string;
}): Need[] {
  const statuses = options?.status
    ? [options.status]
    : ["active", "funded"];

  return MOCK_NEEDS.filter((need) => {
    if (options?.category && need.category !== options.category) return false;
    if (options?.schoolId && need.school_id !== options.schoolId) return false;
    if (!statuses.includes(need.status)) return false;
    return true;
  }).sort(
    (a, b) =>
      (URGENCY_ORDER[a.urgency] ?? 9) - (URGENCY_ORDER[b.urgency] ?? 9)
  );
}

export function mockGetSchool(schoolId: string): School | null {
  return MOCK_SCHOOLS.find((s) => s.id === schoolId) ?? null;
}

export function mockGetSchools(): School[] {
  return MOCK_SCHOOLS.filter((s) => s.status === "active");
}

// ─────────────────────────────────────────────────────────────
// Pending needs (admin approval queue, mock)
// ─────────────────────────────────────────────────────────────
export const MOCK_PENDING_NEEDS: Need[] = [
  {
    id: "ffffffff-ffff-4fff-8fff-fffffffffff1",
    school_id: HENRY_FORD_ID,
    title: "Girls Basketball Team Jerseys",
    description:
      "Our girls basketball team needs new jerseys for the upcoming season. The current jerseys are worn and mismatched, and the team wants to look unified and professional on the court.",
    category: "Sports",
    urgency: "med",
    goal_amount: 2400,
    minimum_amount: null,
    raised_amount: 0,
    backer_count: 0,
    submitted_by_name: "Coach Johnson",
    submitted_by_email: "coach.johnson@henryford.org",
    submitted_by_title: "Girls Basketball Coach",
    submitted_by_phone: null,
    photo_url: null,
    status: "pending",
    approved_at: null,
    approved_by: null,
    created_at: "2025-02-10T00:00:00.000Z",
    updated_at: "2025-02-10T00:00:00.000Z",
    school: MOCK_SCHOOLS[1],
  },
  {
    id: "ffffffff-ffff-4fff-8fff-fffffffffff2",
    school_id: CASS_TECH_ID,
    title: "Physics Lab Equipment",
    description:
      "Our physics students need new lab equipment to conduct hands-on experiments. The current equipment is outdated and limiting what students can learn in science class.",
    category: "Academics",
    urgency: "high",
    goal_amount: 6000,
    minimum_amount: 2000,
    raised_amount: 0,
    backer_count: 0,
    submitted_by_name: "Ms. Carter",
    submitted_by_email: "carter@casstech.org",
    submitted_by_title: "Science Teacher",
    submitted_by_phone: null,
    photo_url: null,
    status: "pending",
    approved_at: null,
    approved_by: null,
    created_at: "2025-02-12T00:00:00.000Z",
    updated_at: "2025-02-12T00:00:00.000Z",
    school: MOCK_SCHOOLS[2],
  },
];

export function mockGetPendingNeeds(): Need[] {
  return [...MOCK_PENDING_NEEDS].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export function mockGetPlatformStats() {
  const activeNeeds = MOCK_NEEDS.filter((n) =>
    ["active", "funded"].includes(n.status)
  );
  const totalRaised = activeNeeds.reduce((sum, n) => sum + n.raised_amount, 0);
  const needsFunded = MOCK_NEEDS.filter((n) => n.status === "funded").length;
  const donorCount = MOCK_NEEDS.reduce((sum, n) => sum + n.backer_count, 0);

  return {
    total_raised: totalRaised,
    needs_funded: needsFunded,
    alumni_donors: donorCount,
    school_count: MOCK_SCHOOLS.filter((s) => s.status === "active").length,
  };
}

export function mockGetWallOfHonor(limit?: number): WallOfHonorEntry[] {
  const sorted = [...MOCK_WALL_OF_HONOR].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  return limit ? sorted.slice(0, limit) : sorted;
}

// ─────────────────────────────────────────────────────────────
// Class Year Leaderboard (illustrative — no real donations yet)
// ─────────────────────────────────────────────────────────────
export function mockGetClassYearLeaderboard(): ClassYearRank[] {
  return [
    { graduation_year: "1994", total_raised: 2400, donor_count: 6 },
    { graduation_year: "2008", total_raised: 1850, donor_count: 5 },
    { graduation_year: "2011", total_raised: 1200, donor_count: 4 },
    { graduation_year: "1987", total_raised: 900, donor_count: 3 },
    { graduation_year: "2019", total_raised: 450, donor_count: 2 },
  ].sort((a, b) => b.total_raised - a.total_raised);
}

export function mockGetSponsors(): Sponsor[] {
  return MOCK_SPONSORS;
}

export function mockGetTopSchools() {
  const raisedBySchool = new Map<string, number>();
  MOCK_NEEDS.forEach((n) => {
    raisedBySchool.set(
      n.school_id,
      (raisedBySchool.get(n.school_id) ?? 0) + n.raised_amount
    );
  });

  return MOCK_SCHOOLS.map((s) => ({
    id: s.id,
    name: s.name,
    city: s.city,
    totalRaised: raisedBySchool.get(s.id) ?? 0,
    freeForever: s.free_forever,
  })).sort((a, b) => b.totalRaised - a.totalRaised);
}

// ─────────────────────────────────────────────────────────────
// All schools (admin view) — includes one pending applicant.
// Kept separate from MOCK_SCHOOLS so public views (which filter
// status === "active") remain unchanged.
// ─────────────────────────────────────────────────────────────
const MOCK_PENDING_SCHOOL: School = {
  id: "55555555-5555-4555-8555-555555555555",
  name: "Detroit Southeastern High School",
  city: "Detroit",
  state: "MI",
  district: "Detroit Public Schools",
  contact_name: "Pat Williams",
  contact_email: null,
  contact_phone: null,
  contact_title: "Athletic Director",
  status: "pending",
  tier: "standard",
  is_founding_partner: false,
  free_forever: false,
  subscription_status: null,
  subscription_expires_at: null,
  annual_fee: 129,
  logo_url: null,
  created_at: "2025-02-20T00:00:00.000Z",
  updated_at: "2025-02-20T00:00:00.000Z",
};

export function mockGetAllSchools(): School[] {
  return [...MOCK_SCHOOLS, MOCK_PENDING_SCHOOL];
}

// ─────────────────────────────────────────────────────────────
// Donations (admin view, mock)
// ─────────────────────────────────────────────────────────────
// Illustrative rows for the admin donations tab. donor_email is intentionally
// null — the admin UI never surfaces raw donor emails (only display name or
// "Anonymous").
export const MOCK_DONATIONS: DonationRow[] = [
  {
    id: "10101010-1010-4010-8010-101010101001",
    need_id: NEED_BASEBALL_ID,
    need_title: "Varsity Baseball Field Flood Repair",
    user_id: null,
    amount: 250,
    is_anonymous: true,
    display_name: null,
    message: null,
    donor_email: null,
    stripe_payment_intent_id: null,
    stripe_subscription_id: null,
    is_recurring: false,
    status: "completed",
    tax_receipt_sent: true,
    created_at: "2025-03-05T14:20:00.000Z",
  },
  {
    id: "10101010-1010-4010-8010-101010101002",
    need_id: NEED_BASEBALL_ID,
    need_title: "Varsity Baseball Field Flood Repair",
    user_id: null,
    amount: 1000,
    is_anonymous: false,
    display_name: "James Carter '92",
    message: "Go Crusaders!",
    donor_email: null,
    stripe_payment_intent_id: null,
    stripe_subscription_id: null,
    is_recurring: false,
    status: "completed",
    tax_receipt_sent: true,
    created_at: "2025-03-07T09:05:00.000Z",
  },
  {
    id: "10101010-1010-4010-8010-101010101003",
    need_id: NEED_LIGHTING_ID,
    need_title: "Performing Arts Stage Lighting Upgrade",
    user_id: null,
    amount: 500,
    is_anonymous: false,
    display_name: "Detroit Arts Alumni Group",
    message: null,
    donor_email: null,
    stripe_payment_intent_id: null,
    stripe_subscription_id: null,
    is_recurring: false,
    status: "completed",
    tax_receipt_sent: false,
    created_at: "2025-03-10T18:30:00.000Z",
  },
  {
    id: "10101010-1010-4010-8010-101010101004",
    need_id: NEED_DEBATE_ID,
    need_title: "Debate Team Coach Stipend",
    user_id: null,
    amount: 100,
    is_anonymous: true,
    display_name: null,
    message: null,
    donor_email: null,
    stripe_payment_intent_id: null,
    stripe_subscription_id: null,
    is_recurring: true,
    status: "pending",
    tax_receipt_sent: false,
    created_at: "2025-03-12T11:00:00.000Z",
  },
];

export function mockGetDonations(): DonationRow[] {
  return [...MOCK_DONATIONS].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

// ─────────────────────────────────────────────────────────────
// Disbursements (admin / CPF read-only view, mock)
// ─────────────────────────────────────────────────────────────
export const MOCK_DISBURSEMENTS: DisbursementRow[] = [
  {
    id: "20202020-2020-4020-8020-202020202001",
    school_id: KING_ID,
    school_name: "Martin Luther King Jr. Senior High School",
    need_id: NEED_BASEBALL_ID,
    need_title: "Varsity Baseball Field Flood Repair",
    gross_amount: 3200,
    school_amount: 2816,
    alumniup_fee: 224,
    cpf_fee: 160,
    stripe_fee: 122.1,
    status: "processed",
    requested_at: "2025-03-06T00:00:00.000Z",
    processed_at: "2025-03-08T00:00:00.000Z",
    notes: "Monthly disbursement to CPF for school payout.",
  },
  {
    id: "20202020-2020-4020-8020-202020202002",
    school_id: KING_ID,
    school_name: "Martin Luther King Jr. Senior High School",
    need_id: NEED_LIGHTING_ID,
    need_title: "Performing Arts Stage Lighting Upgrade",
    gross_amount: 1800,
    school_amount: 1584,
    alumniup_fee: 126,
    cpf_fee: 90,
    stripe_fee: 78.1,
    status: "pending",
    requested_at: "2025-03-11T00:00:00.000Z",
    processed_at: null,
    notes: null,
  },
];

export function mockGetDisbursements(): DisbursementRow[] {
  return [...MOCK_DISBURSEMENTS].sort(
    (a, b) =>
      new Date(b.requested_at).getTime() - new Date(a.requested_at).getTime()
  );
}

// ─────────────────────────────────────────────────────────────
// Sponsors (admin view, mock)
// ─────────────────────────────────────────────────────────────
// Illustrative rows for the admin sponsors tab. Kept separate from the public
// MOCK_SPONSORS (which stays empty until real sponsors exist).
export const MOCK_ADMIN_SPONSORS: Sponsor[] = [
  {
    id: "30303030-3030-4030-8030-303030303001",
    organization_name: "Sample Gold Sponsor",
    contact_name: "Alex Rivera",
    contact_email: null,
    contact_phone: null,
    tier: "gold",
    amount_committed: 5000,
    contribution_type: "sponsorship_contract",
    stripe_payment_id: null,
    status: "active",
    created_at: "2025-02-01T00:00:00.000Z",
    updated_at: "2025-02-01T00:00:00.000Z",
  },
  {
    id: "30303030-3030-4030-8030-303030303002",
    organization_name: "Sample Silver Sponsor",
    contact_name: "Jordan Lee",
    contact_email: null,
    contact_phone: null,
    tier: "silver",
    amount_committed: 1500,
    contribution_type: "donation",
    stripe_payment_id: null,
    status: "active",
    created_at: "2025-02-10T00:00:00.000Z",
    updated_at: "2025-02-10T00:00:00.000Z",
  },
  {
    id: "30303030-3030-4030-8030-303030303003",
    organization_name: "Sample Bronze Sponsor",
    contact_name: null,
    contact_email: null,
    contact_phone: null,
    tier: "bronze",
    amount_committed: 300,
    contribution_type: "donation",
    stripe_payment_id: null,
    status: "pending",
    created_at: "2025-03-01T00:00:00.000Z",
    updated_at: "2025-03-01T00:00:00.000Z",
  },
];

export function mockGetAdminSponsors(): Sponsor[] {
  const tierOrder: Record<string, number> = { gold: 0, silver: 1, bronze: 2 };
  return [...MOCK_ADMIN_SPONSORS].sort(
    (a, b) =>
      (tierOrder[a.tier ?? ""] ?? 9) - (tierOrder[b.tier ?? ""] ?? 9)
  );
}

// ─────────────────────────────────────────────────────────────
// School portal (school_staff / school_admin view, mock)
// ─────────────────────────────────────────────────────────────
// In mock mode there is no auth, so the portal previews a single school
// (King High, the founding partner).
export const MOCK_PORTAL_SCHOOL_ID = KING_ID;

export function mockGetAllNeedsForSchool(schoolId: string): Need[] {
  const active = MOCK_NEEDS.filter((n) => n.school_id === schoolId);
  const pending = MOCK_PENDING_NEEDS.filter((n) => n.school_id === schoolId);
  return [...pending, ...active].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export function mockGetSchoolDonations(schoolId: string): DonationRow[] {
  const schoolNeedIds = new Set(
    MOCK_NEEDS.filter((n) => n.school_id === schoolId).map((n) => n.id)
  );
  return MOCK_DONATIONS
    .filter((d) => schoolNeedIds.has(d.need_id))
    .sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
}
