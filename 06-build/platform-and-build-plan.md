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

1. Commit the build fix and deploy the preview to Vercel.
   About 30 minutes. GATE: Risha says deploy (held since Oct 19).
2. Apply the Heritage Premium hi-fi to the web app (theme pass:
   tokens, type, photo-first cards, nav, footer, modal states from
   the Stage 5 spec). 1 to 2 sessions. This also fixes every audit
   finding (missing nav and footer on sub-pages, the crushed
   "minimum to begin" strip, the disabled-looking Donate button,
   the zero-count hero stat, missing photos).
3. Connect live data: create the Supabase project, apply the
   schema, wire auth (magic link), flip the data source toggle.
   Half a session. GATE: Risha's Supabase account (free tier).
4. Real payments: Stripe checkout session for real, the missing
   webhook route, receipts through Resend naming Childs Play
   Foundation, Inc. and EIN 86-2707543. Half a session plus test
   donations. GATE: Stripe account in test mode first; live mode
   needs the fiscal sponsor's Stripe readiness confirmed.
5. The public money trail: the Stage 3 state machine in the
   database (status, dated trail entries), on the need page, in My
   Donations, and in the portal; admin approval queue (S12);
   disbursement recording (S14); receipt confirmation (S10/S13).
   This is the Stage 2 must-have work the mock build skipped.
   1 to 2 sessions.
6. End-to-end test with test money: register a school, verify,
   post, approve, donate, disburse (recorded), confirm receipt,
   watch every public state change. Half a session.
7. iOS: first Xcode build fix pass (from Risha's error list), then
   point the app at the live API in a later pass; TestFlight after
   Developer enrollment. GATE: enrollment is Risha's.

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
