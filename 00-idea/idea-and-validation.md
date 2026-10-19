# AlumniUp: Idea and Validation (Stage 0)

Status: APPROVED by Risha, October 19, 2026 (including the radical
transparency principle and her clarification that public tracking
covers totals and delivery, not the internal fee split).
Process: Risha's App Building Playbook, Stage 0.
Purpose beyond the app itself: this file is also Exhibit 1 of the
AlumniUp portfolio case study, showing investors how the product was
reasoned about before design and code.

## The idea in one sentence

For Detroit public school alumni who want to give back to the schools
that raised them, AlumniUp is a verified giving platform where
coaches, teachers, and administrators post specific funding needs, so
a donation reaches a real, named need at a real school, with a
tax-deductible receipt, instead of disappearing into a general fund
or an unverified fundraiser.

## The problem

Detroit public school programs run on scarcity. Coaches buy equipment
out of their own pockets. Teachers fund classroom supplies
themselves. Programs with real talent (a nationally ranked debate
team, in our sample data and in reality) lose seasons for want of a
stipend. At the same time, thousands of alumni would give to their
own school if they were asked in a way they could trust.

The gap is not generosity. The gap is a trusted, specific,
school-by-school channel between alumni and needs.

## The current workaround, and why it is weak

- Individual GoFundMe pages run by teachers: unverified, no
  consistent tax receipts, no school oversight, and they depend on one
  person's social reach.
