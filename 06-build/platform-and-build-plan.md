# AlumniUp: Platform Decision and Build Plan (Stage 6)

Status: APPROVED by Risha, October 19, 2026: web primary,
SwiftUI companion, Android later, build order as written.
Process: Risha's App Building Playbook, Stage 6.
Unusual honesty note: AlumniUp was first built fast, before this
process existed for it. This stage therefore does two jobs: it makes
the platform decision formally, with the scorecard, and it records
what is already built against that decision, plus the remaining
build work in priority order.

## Decision

- Primary platform: the web app (Next.js), mobile-first, installable
  as a PWA. Every persona reaches it with a link; nobody installs
  anything to give.
- Native iOS: SwiftUI, built with the GitHub plus Xcode Cloud route
  Risha already chose for her apps. Mirrors the donor and poster
  flows first.
- Android: later. The same backend serves it when it comes; the Expo
  scaffold in mobile/ is parked, not deleted, as one option.
- One backend for all: Supabase (database, auth, storage) with
  row-level security, Stripe for payments, Resend for email.

## Scorecard (options honestly weighed)

Web app (chosen as primary):
- Cost and timeline: lowest; already built. Time to a real donation:
  days of wiring, not weeks of building.
- Maintenance: one codebase serves every device.
- Store policy risk: none; no gatekeeper between AlumniUp and donors.
- UX quality: high for forms and browsing; no app-store presence,
  which costs some discovery and some trust signaling.

Native SwiftUI iOS (chosen as the companion):
- Cost and timeline: moderate; scaffold already built (see below).
- UX quality: highest on iPhone, Liquid Glass per Risha's standing
  rule, App Store presence for credibility with sponsors.
- Store policy risk: REAL and specific. Apple's rules for charitable
  giving are strict: an app that is not itself an approved nonprofit
  cannot collect donations in-app with its own payment UI; donation
  flows must use approved routes (for example, the nonprofit's own
  approved status, Apple Pay for approved nonprofits, or linking to
  the web checkout). AlumniUp's plan of record: the iOS Donate
  button opens the web checkout (Stripe hosted, fiscal sponsor as
  the recipient) until and unless an approved in-app route exists.
  This is designed into the flows now, not discovered at review.
- Owner steps: Apple Developer Program enrollment ($99/yr, Risha's
  Apple ID) before TestFlight or the App Store.

React Native / Expo (considered, not chosen):
- Would have given iOS and Android from one codebase, and a scaffold
  exists. Rejected for iOS because Risha's native route (SwiftUI,
  Xcode Cloud) is already her standing pattern, the design rules
  (Liquid Glass, HIG components) are native-first, and she
  explicitly picked SwiftUI on October 19, 2026. The donation policy
  risk is identical to native, so Expo bought nothing there.

Hybrid wrapper (web in a shell):
- Cheapest store presence, worst of both: store policy risk without
  native quality, and Apple's minimum-functionality rule makes
  rejection likely. Not chosen.

## What is already built (exhibits)

- Web app: feature-complete against sample data. All Stage 3 flows
  exist as screens. Runs in mock mode by default
  (NEXT_PUBLIC_DATA_SOURCE); the live data layer is designed
  (Supabase schema, 9 tables, RLS) but not yet connected.
- Native iOS app: SwiftUI, Heritage Premium, Liquid Glass, sample
  data, preview-only donation sheet, at ios-native/AlumniUp/.
  Opens in Xcode 26 on Risha's Mac; NOT compile verified on this
  machine (no Xcode here), so a small fix pass from her first build
  is expected and budgeted below.
- Build repair: the web production build is fixed locally
  (tsconfig excludes the mobile and ios-native folders; full build
  verified green). Held uncommitted at Risha's direction on
  October 19, 2026: no deploys yet.

## Remaining build work, in priority order

Estimates are Muse's working hours, labeled as estimates, not
promises. "Gate" marks work needing a Risha-held account, key,
or approval.

STATUS UPDATE, November 18, 2026: items 1 (commit), 2, 4, and 5
are CLOSED in this pass; item 3 and the live halves of 4 and 6
remain gated on Risha-held accounts. Details below.

