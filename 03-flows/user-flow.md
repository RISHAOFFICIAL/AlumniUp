# AlumniUp: User Flows (Stage 3)

Status: APPROVED by Risha, October 19, 2026, including the money
trail state machine and the exception rules.
Process: Risha's App Building Playbook, Stage 3.
Screen-by-screen paths for every Must Have story from Stage 2,
including the states flows usually forget. Screens are numbered
(S1, S2...) so Stage 4 lo-fi wireframes and Stage 5 hi-fi screens
use the same names.

## Screen inventory

- S1 Home (hero, featured need, open needs, leaderboard, trust)
- S2 School page (one school: needs, totals, Received count)
- S3 Need detail (story, money trail status, donate entry)
- S4 Donate sheet (amount, frequency, details, anonymity, class year)
- S5 Checkout (Stripe hosted payment)
- S6 Donation confirmation (in-app) + receipt email
- S7 My Donations (donor history with per-gift status)
- S8 Wall of Honor (supporters, class year leaderboard)
- S9 Register School form
- S10 School Portal (poster home: my needs, totals, verification state)
- S11 Submit a Need (photo, title, goal, story)
- S12 Admin Review Queue (principal approves or rejects needs)
- S13 School Money View (administrator audit screen, printable)
- S14 Operator Admin (staff verification, disbursement recording,
  sponsor inquiries)
- S15 Corporate Giving (tiers + inquiry form)
- S16 Sign In / Create Account

## The money trail: one state machine behind every flow

Every need moves through these public states. This is the Stage 0
transparency rule made mechanical. The public sees the total given
and the state; the internal fee split is never part of this trail.

1. DRAFT: poster is writing it. Not public.
2. IN REVIEW: waiting for the school administrator. Not public.
3. LIVE: public, accepting donations. Shows total given and goal.
4. FUNDED: goal reached (date shown). May keep accepting overflow
   only if the poster set that at submission; default is closed.
5. SENT: operator has recorded the disbursement through the fiscal
   sponsor (date shown). Public wording: "Sent to school, awaiting
   confirmation."
6. RECEIVED: the school confirmed receipt (date shown). The trail
   is complete and stays public permanently.
7. OUTCOME (optional, should have): poster adds a photo and note.
   Shown on the same page donors funded.

Exception states, all public, all with plain-language reasons:

