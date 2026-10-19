# AlumniUp: Verification of Use Addendum

Approved for drafting by Risha, October 19, 2026, in response to a
concern raised by the fiscal sponsor, Childs Play Foundation, Inc.
Process: entered under the Stage 8 change rule (it alters the money
trail), and amends Stages 0, 2, 3, and 7 as listed at the end.

## The gap this closes

The money trail as approved proves a school RECEIVED funds. It does
not prove the school SPENT them on the stated need. Donations are
solicited for a specific, stated purpose, so the sponsor carries a
real obligation to verify use, not just delivery. Received and used
are two different claims, made by two different checks:

- Receipt confirmation: the school says "we got it."
- Use verification: the school proves "we spent it as promised,"
  and the sponsor checks the proof.

## The mechanism

1. Agreement before money. At registration, each school signs a
   participation agreement: funds are restricted to the stated
   need; proof of use is due within 30 days of the receipt
   confirmation; unspent funds are returned, or redirected only
   with the sponsor's written approval; a school with overdue
   proof cannot post new needs and cannot receive new disbursements.

2. A new required step in the trail. After RECEIVED, a need enters
   AWAITING PROOF. The poster uploads:
   - vendor invoices or purchase receipts covering the spend, and
   - a completion photo showing the result (the repaired field,
     the installed lights, the team in the new uniforms), and
   - the final amount spent, if it differs from the amount disbursed.

3. Countersignature. The school administrator reviews the packet
   in the School Money View and attests, by name and date: "these
   funds were spent as stated." The poster gathers; the principal
   signs. Two people, on the record.

4. Sponsor verification, public result. The sponsor (or the
   operator acting for the sponsor) reviews the packet and marks
   the need USE VERIFIED, the final public state of the trail:
   LIVE, FUNDED, SENT, RECEIVED, USE VERIFIED. The public sees the
   summary (vendor, amount spent versus disbursed, completion
   photo, verified date). The underlying documents stay sponsor-side,
   because invoices can carry personal details that do not belong
   on a public page. Transparency about the outcome; discretion
   about the paperwork.

5. Variance rule. Spent less than disbursed: the difference is
   returned to the sponsor or redirected to another need at the
   same school, with the sponsor's written approval, and the trail
   records which happened. Spent more: the school covers the
   difference; AlumniUp never reopens a funded need for a top-up.

6. Structure for large needs (sponsor sets the threshold; $5,000
   is the working default). Above it, the sponsor may choose:
   - Tranches: a first disbursement sufficient to begin, the
     balance released when proof for the first tranche is verified.
   - Direct vendor payment: the sponsor pays the vendor against
     the invoice. The school never holds the money. This is the
     strongest control and the sponsor's call, per need.

7. Enforcement ladder, automatic. Day 14 after receipt: reminder
   to poster and administrator. Day 30: the need shows PROOF
   OVERDUE publicly, and the school is flagged: no new needs, no
   new disbursements, until proof is filed. After that, the
   agreement's return clause is the sponsor's remedy. The system
   does not accuse anyone of anything; it simply stops, in public,
   until the paperwork exists.

8. Sponsor tooling. For every need, the sponsor can export an
   evidence packet (PDF): the trail with dates, the disbursement
   record, the receipt confirmation, the proof documents, the
   administrator's attestation, and the verification decision.
   Quarterly, the Stage 8 reconciliation uses the same packets.

## What donors see change

The need page trail gains two states (AWAITING PROOF, USE VERIFIED,
plus PROOF OVERDUE when late). The donor's payoff becomes two-stage:
the Received email they already get, and later a "Use Verified"
note with the completion photo when the sponsor signs off. That
photo is the strongest retention asset the platform owns: proof,
not a promise.

## Design deltas (wireframes, both themes regenerated)

- S3 Need Detail: trail card gains AWAITING PROOF and USE VERIFIED
  rows; the completion photo joins the page when verified.
- S10 School Portal: a received need shows an Upload Proof of Use
  action with its due date.
- S13 School Money View: each received need carries a proof status
  chip (AWAITING PROOF with days left, PROOF OVERDUE, USE VERIFIED).
- S14 Operator Admin: a proof review queue joins verification and
  disbursements (approve proof, or request specific missing items).

## Amendments to the approved stage documents

- Stage 0 (00-idea/): a new named risk and requirement, sponsor
  verification of use, with the participation agreement as the
  control that exists before money moves.
- Stage 2 (02-stories/): four new Must Have stories (see the
  addendum section in that file).
- Stage 3 (03-flows/): the state machine gains AWAITING PROOF,
  PROOF OVERDUE, and USE VERIFIED, and a new Flow F (proof of use)
  is added; disbursement gains the tranche and direct-vendor
  branches.
- Stage 7 (07-release/): a public proof-of-use policy section and
  the participation agreement's key clauses.
- Case study: the founding decision section and the Stage 3 and
  Stage 7 summaries updated to include verification of use.
