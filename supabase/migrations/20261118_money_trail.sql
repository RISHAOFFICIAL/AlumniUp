-- AlumniUp money trail migration (2026-11-18)
--
-- Adds the Stage 3 public money trail state machine to the schema in
-- supabase/schema.sql. Apply AFTER schema.sql in the SQL editor
-- (Dashboard -> SQL Editor -> New query -> paste -> Run).
--
-- What this adds:
--   1. needs.trail_status + dated trail columns (funded_at, sent_at,
--      received_at, proof_due_at, delay/cancel reasons, disbursement
--      structure, media-release attestation).
--   2. trail_entries: the dated public audit log. Every status change
--      writes one row. The trail is the audit log; there is no separate
--      hidden history.
--   3. proof_packets: the proof-of-use packet (S11 addendum). After a
--      school confirms receipt it has 30 days to file invoices/receipts,
--      a completion photo, and the final amount spent, attested by the
--      school administrator. The fiscal sponsor verifies before the need
--      is marked USE VERIFIED.
--   4. donation_choices: a donor's refund-or-redirect choice when a need
--      they funded is cancelled before disbursement.
--   5. donations.stripe_checkout_session_id (Stripe Checkout sessions).
--   6. Public read of closed needs, so CANCELLED and UNFUNDED AT CLOSE
--      needs stay publicly visible with their reason (no silent
--      cancellations).
--
-- The TypeScript mirror is src/lib/trail.ts; the mock-mode seed rows are
-- in src/lib/data/mock.ts. Both use the same status words and column
-- names, so flipping NEXT_PUBLIC_DATA_SOURCE to supabase needs no UI
-- change.

-- ============================================
-- 1. Trail columns on needs
-- ============================================

ALTER TABLE needs ADD COLUMN IF NOT EXISTS trail_status text
  CHECK (trail_status IN (
    'draft', 'in_review', 'live', 'funded', 'sent', 'received',
    'awaiting_proof', 'use_verified', 'delayed', 'cancelled',
    'proof_overdue', 'unfunded_at_close'
  ));
ALTER TABLE needs ADD COLUMN IF NOT EXISTS funded_at timestamptz;
ALTER TABLE needs ADD COLUMN IF NOT EXISTS sent_at timestamptz;
ALTER TABLE needs ADD COLUMN IF NOT EXISTS received_at timestamptz;
ALTER TABLE needs ADD COLUMN IF NOT EXISTS received_by text;
ALTER TABLE needs ADD COLUMN IF NOT EXISTS proof_due_at timestamptz;
ALTER TABLE needs ADD COLUMN IF NOT EXISTS delayed_reason text;
ALTER TABLE needs ADD COLUMN IF NOT EXISTS delay_updated_at timestamptz;
ALTER TABLE needs ADD COLUMN IF NOT EXISTS cancelled_reason text;
ALTER TABLE needs ADD COLUMN IF NOT EXISTS disbursement_structure text
  CHECK (disbursement_structure IN ('single', 'tranches', 'direct_vendor'));
ALTER TABLE needs ADD COLUMN IF NOT EXISTS attested_media_release boolean DEFAULT false;

-- Backfill trail_status from the legacy workflow status for existing rows.
UPDATE needs SET trail_status = CASE status
  WHEN 'pending' THEN 'in_review'
  WHEN 'active' THEN 'live'
  WHEN 'funded' THEN 'funded'
  WHEN 'closed' THEN 'unfunded_at_close'
  WHEN 'rejected' THEN 'cancelled'
  ELSE 'live'
END WHERE trail_status IS NULL;

ALTER TABLE needs ALTER COLUMN trail_status SET DEFAULT 'in_review';
ALTER TABLE needs ALTER COLUMN trail_status SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_needs_trail_status ON needs(trail_status);
CREATE INDEX IF NOT EXISTS idx_needs_proof_due_at ON needs(proof_due_at);

-- ============================================
-- 2. Trail entries (public audit log)
-- ============================================

CREATE TABLE IF NOT EXISTS trail_entries (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  need_id uuid REFERENCES needs(id) NOT NULL,
  event_type text NOT NULL CHECK (event_type IN (
    'posted', 'approved', 'funded', 'disbursed', 'received',
    'proof_submitted', 'proof_verified', 'proof_requested',
    'delayed', 'delay_updated', 'cancelled', 'refund_issued',
    'redirected', 'proof_overdue', 'extended', 'partial_disbursed'
  )),
  from_status text CHECK (from_status IN (
    'draft', 'in_review', 'live', 'funded', 'sent', 'received',
    'awaiting_proof', 'use_verified', 'delayed', 'cancelled',
    'proof_overdue', 'unfunded_at_close'
  )),
  to_status text CHECK (to_status IN (
    'draft', 'in_review', 'live', 'funded', 'sent', 'received',
    'awaiting_proof', 'use_verified', 'delayed', 'cancelled',
    'proof_overdue', 'unfunded_at_close'
  )),
  note text,
  actor_role text CHECK (actor_role IN (
    'donor', 'school_staff', 'school_admin', 'platform_admin', 'cpf_admin', 'system'
  )),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_trail_entries_need_id ON trail_entries(need_id);
CREATE INDEX IF NOT EXISTS idx_trail_entries_created_at ON trail_entries(created_at);

-- Seed trail entries for the existing King High needs so the public trail
-- is never blank (Stage 2 story 2: no need ever shows a blank money state).
INSERT INTO trail_entries (need_id, event_type, from_status, to_status, note, actor_role, created_at)
SELECT n.id, 'posted', 'draft', 'in_review', 'Need posted for review.', 'school_staff', n.created_at
FROM needs n
WHERE NOT EXISTS (SELECT 1 FROM trail_entries t WHERE t.need_id = n.id);

INSERT INTO trail_entries (need_id, event_type, from_status, to_status, note, actor_role, created_at)
SELECT n.id, 'approved', 'in_review', 'live', 'Approved by the school and live for donations.', 'school_admin', n.approved_at
FROM needs n
WHERE n.approved_at IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM trail_entries t WHERE t.need_id = n.id AND t.event_type = 'approved');

