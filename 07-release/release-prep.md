# AlumniUp: Release Preparation (Stage 7)

Status: APPROVED by Risha, October 19, 2026, including the photo
rule, the trail retention stance, and the refund policy.
Process: Risha's App Building Playbook, Stage 7.
Copy is ready to paste; policies are written in plain language an
engineer and a reviewer can both execute.

## Design QA (final pass against Stage 5)

- Every hi-fi screen traces to its approved lo-fi frame, same
  number, same order, same primary action. Verified when the CLI
  regenerated both themes from one data file.
- Component states listed in the Stage 5 spec cover every need
  state in the Stage 3 machine, including DELAYED and CANCELLED.
- Contrast checked (Stage 5 spec). Status is always a word, never
  color alone. Primary tap targets 48pt.
- Known remaining visual debt for the web build, not this pack:
  sub-page nav/footer parity and the founder/footer credit line
  are covered by the Stage 6 theme pass (item 2).

## Store listing copy (iOS; web meta reuses the same lines)

- Name: AlumniUp
- Subtitle: Fund Detroit school needs, publicly tracked
- Promotional text: Your alma mater needs you. Again. Give to a
  verified school need and follow your gift in public, from the
  day you give to the day the school confirms it arrived.
- Description (draft):
  AlumniUp connects Detroit school alumni and corporate sponsors
  with verified funding needs posted by the coaches, teachers, and
  administrators who live them.

  Every need is posted by verified school staff and approved by
  the school before it goes public. Every gift is tracked in the
  open: you can see the total given, the day the goal was reached,
  the day funds were sent, and the day the school confirmed
  receipt. Delays are public too, with the reason stated. No other
  giving platform shows you the whole trail.

  Donations are tax-deductible through Childs Play Foundation,
  Inc., a 501(c)(3) fiscal sponsor (EIN 86-2707543), and your
  receipt arrives by email instantly.

  Browse needs with no account. Give in under a minute. Watch the
  Wall of Honor to see which class year gives the most, then come
  back and see your gift marked Received.
- Keywords: school fundraising, alumni giving, detroit schools,
  donate classroom, coach fundraiser, teacher needs, education
  charity
- Support URL: https://alumniup.org (support page at launch)
- Category: Education (primary), Lifestyle (secondary)

## App Review notes (draft, for the iOS submission)

- What the app does and who it serves, in two sentences.
- Donations: the app does not collect donations in-app. The Donate
  action opens the fiscal sponsor's web checkout (Stripe hosted)
  in the browser, where the gift is made to Childs Play
  Foundation, Inc. (501(c)(3), EIN 86-2707543). This follows
  Apple's charitable giving rules for apps that are not themselves
  approved nonprofits. Receipts are issued by email by the sponsor.
- Demo account: a reviewer account (email + magic link path) with
  sample donor history, plus a school portal demo login, will be
  provided in the submission fields. Reviewers can browse and open
  the donation sheet without any account.
- No in-app purchases exist. Nothing is sold.

## Privacy policy (plain-language draft for the site and store)

What AlumniUp collects:
- Donors: name (optional), email (for the receipt), class year
  (optional), gift amounts and the needs they funded, Wall of
  Honor message (optional, public if provided). Anonymous giving
  hides the name everywhere public.
- School staff: name, role, school, work email, needs they post
  (title, story, goal, photos), receipt confirmations.
- Sponsors: company, contact name, email, tier of interest.
- Technical: standard server logs; no advertising trackers, no
  data brokers, nothing sold. Ever.

What AlumniUp never collects:
- Card numbers. Stripe processes payments; AlumniUp stores no
  payment credentials.
- Student data. AlumniUp serves schools, not students. No student
  names, records, grades, or accounts exist in the system.

Photos rule (important, and stated publicly): photos are posted
by verified school staff, who attest when posting that their
school has the media releases required for everyone pictured.
AlumniUp removes any photo on request from the school or a
parent or guardian, promptly, at privacy@alumniup.org.

Sharing: the fiscal sponsor receives what it needs to issue
receipts and disburse funds. Processors: Supabase (database),
Stripe (payments), Resend (email), Vercel (hosting). No other
sharing except where the law requires it.

