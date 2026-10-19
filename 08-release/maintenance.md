# AlumniUp: Maintenance and Operations (Stage 8)

Status: APPROVED as part of the Stage 7 gate, October 19, 2026.
Process: Risha's App Building Playbook, Stage 8.
After ship, the process loops: real use feeds Stage 0 again.

## The weekly ritual: money trail audit (30 minutes, operator)

Every week, one pass over the trail, because the trail is the brand:

- Every FUNDED need has a disbursement recorded or a DELAYED
  reason. Nothing sits in silence.
- Every SENT need older than 14 days gets a nudge to the school;
  older than 30 days gets a phone call and a public DELAYED reason
  if it is still unconfirmed.
- Totals on the public pages match the database exactly (spot check
  three needs). Any mismatch is fixed the same day and, if it was
  ever public, corrected in the open.

## Metrics that matter (reviewed monthly)

- Needs posted, approval rate, and median time in review.
- Funded rate and median days from LIVE to FUNDED.
- Median days from FUNDED to RECEIVED. This is the trust metric;
  it goes in sponsor summaries exactly as measured.
- DELAYED count and average delay length.
- Donor repeat rate and class year leaderboard movement.
- Sponsor inquiries and conversions.

## Quarterly

- Sponsor impact summaries sent (the Stage 2 story, kept).
- Privacy and policy review: photo rule compliance, deletion
  requests completed, processor list still accurate.
- Fiscal sponsor reconciliation: every disbursement on AlumniUp
  matches the sponsor's records. Discrepancies are resolved before
  any new disbursement.

## Updates and technical care

- Dependencies reviewed monthly; framework and OS majors planned
  as small projects, never surprise upgrades near a campaign.
- Backups: Supabase point-in-time recovery on; a monthly export of
  the public trails kept with the fiscal sponsor.
- Uptime and webhook health: Stripe webhook failures alert the
  operator the same day; a failed webhook means receipts pause,
  never totals (totals come from confirmed payments only).

## What breaks first, and the runbook line for each

- A school goes quiet after funds are sent: nudge at 14 days,
  call at 30, DELAYED with reason after that. The trail handles
  the donor conversation; the operator handles the school.
- Receipt emails land in spam: check SPF and DKIM first (Stage 7
  checklist item 4), then Resend status; receipts also live in My
  Donations by design.
- A need goes viral beyond its school: donations keep flowing to
  the same trail; overflow follows the poster's setting (default
  closed at goal). No silent cap changes.
- A photo complaint arrives: photo down first, questions second,
  per the privacy rule. Log it.

## Change rule

Any change that alters the money trail, the fee model, the
verification standard, or the public states re-enters the process
at Stage 0 for a fresh gate. Features from the Stage 2 Should and
Nice lists enter at Stage 2. Small fixes ship directly. The gates
are what make the portfolio, and the product, believable.