-- ============================================
-- 3. Proof-of-use packets
-- ============================================

CREATE TABLE IF NOT EXISTS proof_packets (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  need_id uuid REFERENCES needs(id) NOT NULL,
  final_amount_spent numeric,
  invoices_note text,
  completion_photo_url text,
  attested_by text,
  attested_at timestamptz,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'verified', 'needs_more_info')),
  review_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_proof_packets_need_id ON proof_packets(need_id);
CREATE INDEX IF NOT EXISTS idx_proof_packets_status ON proof_packets(status);

CREATE TRIGGER trg_proof_packets_updated_at BEFORE UPDATE ON proof_packets
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================
-- 4. Donor refund / redirect choices
-- ============================================

CREATE TABLE IF NOT EXISTS donation_choices (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  donation_id uuid REFERENCES donations(id) NOT NULL,
  choice text NOT NULL CHECK (choice IN ('refund', 'redirect')),
  redirect_need_id uuid REFERENCES needs(id),
  created_at timestamptz DEFAULT now(),
  resolved_at timestamptz,
  UNIQUE (donation_id)
);

CREATE INDEX IF NOT EXISTS idx_donation_choices_donation_id ON donation_choices(donation_id);

-- ============================================
-- 5. Stripe Checkout session id on donations
-- ============================================

ALTER TABLE donations ADD COLUMN IF NOT EXISTS stripe_checkout_session_id text UNIQUE;

-- ============================================
-- 6. Public read of closed needs (cancelled / unfunded-at-close
--    needs stay public with their reason; no silent cancellations)
-- ============================================

DROP POLICY IF EXISTS "Public can view active needs" ON needs;
CREATE POLICY "Public can view public needs" ON needs
  FOR SELECT USING (status IN ('active', 'funded', 'closed'));

-- ============================================
-- ROW LEVEL SECURITY for the new tables
-- ============================================

-- Trail entries: public read for public needs; staff/admins write.
ALTER TABLE trail_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view trail entries for public needs" ON trail_entries
  FOR SELECT USING (
    need_id IN (SELECT id FROM needs WHERE status IN ('active', 'funded', 'closed'))
  );
CREATE POLICY "Platform admins can manage trail entries" ON trail_entries
  FOR ALL USING (public.is_platform_admin());
CREATE POLICY "School staff can view their school trail entries" ON trail_entries
  FOR SELECT USING (
    auth.uid() IN (SELECT id FROM users WHERE role IN ('school_staff', 'school_admin'))
    AND need_id IN (
      SELECT n.id FROM needs n
      WHERE n.school_id = (SELECT school_id FROM users WHERE id = auth.uid())
    )
  );

-- Proof packets: school staff manage their own school's packets;
-- platform and CPF admins manage all. The completion photo is public
-- only once the need is USE VERIFIED (the app surfaces it then).
ALTER TABLE proof_packets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Platform admins can manage proof packets" ON proof_packets
  FOR ALL USING (public.is_platform_admin());
CREATE POLICY "CPF admins can manage proof packets" ON proof_packets
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM users WHERE role = 'cpf_admin')
  );
CREATE POLICY "School staff can manage their school proof packets" ON proof_packets
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM users WHERE role IN ('school_staff', 'school_admin'))
    AND need_id IN (
      SELECT n.id FROM needs n
      WHERE n.school_id = (SELECT school_id FROM users WHERE id = auth.uid())
    )
  );

-- Donation choices: donors record their own choice; admins read all.
ALTER TABLE donation_choices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Donors can manage own donation choices" ON donation_choices
  FOR ALL USING (
    donation_id IN (SELECT id FROM donations WHERE user_id = auth.uid())
  );
CREATE POLICY "Platform admins can manage donation choices" ON donation_choices
  FOR ALL USING (public.is_platform_admin());

-- ============================================
-- Helper: mark needs PROOF OVERDUE past the 30-day window.
-- Run on a schedule (pg_cron or a daily admin job) so the public state
-- flips on day 31 without anyone remembering. Also writes the trail
-- entry, because every status change writes one.
-- ============================================

CREATE OR REPLACE FUNCTION mark_proof_overdue()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  updated_count integer := 0;
  rec record;
BEGIN
  FOR rec IN
    SELECT id FROM needs
    WHERE trail_status = 'awaiting_proof'
      AND proof_due_at IS NOT NULL
      AND proof_due_at < now()
  LOOP
    UPDATE needs SET trail_status = 'proof_overdue', updated_at = now() WHERE id = rec.id;
    INSERT INTO trail_entries (need_id, event_type, from_status, to_status, note, actor_role)
    VALUES (rec.id, 'proof_overdue', 'awaiting_proof', 'proof_overdue',
            'Proof of use is past the 30-day window.', 'system');
    updated_count := updated_count + 1;
  END LOOP;
  RETURN updated_count;
END;
$fn$;
