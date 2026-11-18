// AlumniUp Type Definitions

export interface School {
  id: string;
  name: string;
  city: string;
  state: string;
  district: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  contact_title: string | null;
  status: 'pending' | 'active' | 'suspended';
  tier: 'founding' | 'standard';
  is_founding_partner: boolean;
  free_forever: boolean;
  subscription_status: 'active' | 'expired' | 'exempt' | null;
  subscription_expires_at: string | null;
  annual_fee: number;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Need {
  id: string;
  school_id: string;
  title: string;
  description: string;
  category: NeedCategory;
  urgency: 'high' | 'med' | 'low';
  goal_amount: number;
  minimum_amount: number | null;
  raised_amount: number;
  backer_count: number;
  submitted_by_name: string | null;
  submitted_by_email: string | null;
  submitted_by_title: string | null;
  submitted_by_phone: string | null;
  photo_url: string | null;
  status: 'pending' | 'active' | 'funded' | 'closed' | 'rejected';
  approved_at: string | null;
  approved_by: string | null;
  created_at: string;
  updated_at: string;
  school?: School;
  // ── Public money trail (Stage 3 state machine; see src/lib/trail.ts and
  // supabase/migrations/20261118_money_trail.sql). `status` stays the
  // workflow column the feed filters on; `trail_status` is the public money
  // state donors see. Both are kept in step by the trail transitions.
  trail_status?: TrailStatus | null;
  funded_at?: string | null;
  sent_at?: string | null;
  received_at?: string | null;
  received_by?: string | null;
  proof_due_at?: string | null;
  delayed_reason?: string | null;
  delay_updated_at?: string | null;
  cancelled_reason?: string | null;
  disbursement_structure?: DisbursementStructure | null;
  attested_media_release?: boolean;
  trail?: TrailEntry[];
}

// ─────────────────────────────────────────────────────────────
// Public money trail (Stage 3 state machine + Oct 19 proof-of-use
// addendum). The public states, in order:
//   LIVE -> FUNDED -> SENT -> RECEIVED -> AWAITING PROOF -> USE VERIFIED
// Exception states, all public with a plain-language reason:
//   DELAYED, CANCELLED, PROOF OVERDUE, UNFUNDED AT CLOSE.
// DRAFT and IN REVIEW are never public.
// ─────────────────────────────────────────────────────────────
export const TRAIL_STATUSES = [
  'draft',
  'in_review',
  'live',
  'funded',
  'sent',
  'received',
  'awaiting_proof',
  'use_verified',
  'delayed',
  'cancelled',
  'proof_overdue',
  'unfunded_at_close',
] as const;
export type TrailStatus = (typeof TRAIL_STATUSES)[number];

export const TRAIL_STATUS_LABELS: Record<TrailStatus, string> = {
  draft: 'Draft',
  in_review: 'In Review',
  live: 'Live',
  funded: 'Funded',
  sent: 'Sent to School',
  received: 'Received',
  awaiting_proof: 'Awaiting Proof of Use',
  use_verified: 'Use Verified',
  delayed: 'Delayed',
  cancelled: 'Cancelled',
  proof_overdue: 'Proof Overdue',
  unfunded_at_close: 'Unfunded at Close',
};

// Plain-language public wording for each trail state (Stage 3 rule:
// status is always a word, never color alone).
export const TRAIL_STATUS_DESCRIPTIONS: Record<TrailStatus, string> = {
  draft: 'Being written. Not public yet.',
  in_review: 'Waiting for school approval. Not public yet.',
  live: 'Accepting donations now.',
  funded: 'Goal reached. Funds are being prepared for the school.',
  sent: 'Sent to school, awaiting confirmation.',
  received: 'The school confirmed the funds arrived.',
  awaiting_proof: 'Received. The school is preparing proof of use.',
  use_verified: 'The fiscal sponsor verified the funds were spent as stated.',
  delayed: 'Delayed. The reason and the date it was marked are shown below.',
  cancelled: 'Cancelled before the funds were sent. Donors choose a refund or a redirect.',
  proof_overdue: 'Proof of use is past due. The school cannot post new needs until it is filed.',
  unfunded_at_close: 'Closed below goal. See the trail for what the school chose.',
};

export const TRAIL_EVENT_TYPES = [
  'posted',
  'approved',
  'funded',
  'disbursed',
  'received',
  'proof_submitted',
  'proof_verified',
  'proof_requested',
  'delayed',
  'delay_updated',
  'cancelled',
  'refund_issued',
  'redirected',
  'proof_overdue',
  'extended',
  'partial_disbursed',
] as const;
export type TrailEventType = (typeof TRAIL_EVENT_TYPES)[number];

export const TRAIL_EVENT_LABELS: Record<TrailEventType, string> = {
  posted: 'Need posted',
  approved: 'Approved and live',
  funded: 'Goal reached',
  disbursed: 'Funds sent to school',
  received: 'School confirmed receipt',
  proof_submitted: 'Proof of use submitted',
  proof_verified: 'Use verified by fiscal sponsor',
  proof_requested: 'More proof requested',
  delayed: 'Marked delayed',
  delay_updated: 'Delay update',
  cancelled: 'Need cancelled',
  refund_issued: 'Refund issued',
  redirected: 'Gift redirected',
  proof_overdue: 'Proof of use overdue',
  extended: 'Deadline extended',
  partial_disbursed: 'Partial amount sent',
};

export interface TrailEntry {
  id: string;
  need_id: string;
  event_type: TrailEventType;
  from_status: TrailStatus | null;
  to_status: TrailStatus | null;
  note: string | null;
  actor_role: 'donor' | 'school_staff' | 'school_admin' | 'platform_admin' | 'cpf_admin' | 'system' | null;
  created_at: string;
}

export const DISBURSEMENT_STRUCTURES = ['single', 'tranches', 'direct_vendor'] as const;
export type DisbursementStructure = (typeof DISBURSEMENT_STRUCTURES)[number];

export const DISBURSEMENT_STRUCTURE_LABELS: Record<DisbursementStructure, string> = {
  single: 'Single payment',
  tranches: 'Tranches',
  direct_vendor: 'Direct vendor payment',
};

export interface ProofPacket {
  id: string;
  need_id: string;
  final_amount_spent: number | null;
  invoices_note: string | null;
  completion_photo_url: string | null;
  attested_by: string | null;
  attested_at: string | null;
  status: 'draft' | 'submitted' | 'verified' | 'needs_more_info';
  review_notes: string | null;
  created_at: string;
  updated_at: string;
}

// A donor's choice when a need they funded is cancelled before
// disbursement: full refund, or redirect the gift to another open need
// at the same school. No response in 30 days means a refund.
export interface DonationChoice {
  id: string;
  donation_id: string;
  choice: 'refund' | 'redirect';
  redirect_need_id: string | null;
  created_at: string;
  resolved_at: string | null;
}

export const CATEGORIES = ['Sports', 'Arts', 'Academics', 'Program Support', 'Facilities'] as const;
export type NeedCategory = (typeof CATEGORIES)[number];

export const ROLES = ['donor', 'school_staff', 'school_admin', 'platform_admin', 'cpf_admin'] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  donor: 'Donor',
  school_staff: 'School Staff',
  school_admin: 'School Admin',
  platform_admin: 'Platform Admin',
  cpf_admin: 'CPF Admin',
};

