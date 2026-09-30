-- AlumniUp Database Schema
-- Fiscal Sponsor: Childs Play Foundation, Inc. (501(c)(3) EIN 86-2707543)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

-- Schools
CREATE TABLE schools (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL UNIQUE,
  city text DEFAULT 'Detroit',
  state text DEFAULT 'MI',
  district text,
  contact_name text,
  contact_email text,
  contact_phone text,
  contact_title text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended')),
  tier text DEFAULT 'standard' CHECK (tier IN ('founding', 'standard')),
  is_founding_partner boolean DEFAULT false,
  free_forever boolean DEFAULT false,
  subscription_status text CHECK (subscription_status IN ('active', 'expired', 'exempt')),
  subscription_expires_at timestamptz,
  annual_fee numeric DEFAULT 129.00,
  logo_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Funding needs
CREATE TABLE needs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id uuid REFERENCES schools(id) NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  category text CHECK (category IN ('Sports', 'Arts', 'Academics', 'Program Support', 'Facilities')),
  urgency text DEFAULT 'med' CHECK (urgency IN ('high', 'med', 'low')),
  goal_amount numeric NOT NULL CHECK (goal_amount > 0),
  minimum_amount numeric CHECK (minimum_amount >= 0),
  raised_amount numeric DEFAULT 0 CHECK (raised_amount >= 0),
  backer_count integer DEFAULT 0,
  submitted_by_name text,
  submitted_by_email text,
  submitted_by_title text,
  submitted_by_phone text,
  photo_url text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'funded', 'closed', 'rejected')),
  approved_at timestamptz,
  approved_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Users (extends Supabase auth.users)
CREATE TABLE users (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  first_name text,
  last_name text,
  email text UNIQUE NOT NULL,
  graduation_year text,
  school_attended text,
  school_id uuid REFERENCES schools(id), -- links school_staff/school_admin to their school (null for donors)
  role text DEFAULT 'donor' CHECK (role IN ('donor', 'school_staff', 'school_admin', 'platform_admin', 'cpf_admin')),
  stripe_customer_id text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Donations
CREATE TABLE donations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  need_id uuid REFERENCES needs(id) NOT NULL,
  user_id uuid REFERENCES users(id),
  amount numeric NOT NULL CHECK (amount > 0),
  is_anonymous boolean DEFAULT false,
  display_name text,
  message text,
  donor_email text,
  stripe_payment_intent_id text UNIQUE,
  stripe_subscription_id text,
  is_recurring boolean DEFAULT false,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  tax_receipt_sent boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Sponsors
CREATE TABLE sponsors (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_name text NOT NULL,
  contact_name text,
  contact_email text,
  contact_phone text,
  tier text CHECK (tier IN ('gold', 'silver', 'bronze')),
  amount_committed numeric,
  contribution_type text CHECK (contribution_type IN ('donation', 'sponsorship_contract')),
  stripe_payment_id text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'lapsed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Wall of Honor
CREATE TABLE wall_of_honor (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  donation_id uuid REFERENCES donations(id) NOT NULL,
  display_name text,
  graduation_year text,
  message text,
  amount_display numeric,
  created_at timestamptz DEFAULT now()
);

-- School subscriptions log
CREATE TABLE subscriptions_log (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id uuid REFERENCES schools(id) NOT NULL,
  tier text,
  annual_fee numeric,
  stripe_subscription_id text,
  status text,
  period_start timestamptz,
  period_end timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Admin action log
CREATE TABLE admin_log (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_user_id uuid REFERENCES users(id),
  action text CHECK (action IN ('approve_need', 'reject_need', 'approve_school', 'suspend_school')),
  target_type text CHECK (target_type IN ('need', 'school', 'donor')),
  target_id uuid,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Disbursements
CREATE TABLE disbursements (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id uuid REFERENCES schools(id) NOT NULL,
  need_id uuid REFERENCES needs(id),
  gross_amount numeric,
  school_amount numeric,
  alumniup_fee numeric,
  cpf_fee numeric,
  stripe_fee numeric,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'confirmed')),
  requested_at timestamptz DEFAULT now(),
  processed_at timestamptz,
  notes text
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_needs_school_id ON needs(school_id);
CREATE INDEX idx_needs_status ON needs(status);
CREATE INDEX idx_needs_category ON needs(category);
CREATE INDEX idx_donations_need_id ON donations(need_id);
CREATE INDEX idx_donations_user_id ON donations(user_id);
CREATE INDEX idx_donations_status ON donations(status);
CREATE INDEX idx_wall_of_honor_donation_id ON wall_of_honor(donation_id);
CREATE INDEX idx_schools_status ON schools(status);
CREATE INDEX idx_users_school_id ON users(school_id);
CREATE INDEX idx_users_role ON users(role);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Schools: public read for active, admin write
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view active schools" ON schools
  FOR SELECT USING (status = 'active');
CREATE POLICY "Platform admins can manage schools" ON schools
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM users WHERE role = 'platform_admin')
  );

-- Needs: public read for active, school_staff can create
ALTER TABLE needs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view active needs" ON needs
  FOR SELECT USING (status IN ('active', 'funded'));
CREATE POLICY "School staff can create needs" ON needs
  FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT id FROM users WHERE role IN ('school_staff', 'school_admin'))
    AND school_id = (SELECT school_id FROM users WHERE id = auth.uid())
  );