Retention and deletion: gift records are kept while the public
trail exists (the trail is the accountability record; removing a
gift's record would falsify it). Accounts can be deleted in the
portal or by emailing privacy@alumniup.org; deletion removes the
account and personal details, while completed gift amounts remain
in need totals unattributed. Requests are completed within 30
days and confirmed by email.

## Data inventory (one row per kind, for the privacy label)

- Contact info (email, name): App Functionality, linked to user,
  not used for tracking.
- Financial info (gift amounts, history): App Functionality,
  linked to user, not used for tracking. Payment credentials: not
  collected (Stripe).
- User content (photos, need stories, honor messages): App
  Functionality; honor messages public by the donor's choice.
- Identifiers (account ID): App Functionality.
- Diagnostics (server logs): App Functionality, not linked for
  advertising. No data used for tracking. No data sold.

## Refund, delay, and redirect policy (public; the Stage 3 promise)

- Cancelled need (before disbursement): every donor chooses, by
  email and in My Donations, a full refund OR redirecting the gift
  to another open need at the same school. No response in 30 days
  means a refund. Refunds are executed by the fiscal sponsor to
  the original payment method, typically within 7 business days
  of the choice.
- Funded but delayed: the need shows DELAYED publicly with the
  reason and the date it was marked. The operator updates the
  reason at least every 14 days until it moves. Donors are emailed
  when a need they funded is marked DELAYED.
- Partial funding at close: the poster and administrator choose,
  once: extend the deadline, disburse the partial amount if it
  meets the need's stated minimum to begin, or cancel under the
  rule above. The choice and its date appear on the public trail.
- After disbursement: gifts cannot be refunded, because the funds
  are with the school; the receipt confirmation and the outcome
  post are the donor's record.
- Monthly gifts: pause or cancel anytime in My Donations, no
  email or phone call required. Cancellation stops future charges;
  past gifts follow the rules above.

## Account, data removal, and service wind-down

- Account deletion: in-portal button plus the email path above.
- School offboarding: a school can be closed by its administrator;
  its Received history remains public (accountability), its staff
  accounts are deactivated.
- If AlumniUp ever winds down: 90 days public notice, all
  undisbrused funds refunded under the policy above, the public
  trails exported to the fiscal sponsor and the schools, and the
  domain kept resolving to the final report for at least one year.

## Launch checklist (release day order)

1. Deploy word given; build fix committed (held since Oct 19).
2. Supabase live, schema applied, magic-link auth tested.
3. Stripe test mode end-to-end pass, then live mode with the
   fiscal sponsor confirmed ready.
4. Resend domain verified (SPF and DKIM on alumniup.org) so
   receipts land in inboxes, not spam.
5. Privacy policy, terms, and the refund policy published on the
   site and linked in the footer and the donate sheet.
6. Real school photos swapped in for the stand-ins; photo
   attestation wired into S11.
7. First 7 founding schools registered and verified by hand.
8. Test donation by Risha and one friendly donor, watched through
   every public state to RECEIVED.
9. Support inbox live (support@alumniup.org) and monitored.
10. iOS: submit after the web launch proves the trail; Developer
    enrollment, demo accounts, and the review notes above.

## Gate

Risha approves the release pack: listing copy, privacy posture
(especially the photo rule and trail retention), and the refund
policy. After this gate, Stage 8 (maintenance) is summarized and
the portfolio case study is assembled.

## Addendum (October 19, 2026): proof-of-use policy (public) and participation agreement clauses

Public policy: after a school confirms receipt, it has 30 days to
file proof of use: purchase invoices or receipts, a completion
photo, and the final amount spent. The school's administrator
attests the funds were spent as stated, and the fiscal sponsor
verifies the packet before the need is marked USE VERIFIED on its
public trail. If proof is late, the need shows PROOF OVERDUE and
the school cannot post new needs or receive new funds until it is
filed. Amounts spent below the amount disbursed are returned or,
with the sponsor's written approval, redirected to another need at
the same school, and the trail records which.

Participation agreement, key clauses (signed at registration,
before any money moves): restricted use of funds to the stated
need; proof of use within 30 days of receipt; return or approved
redirection of unspent funds; the school accepts tranche or
direct-vendor payment structures on needs above the sponsor's
threshold; overdue proof suspends new needs and disbursements.
