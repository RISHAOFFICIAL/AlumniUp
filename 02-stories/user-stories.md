# AlumniUp: User Stories (Stage 2)

Status: APPROVED by Risha, October 19, 2026. The Must Have list
below is the frozen v1 scope.
Process: Risha's App Building Playbook, Stage 2.
Written from the Stage 1 personas. The Must Have list IS the
version 1 scope: a new must have after approval requires removing
or delaying something else, or accepting a later release date.

Flags: [PAYMENT] touches money, [ACCOUNT] needs a signed-in
account, [PHOTO] uses the camera or uploads, [DATA] handles
personal data. Flags drive the privacy work in Stage 7.

## Must have: v1 fails without these

### The donor (Denise)

1. As an alumni donor, I want to browse verified needs by school
   without creating an account, so that nothing stands between me
   and deciding to help.
   Acceptance: a first-time visitor reaches any public need in two
   taps from the home page and is never asked to log in to look.

2. As an alumni donor, I want every need to publicly show its total
   given, its goal, when it funded, and whether the school has
   confirmed receipt, so that I can see if money makes it to the
   school. (The transparency rule from Stage 0.)
   Acceptance: each need page shows total given, goal, funded date
   when reached, and either a Received confirmation with its date
   or an honest "awaiting receipt" status. No need ever shows a
   blank or unknown money state.

3. As an alumni donor, I want to donate a chosen amount, one-time
   or monthly, with my class year attached, so that my gift counts
   for me and for my class. [PAYMENT] [DATA]
   Acceptance: a test donation completes checkout, the amount
   appears in the need's public total, and my class year total on
   the leaderboard moves by the same amount.

4. As an alumni donor, I want to give anonymously if I choose, so
   that generosity never requires publicity.
   Acceptance: an anonymous gift shows as "Anonymous" everywhere
   public, while I still receive my receipt.

5. As an alumni donor, I want an instant tax receipt by email
   naming the fiscal sponsor, so that my gift is documented for
   taxes without me asking. [DATA]
   Acceptance: the receipt email arrives within minutes of the
   donation and includes sponsor name, EIN, amount, and date.

6. As an alumni donor, I want a private history of my gifts with
   each gift's delivery status, so that I can follow my own money
   to the school. [ACCOUNT] [DATA]
   Acceptance: my history lists each gift with its current status;
   when the school confirms receipt, the status changes there and I
   am notified by email.

7. As an alumni donor, I want to share a need with a link, so that
   my classmates hear about it from me.
   Acceptance: sharing produces a link that opens the need with a
   proper title and photo preview in messages and social posts.

### The coach (Darnell)

8. As a coach, I want to register my school and request staff
   verification once, so that I can post needs under my school's
   name. [ACCOUNT] [DATA]
   Acceptance: registration is one form; my portal always shows my
   verification state (pending, verified, or needs information).

9. As a coach, I want to post a need with a photo from my phone, a
   title, a goal amount, and a short story in one sitting, so that
   asking for help takes minutes, not evenings. [PHOTO] [ACCOUNT]
   Acceptance: a need can be created start to finish on a phone in
   under 15 minutes and lands in my administrator's review queue,
   never directly in public.

10. As a coach, I want to see my needs' totals and donors in my
    school portal, so that I know where things stand without
    asking anyone.
    Acceptance: portal totals match the public totals for the same
    need at any moment.

11. As a coach, I want to confirm receipt when funds arrive, in one
    action, so that the public record completes itself.
    Acceptance: confirming receipt flips the need's public status
    to Received with the date, the same day.

### The administrator (Dr. Foster)

12. As an administrator, I want to approve or reject my school's
    needs before they go public, so that nothing fundraising in
    my school's name surprises me. [ACCOUNT]
    Acceptance: an unapproved need is invisible to the public;
    rejecting requires a reason, which the poster sees.

13. As an administrator, I want a school view of every need, total
    given, disbursement, and receipt for my school, so that I can
    answer a district audit from one screen. [ACCOUNT]
    Acceptance: the school view lists all needs with totals and
    both dates (disbursed, received) and can be printed.

### The platform operator (Risha / AlumniUp admin)

14. As the operator, I want to verify staff identity and school
    affiliation before an account can post, so that "verified"
    means something. [ACCOUNT] [DATA]
    Acceptance: an unverified account cannot publish a need or
    confirm a receipt; every verification decision is logged.

15. As the operator, I want to record each disbursement (to the
    school, through the fiscal sponsor, with its date), so that
    the public status can advance honestly.
    Acceptance: recording a disbursement moves the need's status
    to "sent, awaiting school confirmation" everywhere it appears;
    only the school's confirmation moves it to Received.

### The corporate sponsor (James)

16. As a corporate sponsor, I want to choose a sponsorship tier
    and submit an inquiry with my company details, so that giving
    at scale starts with one clear step. [DATA]
    Acceptance: an inquiry is acknowledged by email immediately and
    reaches the operator the same day.

## Should have: v1 is weaker without these

17. Wall of Honor with donor messages and the class year
    leaderboard, updating from live totals.
18. Donor email when a need they funded is marked Received.
19. Poster outcome updates: after receipt, the poster can add a
    photo and a thank-you note ("the field is fixed") to the need,
    shown publicly on the same page donors funded. [PHOTO]
20. School profile pages: each school's needs, totals, and
    Received count in one place.
21. Search and filters for needs (by school, category, status,
    including a "funded, awaiting receipt" filter that shows the
    transparency trail working).
22. Monthly donors can pause or cancel from their history.
    [ACCOUNT] [PAYMENT]
23. Sponsor impact summary: a one-page printable record of a
    sponsor's totals and the needs they helped complete.

## Nice to have: later, on purpose

- Alumni class pages and reunion campaigns (Class of '98 vs '94
  giving weeks).
- Employer matching gift lookup at checkout.
- Native app live data and push notifications ("your need was
  marked Received").
- Sponsor self-serve dashboard (v1 is inquiry plus manual setup).
- Schools outside Detroit, once the Detroit model is proven.

## Scope guard

The Must Have list above is v1. The current build already covers
much of it in mock form; the gaps the stages have exposed so far,
and that v1 must close for real, are: live payments (Stripe),
the full public money trail (stories 2, 6, 11, 15), the admin
approval queue (story 12), and disbursement recording (story 15).

## Gate

Risha approves the stories and the Must Have list before Stage 3
turns them into screen-by-screen flows.
