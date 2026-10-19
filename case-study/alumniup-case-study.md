# AlumniUp: A Crowdfunding Platform Where Every Donor Can Watch the Money Arrive

Case study, October 2026. Founder and product lead: Erisha Smith
(HGH Management Group), Detroit, Michigan.
Status line, stated honestly: process complete through release
preparation; launch pending the founder's deploy decision and the
live-services wiring listed in Stage 6.

## The one sentence

AlumniUp connects Detroit school alumni and corporate sponsors
with verified funding needs posted by the coaches, teachers, and
administrators who live them, and it publicly tracks every gift
from the day it is given to the day the school confirms it arrived.

## The problem

School needs in Detroit are real, specific, and mostly funded out
of teachers' own pockets or not at all. The tools that exist ask
donors to trust a black box: a generic campaign page, a percentage
skimmed somewhere, and no proof the money ever reached a classroom
or a field. Meanwhile the strongest fundraising asset a school has,
its alumni, is scattered across decades and cities with no home
base and no reason to believe.

## The founding decision: radical transparency

Early in Stage 0 the founder set the product's constitution, in her
own words: "I want the app to be very transparent. We can all see if
money makes it to the school or not." Clarified the same day: the
public tracks the total amount given and whether the school received
it; the internal fee split between the fiscal sponsor (Childs Play
Foundation, Inc., a 501(c)(3), EIN 86-2707543) and the app is
internal. That one decision generated the product:

- A public money trail on every need: LIVE, FUNDED, SENT, RECEIVED,
  each with dates.
- Exception states that are also public: DELAYED with a plain
  reason, CANCELLED with a donor choice of refund or redirect.
- A written rule that runs through every stage document: the trail
  may be late; it may never be silent.
- And, added the same day at the fiscal sponsor's challenge:
  receipt proves delivery, but only proof of use, countersigned by
  the school and verified by the sponsor, proves the spend. The
  trail's final state is USE VERIFIED (09-addendum-verification/).

## The process (Stages 0 to 8, each gated by the founder)

The product was built using the founder's own design-first playbook:
every stage produced a document, every document passed a founder
approval gate before the next stage began. (An earlier fast build
existed; this run re-founded the product properly and converted the
fast build into exhibits, which is why the repo shows both.)

- Stage 0, Idea and Validation (00-idea/): the problem, the weak
  workarounds it replaces, evidence labeled fact, report, or
  assumption, the v1 scope (7 founding schools, human verification,
  fiscal-sponsor donations), the revenue model (7% platform fee,
  school subscriptions, sponsor tiers), and kill criteria written
  before they could be needed.
- Stage 1, Personas (01-persona/): Denise Carter, a diaspora alumna
  who gives $25 to $100 and trusts nothing she cannot track; Coach
  Darnell Williams, who has 15 minutes and a phone; Dr. Angela
  Foster, the principal whose approval and audit trail protect the
  school; James Okafor, a CSR manager who must show his CFO proof.
  Four personas, four design laws: nobody trusts what they cannot
  track; nobody has time; pride, not pity; the phone is the
  storefront.
- Stage 2, User Stories (02-stories/): 16 Must Have stories frozen
  as the v1 scope, including the four gaps the fast build had
  skipped: live payments, the full public money trail, the admin
  approval queue, and disbursement recording.
- Stage 3, User Flows (03-flows/): five persona flows across 16
  named screens, the money trail as a formal state machine, and the
  forgotten states designed rather than discovered (declined cards,
  double taps, dead school Wi-Fi, delayed receipts).
- Stage 4, Lo-fi (04-lofi/): grayscale wireframes for all 16
  screens, layout and tap targets only.
- Stage 5, Hi-fi (05-hifi/): the Heritage Premium direction,
  a university advancement frame (navy, gold, serif) with
  photo-first need cards and the rivalry energy reserved for the
  class leaderboard. Tokens, contrast checks, and component states
  specified. One color, green, is reserved for RECEIVED alone.
- Stage 6, Platform (06-build/): web primary, native SwiftUI for
  iOS, Android later, one backend. The scorecard names the real
  constraint early: Apple's charitable giving rules mean the iOS
  Donate action opens the fiscal sponsor's web checkout until an
  approved in-app route exists. Remaining build work is listed in
  priority order with estimates.
- Stage 7, Release Prep (07-release/): store copy, App Review
  notes that explain the donation route up front, a plain-language
  privacy policy with a strict photo rule for schools, a data
  inventory, and the public refund, delay, and redirect policy the
  transparency promise requires.
- Stage 8, Maintenance (08-release/): a weekly money trail audit,
  monthly trust metrics (median days from FUNDED to RECEIVED is the
  headline number), quarterly sponsor reconciliation, and a change
  rule that sends anything touching the trail back to Stage 0.

## The tooling story

Design artifacts for both fidelities are generated by a small CLI
the project built for itself (workspace/tools/wireframes): one data
file describes the 16 screens, and the tool renders lo-fi and hi-fi
SVGs, PNG previews, and a Figma plugin that draws all 16 screens as
native editable frames inside the founder's Figma file. One source
of truth, three outputs, no drift; the approved lo-fi files are
byte-for-byte stable across the hi-fi work, which the tool's
regression check proves. The process is the portfolio: gated
documents, reproducible design artifacts, honest status lines.

## Exhibits already built

- The web app (feature-complete on sample data), a native SwiftUI
  iOS app in Heritage Premium with Liquid Glass, a visual design
  audit of the running app, and hi-fi mockups, all in this
  repository.

## What success looks like

Seven founding schools posting real needs; a funded rate and a
median FUNDED-to-RECEIVED time the founder can say out loud to a
sponsor; alumni giving a second time because the first gift closed
the loop in public. If schools will not post, verification cannot
be kept reliable, or fiscal sponsorship ends without a replacement,
the Stage 0 kill criteria say to stop, and they were written while
stopping was still cheap.