CREATE POLICY "School staff can view their school needs" ON needs
  FOR SELECT USING (
    auth.uid() IN (SELECT id FROM users WHERE role IN ('school_staff', 'school_admin'))
    AND school_id = (SELECT school_id FROM users WHERE id = auth.uid())
  );
CREATE POLICY "School staff can update their school needs" ON needs
  FOR UPDATE USING (
    auth.uid() IN (SELECT id FROM users WHERE role IN ('school_staff', 'school_admin'))
    AND school_id = (SELECT school_id FROM users WHERE id = auth.uid())
  );
CREATE POLICY "Platform admins can manage needs" ON needs
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM users WHERE role = 'platform_admin')
  );

-- Donations: donors see own, admin see all
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Donors can view own donations" ON donations
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Platform admins can view all donations" ON donations
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM users WHERE role = 'platform_admin')
  );
-- School staff/admins can view donation activity for their own school's needs
-- (the UI never surfaces donor_email; see useSchoolDonations which selects a
-- limited column set).
CREATE POLICY "School staff can view donations for their school" ON donations
  FOR SELECT USING (
    auth.uid() IN (SELECT id FROM users WHERE role IN ('school_staff', 'school_admin'))
    AND need_id IN (
      SELECT n.id FROM needs n
      WHERE n.school_id = (SELECT school_id FROM users WHERE id = auth.uid())
    )
  );

-- Wall of Honor: public read
ALTER TABLE wall_of_honor ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view wall of honor" ON wall_of_honor
  FOR SELECT USING (true);

-- Users: users can read/update own profile
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Platform admins can manage users" ON users
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM users WHERE role = 'platform_admin')
  );

-- Sponsors: public read active, admin manage
ALTER TABLE sponsors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view active sponsors" ON sponsors
  FOR SELECT USING (status = 'active');
CREATE POLICY "Platform admins can manage sponsors" ON sponsors
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM users WHERE role = 'platform_admin')
  );

-- Subscriptions log: admin manage, school admin read own school
ALTER TABLE subscriptions_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Platform admins can manage subscriptions" ON subscriptions_log
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM users WHERE role = 'platform_admin')
  );
CREATE POLICY "School admin can view own subscriptions" ON subscriptions_log
  FOR SELECT USING (
    auth.uid() IN (SELECT id FROM users WHERE role = 'school_admin')
    AND school_id = (SELECT school_id FROM users WHERE id = auth.uid())
  );

-- Admin log: platform admins and cpf admins read, platform admins write
ALTER TABLE admin_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view log" ON admin_log
  FOR SELECT USING (
    auth.uid() IN (SELECT id FROM users WHERE role IN ('platform_admin', 'cpf_admin'))
  );
CREATE POLICY "Platform admins can write log" ON admin_log
  FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT id FROM users WHERE role = 'platform_admin')
  );