- DELAYED: disbursement or receipt is late. Reason shown ("school
  office closed for break", "awaiting sponsor paperwork"). The
  Stage 0 rule: delays are public, not hidden.
- CANCELLED: a need is withdrawn before funding completes. Donors
  choose refund or redirecting their gift to another need at the
  same school. No silent cancellations.
- UNFUNDED AT CLOSE: a need ends below goal at its deadline. The
  poster and administrator choose together: extend once, disburse
  the partial amount if it can begin the work (the "minimum to
  begin" from submission), or cancel under the rule above.

## Flow A: donor gives (Denise, stories 1 to 7)

1. Lands on S1 (from a classmate's shared link, search, or typing
   the address). No login wall anywhere in this flow.
2. Browses needs on S1 or opens a school on S2. Every card already
   shows total given, goal, and status, so trust starts before the
   click.
3. Opens S3 Need detail: photo, story, poster name and role,
   money trail (total given, funded date if reached, Received
   state). Taps Donate.
4. S4 Donate sheet: picks an amount or enters a custom one, one-time
   or monthly, optional name, email for the receipt, class year,
   anonymous toggle, optional Wall of Honor message. The sheet
   shows the total she is giving, in one number, before she pays.
5. S5 Checkout (Stripe hosted): card entry. AlumniUp never sees or
   stores card numbers.
6. Success: S6 confirmation shows the gift, the need's new total,
   and "your tax receipt is on its way." Receipt email (fiscal
   sponsor name, EIN, amount, date) arrives within minutes. Her
   gift appears on S8 if not anonymous, and her class year total
   moves on the leaderboard.
7. Later: S7 My Donations (magic link or account sign-in) shows
   each gift's status. When the school confirms receipt, her gift
   flips to Received and she gets one email saying so. That email
   is the payoff moment of the whole product.
8. Share: from S3 or S6, the share action produces a link with the
   need's photo and title as the preview.

Failure and edge states in Flow A:

- Payment declined at S5: clear message, no charge, the amount and
  details she entered are preserved so retrying is one tap. The
  public total never counts an unpaid gift, not even briefly.
- Closes the sheet mid-donation: nothing is saved, nothing is
  charged, no guilt-trip copy. The need is one tap away when she
  returns.
- Double tap on Donate: the checkout is idempotent; she can never
  be charged twice for one tap sequence.
- Receipt email delayed: S6 and S7 both show the receipt details
  in-app, so the email is a copy, not the only record.
- Signed out and opens S7: gentle sign-in prompt (S16) with magic
  link; her gifts are matched by email, so she loses nothing.

## Flow B: coach posts a need (Darnell, stories 8 to 11)

1. S9 Register School: one form (school, his name, role, work
   email). Account created (S16), verification state PENDING,
   shown honestly on S10 from the first minute.
2. Operator verifies him in S14 (work email domain plus a school
   confirmation step, logged). If verification fails, he gets a
   plain reason and a path to fix it, never silence.
3. S11 Submit a Need: photo from his phone (camera or library),
   title, category, goal, the optional "minimum to begin" amount,
   story. Autosaves as DRAFT on his phone connection, because
   school Wi-Fi drops. Submitting moves it to IN REVIEW.
4. His principal sees it in S12 (Flow C). Until approval, S10 shows
   "in review" and the need is invisible to the public.
5. On approval the need goes LIVE; he gets an email with the public
   link and a share prompt.
6. While LIVE, S10 shows the same totals the public sees.
7. When funds are disbursed, the operator records it (Flow D) and
   the need shows SENT. Darnell gets a prompt in S10 and by email:
   "Confirm receipt." One tap, with the date, moves it to RECEIVED
   everywhere, and donors get their payoff email (Flow A step 7).
8. Optional (should have): he posts the outcome photo and thank-you
   note from S10, which appears on S3.

Failure and edge states in Flow B:

- Photo upload fails on weak Wi-Fi: the need saves as DRAFT with a
  "photo needed" flag; he can retry from the portal. A need cannot
  go LIVE without a photo (photo-first is a trust rule).
- Rejected by his principal: reason shown in S10, need stays DRAFT
  and editable, nothing public ever appeared.
- He leaves the school mid-need: the administrator can reassign
  the need to another verified staff member in S13; the trail and
  totals do not change.

## Flow C: administrator approves and audits (Dr. Foster, stories 12, 13)

1. Signs in (S16) and lands on S12 Review Queue: her school's
   needs awaiting review, each with poster, goal, photo, story.
2. Approve: need goes LIVE immediately, poster notified.
   Reject: reason required (short list plus free text), poster
   notified, need returns to DRAFT. No public trace.
3. S13 School Money View: every need for her school with total
   given, funded date, disbursement date, receipt date, and who
   confirmed. Printable for district records.
4. She can also confirm receipt at school level if the poster is
   unavailable, and the record shows it was her, not the poster.

## Flow D: operator runs the platform (Risha, stories 14, 15, 16)

1. S14 Verification queue: new staff registrations with their
   school and role; approve or request more information; every
   decision logged with date and operator.
2. S14 Disbursements: funded needs awaiting disbursement. Recording
   a disbursement (date, method reference) moves the need to SENT
   and notifies the poster to watch for the funds. AlumniUp records
   the event; the fiscal sponsor moves the actual money.
3. S14 Sponsor inquiries: new S15 inquiries land here with company
   and tier; acknowledged to the sponsor by email automatically.
4. Safety valve: the operator can place a DELAYED status with a
   public reason on any need whose money trail stalls. The trail
   may be late; it may never be silent.

## Flow E: corporate sponsor (James, story 16)

1. S15 Corporate Giving: tiers with exactly what recognition each
   includes, written so he can forward the page to his CFO.
2. Inquiry form: company, contact, tier, message. Immediate email
   acknowledgment; operator follows up personally (v1 is human
   here on purpose).
3. Once confirmed, his recognition appears where the tier promises
   (homepage or school pages, Wall of Honor) and only there.
4. Quarterly (should have): the operator sends the one-page impact
   summary: his totals in, needs completed, Received count. His
   numbers always tie back to the public trail he can check himself.

## Cross-flow rules

- Status words are the same everywhere: LIVE, FUNDED, SENT,
  RECEIVED, DELAYED, CANCELLED. Same word, same meaning, on the
  card, the detail page, the portal, the admin views, and the
  donor's history. Icons and color support the word, never replace
  it (accessibility).
- Totals are computed from completed payments only, in one place
  in the code, so the card, the detail page, the portal, and the
  leaderboard can never disagree.
- Every status change writes a dated entry to the need's public
  trail. The trail is the audit log; there is no separate hidden
  history.
- Empty states are designed, not accidental: a school with no live
  needs says so proudly and shows its Received history; a new
  donor's S7 explains what will appear there; an empty review
  queue is a good day and says so.
- Offline and slow connections (school Wi-Fi, stadium lots):
  browsing needs works from cache on the web where possible,
  forms autosave, and nothing time-critical depends on a perfect
  connection except the payment itself, which Stripe handles.

## Platform notes

- Web is the primary platform for v1 (no install for donors,
  works for every persona's devices).
- iOS app mirrors Flows A and B first (donor and poster). If social
  sign-in is ever offered on iOS, Sign in with Apple is offered
  alongside it, per Apple's rule. The current SwiftUI preview
  follows these same flows with sample data.

## Gate

Risha approves the flows, including the money trail state machine
and the exception rules, before Stage 4 draws them as lo-fi
wireframes.

## Addendum (October 19, 2026): verification of use

The money trail state machine gains three states after RECEIVED:
AWAITING PROOF (evidence due within 30 days), PROOF OVERDUE (public,
shown from day 31 until filed; the school is flagged, no new needs
or disbursements), and USE VERIFIED (the final state, sponsor
checked). Flow F, proof of use: poster uploads invoices and a
completion photo plus final amount spent; the administrator
countersigns in S13; the sponsor reviews in S14 (proof queue) and
verifies or requests specific missing items; the public trail shows
the summary and completion photo, while the documents stay
sponsor-side. Flow D gains two disbursement branches above the
sponsor's threshold: tranches (balance released when first-tranche
proof verifies) and direct vendor payment (the sponsor pays the
vendor; the school never holds the funds). Full mechanism:
09-addendum-verification/verification-of-use.md.