- Teachers and coaches paying out of pocket: invisible, unsustainable,
  and the default today (fact, from the founder's lived experience).
- Booster clubs and bake sales: real, but hyper-local, labor heavy,
  and they cannot reach alumni who left Detroit.
- District and foundation grants: slow, competitive, and rarely sized
  for a $4,000 coach stipend or a $5,500 lighting rig.

## Evidence the problem is real

- FACT: The founder, Risha Alexis (Erisha Smith), is a graduate of
  Martin Luther King Jr. Senior High School in Detroit and built
  AlumniUp after seeing coaches fund equipment personally and
  programs struggle to survive. Founder-market fit is direct.
- REPORT: DonorsChoose has validated at national scale that donors
  fund specific, itemized classroom needs when the need is concrete
  and the outcome is reported back. AlumniUp applies that proven
  model to alumni identity and whole-school needs (athletics, arts,
  programs, facilities), which DonorsChoose does not center.
- FACT: Alumni giving is an established behavior. Universities raise
  billions annually from alumni using identity, class years, and
  recognition. No equivalent channel exists for Detroit public high
  schools.
- ASSUMPTION (to validate in Stage 1 research and founding school
  outreach): Detroit alumni who no longer live in Detroit will give
  at higher rates when the ask names their school, their class year,
  and a specific need, rather than a general fund.

## Founding principle: radical transparency (added by Risha, October 19, 2026)

Risha's words: "I want the app to be very transparent. We can all
see if money makes it to the school or not." Clarified the same day:
the public tracking is the total amount given and whether it
reached the school. The internal split between the fiscal sponsor
(nonprofit) and the app does not have to be displayed publicly.

This is a product-defining rule, not a feature. AlumniUp's answer to
the trust problem is a public money trail with a simple promise:
anyone can see how much was given to a need, and whether the school
got it.

- Every need publicly shows: the total amount given, its funding
  progress and goal, the date it funded, and its delivery status.
- Every funded need ends in a public "Received" confirmation from
  the school, with the date. A need that funded but has not been
  received yet says so, visibly. Nothing quietly disappears.
- Donors can follow their own gift from checkout to school receipt
  in their donation history.
- If a disbursement is delayed or a need cannot be fulfilled, that
  status is public too, with the reason and what happens to the
  money (refund or donor-approved redirection, to be specified in
  the disbursement policy at Stage 7).
- What stays backstage: the fee split between the fiscal sponsor
  and the platform. It is real, it is in the business model below
  for investors, and donors are told their gift is tax-deductible
  through the sponsor, but the public ledger tracks totals and
  delivery, not internal percentages.

Design consequence: disbursement states (Raised, Funded, Disbursed,
Received) are first-class data in v1, shown on the need page, the
school page, and the Wall of Honor, not hidden in an admin panel.
The current build shows donation activity in the school portal and
has an admin disbursements view, but the public money trail is not
complete yet. Closing that gap is a named v1 requirement that flows
into the Stage 2 stories and Stage 3 flows.

## The smallest version that proves the idea (v1)

- A small set of founding partner schools (target: first 7) whose
  staff identity and school affiliation are verified by hand.
- Verified needs posted by school staff, each with a photo, a goal,
  and a named poster.
- Donations through a 501(c)(3) fiscal sponsor (Childs Play
  Foundation, Inc., EIN 86-2707543), so every gift is tax-deductible
  from day one without AlumniUp holding charitable funds itself.
- Public accountability: progress bars, a Wall of Honor, class year
  leaderboard, published fee structure (88% to the school, 7%
  platform fee, 5% fiscal sponsorship).
- Deliberately left out of v1: corporate sponsor self-serve
  dashboards, automated disbursements, alumni directory and social
  features, native app live data (native apps ship as design previews
  first), and schools outside Detroit.

## Revenue model

Three streams, all visible in the current product:

1. Platform fee: 7% of each donation (donor-facing and published).
2. School subscriptions: Founding Partner $99/year (free year 1,
   first 7 schools) and Standard $129/year (free year 1).
3. Corporate sponsorship tiers: Bronze $250+, Silver $1,000+,
   Gold $2,500+, sold as tax-deductible sponsorships through the
   fiscal sponsor.

No app store commission applies to web donations (Stripe standard
processing only). If native in-app giving is added later, store
billing rules for charitable donations get rechecked at that time,
per the playbook's recheck rule.

## Cost to first release

- Web hosting and database: free tiers (Vercel, Supabase) at launch
  scale; costs grow only with usage.
- Payments: Stripe, standard per-transaction pricing, no upfront cost.
- Apple Developer Program: $99/year, only when the native iOS app
  moves from preview to TestFlight and release (Stage 7 decision).
- The real cost is founder time: school outreach, verification, and
  donor trust work.

## Kill criteria (written before we build further)

- If, after genuine outreach, founding schools will not post needs,
  the supply side does not exist and we stop.
- If staff verification cannot be done reliably at small scale, the
  trust model fails and we stop rather than launch unverified.
- If the fiscal sponsorship ends and no replacement sponsor is
  secured, donations pause; the platform does not hold funds itself.

## Risks

- Trust and fraud risk: the entire product is trust. Mitigated by
  manual verification, fiscal sponsorship, and published fees.
- Payments and compliance: charitable solicitation rules vary by
  state. Mitigated by operating through the fiscal sponsor and
  keeping AlumniUp's role as platform, not fund holder.
- Third party dependence: Stripe, Supabase, Vercel. All replaceable,
  none holds unique data hostage (schema and data are exportable).
- District policy: school participation must respect Detroit Public
  Schools Community District policies on fundraising and staff roles.
  Flagged for confirmation with the first founding schools.
- Maintenance burden: one founder. v1 scope is deliberately narrow so
  the platform can be run by a very small team.

## Gate

Risha approves, changes, parks, or kills. On approval, Stage 1
(personas) begins.

## Addendum (October 19, 2026): verification of use

Raised by the fiscal sponsor after approval. The trail proves a
school received funds; the sponsor must also verify the funds were
spent on the stated need. This is now a named v1 requirement: a
school participation agreement signed before money moves, proof of
use (invoices plus a completion photo) due within 30 days of
receipt, an administrator countersignature, sponsor verification as
the trail's final public state (USE VERIFIED), and tranche or
direct-vendor payment options for large needs. Full mechanism:
09-addendum-verification/verification-of-use.md.
