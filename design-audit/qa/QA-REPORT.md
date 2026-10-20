# AlumniUp QA Report — October 19, 2026

Tester pass run by Muse against a production build of main (commit f92cb9e), with a smoke pass against the live site at alumni-up.vercel.app. Method: automated browser suite (Playwright) covering routes, console errors, link crawl, interactions, form submissions, mobile viewports, and direct API calls. Evidence screenshots in design-audit/qa/.

## Result

50 checks. **0 confirmed code defects.** Two automated checks initially flagged failures; both were investigated and cleared as test-expectation errors (the app behaved as designed):

1. `/admin` returns a 307 redirect. By design: it routes to the admin pending queue (`/admin/pending`, 200).
2. Homepage shows 3 Contribute buttons, not 5. By design: the sample data holds 5 needs, but the Girls Basketball and Physics Lab needs are in "pending" status, and needs are never public before approval (Stage 3 flow rule). The 3 public needs are the active King High needs.

## Coverage and results

- **Routes (9):** /, /for-schools, /corporate-giving, /press, /wall-of-honor, /login, /submit-need, /portal all 200 with correct page titles; /admin redirects by design. Live site returns identical statuses, and an unknown URL returns a proper 404 on both.
- **Console:** zero console or page errors on every public route.
- **Links:** every internal link and anchor in the header and footer resolves (200). No dead links.
- **Needs feed:** search filter works; a no-match search shows the empty state; category filter (Arts) narrows to exactly the 1 Arts need.
- **Donation modal:** opens from Contribute; guidance hint shows until input is valid; an invalid email keeps Donate disabled; presets update the button amount ($25); a custom amount updates it too ($37); the monthly toggle works; a mock donation completes to the thank-you state and the need's raised total and donor count increment ($3,200 → $3,237, 12 → 13 donors); backdrop click closes the modal.
- **Share modal:** opens with the need headline and message, Copy link, and X / Facebook / LinkedIn actions.
- **Submit a Need:** school dropdown lists the 4 registered schools plus the new "Register it first" link for unlisted schools; a fully completed form submits to a success state (mock).
- **School registration:** form submits successfully (API 200, mock mode) with an on-page confirmation.
- **Login:** loads cleanly; a sign-in attempt fails gracefully with the message "Sign-in is not configured yet. Supabase credentials are required." No crash, no console errors.
- **Corporate Giving:** sponsor tiers present ($250 / $1,000 / $2,500) and the inquiry form is on the page.
- **Wall of Honor:** entries render with class years; the leaderboard is present.
- **Mobile (390px):** no horizontal overflow on home, Submit a Need, or For Schools.
- **APIs:** POST /api/donations returns 501 while Stripe is unconfigured (expected; that is the Stage 6 live-wiring gate).

## Observations (not defects)

1. **Low:** GET /api/needs returns HTTP 500 with "Supabase not configured." The UI never calls it in mock mode, but a public endpoint answering 500 looks broken to an integrator. Recommend a graceful mock or 503 response when live wiring lands.
2. **Low:** The login error message names Supabase. Honest pre-launch behavior; resolves when real auth is wired (Stage 6 build order step 3).
3. **Info:** Demo data story: only one school (King High) has public needs, which makes the homepage's multi-school picture thin next to the "4 Schools Live" stat. Real registrations fix this; more diverse sample needs would help investor demos.

## Not tested (blocked by design, Stage 6 build order)

Real Stripe payments and webhooks, receipt emails, the live Supabase data path, the public money trail states, and authenticated portal/admin workflows. These become testable when build order steps 3 to 6 land.
