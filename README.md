# AlumniUp

A crowdfunding platform connecting Detroit school alumni and corporate sponsors with verified funding needs posted by coaches, teachers, and administrators at Detroit-area public schools.

**Fiscal Sponsor:** Childs Play Foundation, Inc. — 501(c)(3) EIN 86-2707543

## Tech Stack

- **Frontend:** Next.js 14 (App Router), Tailwind CSS, shadcn/ui
- **Backend:** Supabase (PostgreSQL, Auth, Storage, RLS)
- **Payments:** Stripe (Payment Element, Subscriptions, Connect)
- **Email:** SendGrid / Resend
- **Hosting:** Vercel (planned)

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