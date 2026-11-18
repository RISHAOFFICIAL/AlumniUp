# AlumniUp

A crowdfunding platform connecting Detroit school alumni and corporate sponsors with verified funding needs posted by coaches, teachers, and administrators at Detroit-area public schools.

**Fiscal Sponsor:** Childs Play Foundation, Inc. — 501(c)(3) EIN 86-2707543

## Tech Stack

- **Frontend:** Next.js 14 (App Router), Tailwind CSS, shadcn/ui
- **Backend:** Supabase (PostgreSQL, Auth, Storage, RLS)
- **Payments:** Stripe hosted Checkout (test mode first; see
  `README-SETUP.md` for keys and the webhook). The webhook
  (`/api/webhooks/stripe`) records gifts and sends tax receipts
  through Resend naming Childs Play Foundation, Inc. (EIN 86-2707543).
- **Email:** Resend (primary) / SendGrid fallback
- **Hosting:** Vercel (live at alumniupdetroit.org)

## Public money trail

Every need moves through LIVE → FUNDED → SENT → RECEIVED → AWAITING
PROOF → USE VERIFIED, with DELAYED, CANCELLED, PROOF OVERDUE, and
UNFUNDED AT CLOSE as public exception states. Every status change
writes a dated entry to the need's public trail. The state machine
lives in `src/lib/trail.ts`, the Supabase mirror in
`supabase/migrations/20261118_money_trail.sql`, and the mock seed
trails in `src/lib/data/mock.ts`. Surfaces: the need page
(`/needs/[id]`), My Donations (`/my-donations`), the school portal,
and the admin trail, disbursement, and proof pages.

## Getting Started

1. Clone the repository
2. Copy `.env.example` to `.env.local` and fill in your Supabase and Stripe credentials
3. Run `npm install`
4. Run `npm run dev`

## Database Schema

The full database schema is in `supabase/schema.sql`. It includes:

- `schools` — School profiles with tier, subscription, and contact info
- `needs` — Funding needs posted by school staff
- `users` — User profiles extending Supabase auth
- `donations` — Donation records with Stripe integration
- `wall_of_honor` — Public donor recognition
- `sponsors` — Corporate sponsorship tracking
- `disbursements` — Fund disbursement tracking to schools
- `trail_entries` — Dated public money-trail entries (migration `20261118_money_trail.sql`)
- `proof_packets` — Proof-of-use packets (30-day rule after receipt)
- `donation_choices` — Donor refund-or-redirect choices on cancelled needs

## Project Structure

```
src/
  app/           — Next.js App Router pages
  components/    — Shared UI components
  hooks/         — Framework-agnostic business logic hooks
  lib/           — Supabase client and utilities
  types/         — TypeScript type definitions
supabase/
  schema.sql     — Complete database schema with RLS policies
```

## Brand

- Navy: #0F1F38
- Gold: #B8882A
- Cream: #F8F7F5
- Green: #1B6B42
- Fonts: Cormorant Garamond (headings), Instrument Sans (body)