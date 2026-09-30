# AlumniUp — Setup & Environment Variables

This document lists every environment variable the app needs and where to get
each one. Create a `.env.local` file at the project root (copy `.env.example`)
and fill in the values below. **Never commit `.env.local`.**

## 1. Supabase (database + auth + storage)

Create a project at https://supabase.com, then run `supabase/schema.sql` in the
SQL editor (Dashboard → SQL Editor → New query → paste → Run). This creates all
tables, RLS policies, triggers, and seed data.

| Variable | Where to get it | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Dashboard → Settings → API → Project URL | e.g. `https://xxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Dashboard → Settings → API → anon public key | Safe for browser; protected by RLS |
| `SUPABASE_URL` | Same as `NEXT_PUBLIC_SUPABASE_URL` | Used server-side (API routes) |
| `SUPABASE_SERVICE_ROLE_KEY` | Dashboard → Settings → API → service_role key | **Secret — bypasses RLS.** Server-side only, never expose to the browser. |

After applying the schema, enable auth providers under **Authentication →
Providers** (Email is on by default).

**Schema note (approved deviation):** the `users` table includes a nullable
`school_id` (FK → `schools`). This is required to enforce the "school staff can
only see their own school's data" row-level-security rule; without it there is
no way to map a staff account to a school. Donors have `school_id = NULL`.

## 2. Stripe (donations / subscriptions / Connect)

Create an account at https://stripe.com and start in **test mode**.

| Variable | Where to get it | Notes |
|---|---|---|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Dashboard → Developers → API keys → Publishable key (`pk_test_…`) | Safe for browser |
| `STRIPE_SECRET_KEY` | Dashboard → Developers → API keys → Secret key (`sk_test_…`) | **Secret — server-side only** |
| `STRIPE_WEBHOOK_SECRET` | `stripe listen --forward-to localhost:3000/api/webhooks/stripe` prints `whsec_…` (or Dashboard → Developers → Webhooks) | Verifies webhook signatures |

## 3. Email (Resend or SendGrid)

Use **Resend** (primary) or **SendGrid** for transactional email.

| Variable | Where to get it | Notes |
|---|---|---|
| `RESEND_API_KEY` | https://resend.com → API Keys | Primary provider |
| `SENDGRID_API_KEY` | https://app.sendgrid.com → Settings → API Keys | Optional fallback |
| `EMAIL_FROM` | Your choice | e.g. `noreply@alumniup.org` (verify domain/sender first) |

## 4. Site

| Variable | Value | Notes |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` (dev) / `https://alumniup.org` (prod) | Used in links & redirects |
| `NEXT_PUBLIC_APP_NAME` | `AlumniUp` | App display name |

## Quick start

```bash
cp .env.example .env.local   # then fill in real values
npm install
npm run dev                  # http://localhost:3000
```

## Build

```bash
npm run build   # production build (verified passing)
npm run start   # serve the production build
```

## Contact for credentials

The following are owned by the AlumniUp team / founder (Risha Alexis) and must
be provided to complete integration:

- Supabase project URL + anon key + service_role key
- Stripe publishable key + secret key + webhook secret (test mode first)
- Resend (or SendGrid) API key