1. Commit the build fix and deploy the preview to Vercel.
   About 30 minutes. GATE: Risha says deploy (held since Oct 19).
   UPDATE Nov 18: the tsconfig fix itself is COMMITTED (commit
   4c1575b, "Complete the process run ... and the tsconfig build
   fix") and pushed; the working tree was clean when this pass
   started. Only the deploy still waits on Risha's word.
2. Apply the Heritage Premium hi-fi to the web app (theme pass:
   tokens, type, photo-first cards, nav, footer, modal states from
   the Stage 5 spec). 1 to 2 sessions. This also fixes every audit
   finding (missing nav and footer on sub-pages, the crushed
   "minimum to begin" strip, the disabled-looking Donate button,
   the zero-count hero stat, missing photos).
   CLOSED Nov 18: the theme pass was already committed (f236c00)
   and verified in this pass: shared SiteChrome on all public
   pages, photo-first cards, the "minimum to begin" strip reads
   "Can begin at $X funded", hero stats are Raised So Far /
   Alumni Donors / Schools Live (no zero-count stat), and the
   Contribute button is gold and only disabled when the need is
   not accepting donations. Remaining visual debt: real school
   photos still stand in for the sample photos (Stage 7 item 6).
3. Connect live data: create the Supabase project, apply the
   schema, wire auth (magic link), flip the data source toggle.
   Half a session. GATE: Risha's Supabase account (free tier).
   STILL OPEN Nov 18. New in this pass: the money-trail migration
   (supabase/migrations/20261118_money_trail.sql) must be applied
   after schema.sql. The app already points at a provisioned
   project URL in config; applying the schema to a live project
   is Risha's call.
4. Real payments: Stripe checkout session for real, the missing
   webhook route, receipts through Resend naming Childs Play
   Foundation, Inc. and EIN 86-2707543. Half a session plus test
   donations. GATE: Stripe account in test mode first; live mode
   needs the fiscal sponsor's Stripe readiness confirmed.
   CODE CLOSED Nov 18: real Stripe hosted Checkout sessions
   (/api/checkout, one-time and monthly), the webhook route
   (/api/webhooks/stripe: checkout.session.completed,
   invoice.payment_succeeded, charge.refunded,
   customer.subscription.deleted), Resend sending with receipt
   and trail email templates (src/lib/email/templates.ts), and
   success/cancel return pages. Test-mode ready; no live keys,
   no real charges. STILL GATED: test keys from Risha's Stripe
   account, a test donation pass, and the fiscal sponsor's live
   readiness.
5. The public money trail: the Stage 3 state machine in the
   database (status, dated trail entries), on the need page, in My
   Donations, and in the portal; admin approval queue (S12);
   disbursement recording (S14); receipt confirmation (S10/S13).
   This is the Stage 2 must-have work the mock build skipped.
   1 to 2 sessions.
   CLOSED Nov 18 (mock mode live, Supabase mirror ready): the
   state machine (LIVE to FUNDED to SENT to RECEIVED to AWAITING
   PROOF to USE VERIFIED, plus DELAYED, CANCELLED, PROOF OVERDUE,
   UNFUNDED AT CLOSE) is implemented in src/lib/trail.ts, the
   mock store, the Supabase migration, and the trail API route.
   Surfaces: need detail page S3 (/needs/[id], new), My Donations
   S7 (/my-donations, new, with refund/redirect choice and monthly
   cancel), portal receipt confirmation and proof-of-use filing
   (S10/S13, 30-day rule, PROOF OVERDUE blocks new needs),
   admin approval queue with required reject reason (S12),
   disbursement recording (S14), delay/cancel actions
   (/admin/needs), and the proof review queue (/admin/proof).
   Also closed in this pass: the policy pages (Stage 7 item 5)
   are published (/privacy, /terms, /refund-policy), linked in
   the footer and the donate sheet; the iOS Donate action now
   opens the web checkout in the browser (it previously showed a
   fake in-app confirmation).
6. End-to-end test with test money: register a school, verify,
   post, approve, donate, disburse (recorded), confirm receipt,
   watch every public state change. Half a session.
   STILL OPEN Nov 18: needs items 3 and 4 ungated (Supabase live,
   Stripe test keys). The mock-mode loop is testable now: fund a
   need in the preview, record the disbursement in /admin,
   confirm receipt in /portal, file proof, verify in /admin/proof.
7. iOS: first Xcode build fix pass (from Risha's error list), then
   point the app at the live API in a later pass; TestFlight after
   Developer enrollment. GATE: enrollment is Risha's.
   STILL OPEN Nov 18. Static review done this pass: no obvious
   compile blockers found (all referenced symbols exist, Liquid
   Glass APIs match the iOS 26 deployment target, NavigationStack
   destinations are wired). The Donate fix above still needs a
   real Xcode build on Risha's Mac to verify. GATE: her Mac and
   Developer enrollment.

## MVP cut order

- Must ship for a real first donation: items 1, 3, 4, and the parts
  of 5 that touch the donor (trail on the need page, My Donations).
- Ship in the same launch if time permits: admin queue and
  disbursement recording in their full S12/S14 form (until then the
  operator can run them from the database directly; not pretty,
  fully functional, and honest).
- Later: Heritage Premium web polish beyond the theme pass, iOS
  live data, Android, sponsor self-serve dashboard, and everything
  in the Stage 2 Should and Nice lists.

## Gate

Risha confirms: the platform decision (web primary, SwiftUI
companion, Android later), the build order above, and the owner
steps that are hers (deploy word, Supabase account, Stripe
readiness, Apple Developer enrollment when iOS ships).
