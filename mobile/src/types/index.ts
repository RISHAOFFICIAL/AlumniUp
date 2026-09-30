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
  stripe_subscription_id: string | null;
  is_recurring: boolean;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  tax_receipt_sent: boolean;
  created_at: string;
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
export type DonationRow = Donation & { need_title: string };
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
  hello: 'hello@alumniup.org',
  schools: 'schools@alumniup.org',
  sponsors: 'sponsors@alumniup.org',
  press: 'press@alumniup.org',
} as const;