export interface UserProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  graduation_year: string | null;
  school_attended: string | null;
  school_id: string | null;
  role: Role;
  stripe_customer_id: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Donation {
  id: string;
  need_id: string;
  user_id: string | null;
  amount: number;
  is_anonymous: boolean;
  display_name: string | null;
  message: string | null;
  donor_email: string | null;
  stripe_payment_intent_id: string | null;
  stripe_checkout_session_id: string | null;
  stripe_subscription_id: string | null;
  is_recurring: boolean;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  tax_receipt_sent: boolean;
  created_at: string;
  // Donor's refund/redirect choice when the need was cancelled (see
  // DonationChoice). Present only on cancelled-need gifts.
  choice?: DonationChoice | null;
}

export interface WallOfHonorEntry {
  id: string;
  donation_id: string;
  display_name: string | null;
  graduation_year: string | null;
  message: string | null;
  amount_display: number | null;
  created_at: string;
}

export interface ClassYearRank {
  graduation_year: string;
  total_raised: number;
  donor_count: number;
}

export interface Sponsor {
  id: string;
  organization_name: string;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  tier: 'gold' | 'silver' | 'bronze' | null;
  amount_committed: number | null;
  contribution_type: 'donation' | 'sponsorship_contract' | null;
  stripe_payment_id: string | null;
  status: 'pending' | 'active' | 'lapsed';
  created_at: string;
  updated_at: string;
}

export interface Disbursement {
  id: string;
  school_id: string;
  need_id: string | null;
  gross_amount: number | null;
  school_amount: number | null;
  alumniup_fee: number | null;
  cpf_fee: number | null;
  stripe_fee: number | null;
  status: 'pending' | 'processed' | 'confirmed';
  requested_at: string;
  processed_at: string | null;
  notes: string | null;
}

// Admin view joins. DonationRow carries the need title for display;
// DisbursementRow carries school/need names for the read-only disbursement view.
// My Donations also carries the need's public trail state so each gift shows
// its delivery status (Stage 2 story 6).
export type DonationRow = Donation & {
  need_title: string;
  need_trail_status?: TrailStatus | null;
  need_school_id?: string | null;
};
export type DisbursementRow = Disbursement & {
  school_name: string;
  need_title: string | null;
};

// Constants
export const BRAND = {
  navy: '#0F1F38',
  gold: '#B8882A',
  goldLight: '#D4A84E',
  cream: '#F8F7F5',
  green: '#1B6B42',
  white: '#FFFFFF',
  border: '#E0DBD2',
} as const;

export const DONATION_PRESETS = [25, 50, 100, 250, 500, 1000] as const;

export const FEE_SPLIT = {
  school: 0.88,
  alumniup: 0.07,
  cpf: 0.05,
  stripe_percent: 0.029,
  stripe_fixed: 0.30,
} as const;

export const URGENCY_LABELS = {
  high: 'High Priority',
  med: 'Medium Priority',
  low: 'Low Priority',
} as const;

export const CPF_INFO = {
  name: 'Childs Play Foundation, Inc.',
  ein: '86-2707543',
  classification: '501(c)(3)',
  address: 'Detroit, MI',
  contact_email: 'contact@childsplayfoundation.org',
  contact_phone: '(313) 858-6052',
  website: 'childsplayfoundation.org',
} as const;

export const CONTACT = {
  hello: 'hello@alumniupdetroit.org',
  schools: 'schools@alumniupdetroit.org',
  sponsors: 'sponsors@alumniupdetroit.org',
  press: 'press@alumniupdetroit.org',
  support: 'support@alumniupdetroit.org',
  privacy: 'privacy@alumniupdetroit.org',
} as const;

export const SITE_URL = 'https://www.alumniupdetroit.org';