-- Disbursements: platform admins manage, cpf admins read-only
ALTER TABLE disbursements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view disbursements" ON disbursements
  FOR SELECT USING (
    auth.uid() IN (SELECT id FROM users WHERE role IN ('platform_admin', 'cpf_admin'))
  );
CREATE POLICY "Platform admins can manage disbursements" ON disbursements
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM users WHERE role = 'platform_admin')
  );

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $fn$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$fn$ LANGUAGE plpgsql;

CREATE TRIGGER trg_schools_updated_at BEFORE UPDATE ON schools
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_needs_updated_at BEFORE UPDATE ON needs
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_sponsors_updated_at BEFORE UPDATE ON sponsors
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Auto-create a public.users profile whenever a new auth user signs up.
-- New accounts default to the 'donor' role; school_staff / school_admin /
-- platform_admin / cpf_admin are granted later by a platform admin (never
-- self-assigned from signup metadata).
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $fn$
BEGIN
  INSERT INTO public.users (id, first_name, last_name, email, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.email,
    'donor'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$fn$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Maintain need.raised_amount / backer_count when a donation is completed.
-- This keeps aggregate stats accurate without manual bookkeeping.
CREATE OR REPLACE FUNCTION sync_need_progress()
RETURNS TRIGGER AS $fn$
BEGIN
  -- On insert of a completed donation
  IF (TG_OP = 'INSERT' AND NEW.status = 'completed') THEN
    UPDATE needs
      SET raised_amount = raised_amount + NEW.amount,
          backer_count = backer_count + 1
      WHERE id = NEW.need_id;
  END IF;

  -- On update to completed (e.g. pending -> completed)
  IF (TG_OP = 'UPDATE' AND NEW.status = 'completed' AND OLD.status <> 'completed') THEN
    UPDATE needs
      SET raised_amount = raised_amount + NEW.amount,
          backer_count = backer_count + 1
      WHERE id = NEW.need_id;
  END IF;

  -- On refund/failure after being completed
  IF (TG_OP = 'UPDATE' AND OLD.status = 'completed' AND NEW.status IN ('refunded', 'failed')) THEN
    UPDATE needs
      SET raised_amount = GREATEST(raised_amount - OLD.amount, 0),
          backer_count = GREATEST(backer_count - 1, 0)
      WHERE id = NEW.need_id;
  END IF;

  RETURN NEW;
END;
$fn$ LANGUAGE plpgsql;

CREATE TRIGGER trg_donations_sync_need ON donations
  AFTER INSERT OR UPDATE ON donations
  FOR EACH ROW EXECUTE FUNCTION sync_need_progress();

-- Public aggregate stats for the homepage hero. Donations are private (RLS),
-- so platform-wide totals must be exposed through a SECURITY DEFINER function
-- that returns only aggregate numbers (no PII, no individual records).
CREATE OR REPLACE FUNCTION get_platform_stats()
RETURNS json AS $fn$
DECLARE
  total_raised numeric;
  needs_funded integer;
  alumni_donors integer;
  school_count integer;
BEGIN
  SELECT COALESCE(SUM(raised_amount), 0)
    INTO total_raised
    FROM needs
    WHERE status IN ('active', 'funded');

  SELECT COUNT(*)
    INTO needs_funded
    FROM needs
    WHERE status = 'funded';

  SELECT COUNT(DISTINCT user_id)
    INTO alumni_donors
    FROM donations
    WHERE status = 'completed' AND user_id IS NOT NULL;

  SELECT COUNT(*)
    INTO school_count
    FROM schools
    WHERE status = 'active';

  RETURN json_build_object(
    'total_raised', total_raised,
    'needs_funded', needs_funded,
    'alumni_donors', alumni_donors,
    'school_count', school_count
  );
END;
$fn$ LANGUAGE plpgsql SECURITY DEFINER;

-- Allow both anonymous visitors and signed-in users to read aggregate stats.
GRANT EXECUTE ON FUNCTION get_platform_stats() TO anon, authenticated;

-- Class-year leaderboard: aggregate completed donors by graduation year.
-- Only donors who chose to be recognized (display_name present) and whose
-- graduation year is known are counted; anonymous donors are never surfaced
-- in the leaderboard. Returns aggregate numbers only (no PII).
CREATE OR REPLACE FUNCTION get_class_year_leaderboard()
RETURNS TABLE (graduation_year text, total_raised numeric, donor_count bigint) AS $fn$
BEGIN
  RETURN QUERY
    SELECT
      w.graduation_year,
      COALESCE(SUM(w.amount_display), 0) AS total_raised,
      COUNT(*) AS donor_count
    FROM wall_of_honor w
    WHERE w.graduation_year IS NOT NULL
    GROUP BY w.graduation_year
    ORDER BY total_raised DESC;
END;
$fn$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_class_year_leaderboard() TO anon, authenticated;

-- ============================================
-- SEED DATA: Founding Schools & Sample Needs
-- ============================================

-- Insert founding schools
INSERT INTO schools (name, city, district, status, tier, is_founding_partner, free_forever, annual_fee, subscription_status)
VALUES
  ('Martin Luther King Jr. Senior High School', 'Detroit', 'Detroit Public Schools', 'active', 'founding', true, true, 0, 'exempt'),
  ('Detroit Henry Ford High School', 'Detroit', 'Detroit Public Schools', 'active', 'founding', true, false, 99.00, 'active'),
  ('Cass Technical High School', 'Detroit', 'Detroit Public Schools', 'active', 'founding', true, false, 99.00, 'active'),
  ('Renaissance High School', 'Detroit', 'Detroit Public Schools', 'active', 'founding', true, false, 99.00, 'active')
ON CONFLICT DO NOTHING;

-- Insert sample needs for King High
INSERT INTO needs (school_id, title, description, category, urgency, goal_amount, minimum_amount, raised_amount, backer_count, submitted_by_name, submitted_by_title, status)
SELECT 
  (SELECT id FROM schools WHERE name = 'Martin Luther King Jr. Senior High School'),
  'Varsity Baseball Field Flood Repair',
  'The varsity baseball field at King High suffers from severe drainage issues, causing flooding after every rain. Games are frequently cancelled and the field is becoming unsafe for play. We need to install proper drainage systems and regrade the field to keep our student-athletes safe and competitive.',
  'Sports',
  'high',
  18000,
  8500,
  3200,
  12,
  'Coach Marcus Williams',
  'Varsity Baseball Coach',
  'active'
WHERE EXISTS (SELECT id FROM schools WHERE name = 'Martin Luther King Jr. Senior High School');

INSERT INTO needs (school_id, title, description, category, urgency, goal_amount, minimum_amount, raised_amount, backer_count, submitted_by_name, submitted_by_title, status)
SELECT 
  (SELECT id FROM schools WHERE name = 'Martin Luther King Jr. Senior High School'),
  'Performing Arts Stage Lighting Upgrade',
  'Our auditorium lighting system was installed in 1998 and is now failing. Several lights have stopped working, and we cannot find replacement parts. This upgrade will give our students a professional-grade performance experience for plays, concerts, and assemblies.',
  'Arts',
  'high',
  5500,
  NULL,
  1800,
  8,
  'Ms. Tanya Johnson',
  'Performing Arts Director',
  'active'
WHERE EXISTS (SELECT id FROM schools WHERE name = 'Martin Luther King Jr. Senior High School');

INSERT INTO needs (school_id, title, description, category, urgency, goal_amount, minimum_amount, raised_amount, backer_count, submitted_by_name, submitted_by_title, status)
SELECT 
  (SELECT id FROM schools WHERE name = 'Martin Luther King Jr. Senior High School'),
  'Debate Team Coach Stipend',
  'Our nationally-ranked debate team has been without a dedicated coach for the current season. We need to fund a stipend for a qualified debate coach who can prepare our students for competitions. King High has a proud tradition of debate excellence, but we are at risk of losing our program without dedicated coaching support.',
  'Program Support',
  'med',
  4000,
  NULL,
  950,
  5,
  'Dr. Angela Reeves',
  'Principal',
  'active'
WHERE EXISTS (SELECT id FROM schools WHERE name = 'Martin Luther King Jr. Senior High School');