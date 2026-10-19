# AlumniUp Hi-fi Spec (Stage 5)

Status: APPROVED by Risha, October 19, 2026.
Process: Risha's App Building Playbook, Stage 5.
Direction: Heritage Premium, chosen October 19, 2026 (university
advancement frame, photo-first need cards, rivalry energy reserved
for the class leaderboard).

## What is here

- `svg/` and `png/` — all 16 screens from Stage 4, restyled. Same
  layout, same screen numbers, same data file. The wireframes CLI
  renders both fidelities (`--theme lofi` and `--theme hifi`), and
  the approved lo-fi SVGs are byte-for-byte unchanged.
- `img/` — the photography used (stand-ins from the design audit;
  real school photos replace them at launch).
- `figma-plugin/` — the same one-click Figma drawer, themed. In
  Figma, photo areas arrive as navy panels; drop the real photos in
  from `img/`, or import the SVGs, which carry the photos.

Earlier exhibits of this direction, from the design audit:
design-mockups/heritage-premium.html and its three mockups
(homepage, donation modal, mobile home).

## Design tokens

- Navy `#0F1F38` — headings, nav band, primary buttons.
- Gold `#B8882A` — progress fills; dark gold `#8C6D1F` for small
  caps labels (meets contrast on cream); chip text `#7A5C14`.
- Cream `#F8F7F5` — page background. Cards white with a warm
  border `#E3DCCB`, corner radius 16. Buttons radius 12.
- Green `#1B6B42` — reserved for the RECEIVED state only, so the
  payoff moment has its own color and nothing else competes.
- Type: Cormorant Garamond for headings (serif, institutional),
  Instrument Sans for everything else. Headline 26/33, section
  heads 19/25, body 13/18, captions 11/15.
- Spacing: 16pt side margins, 8pt grid, 10pt default stack gap —
  the same grid as the lo-fi, per Risha's hi-fi rules.

## Contrast (checked against the hi-fi rules)

- Body text `#1F2733` on cream: above 12:1.
- Navy on cream and cream/white on navy: above 10:1.
- Small gold labels use the darkened gold `#8C6D1F` (about 4.6:1 on
  cream), never the brighter progress gold, which is decorative
  only and always paired with a text amount.
- Status is always a word plus color, never color alone.

## Component states (the set an engineer prices from)

- Need card: LIVE (progress + amount), FUNDED (full gold bar,
  funded date), SENT (awaiting confirmation note), RECEIVED
  (green state line), DELAYED (public reason line), CANCELLED
  (redirect/refund note). Photo always present; a need cannot be
  LIVE without one (Stage 3 rule).
- Donate sheet (S4): amount chips with a clear selected state
  (navy), custom amount field, one-time/monthly segmented control,
  anonymity toggle, and ONE total on the button. Per Risha's
  October 19 transparency clarification, the sheet shows the total
  given and the tax-deductible note only. There is no fee breakdown
  box; the internal split between the fiscal sponsor and the app is
  not displayed publicly.
- Buttons: primary navy, secondary outlined navy, disabled state
  is a lightened navy with the reason in adjacent text, never a
  silent grey mystery (the audit found exactly that failure in the
  old modal).
- Forms: label above field, warm border, error text under the
  field in plain language. Autosave indicator on S11.
- Empty states are designed screens, not blanks: school with no
  live needs (shows Received history), new donor (S7 note), empty
  review queue ("All caught up").

## Apple design check 2 (per playbook)

Components carried from Stage 4 (Tab Bars, Sheets, Lists, Buttons,
Text Fields) were re-checked against the HIG at this styling pass
for: serif/display type legibility at small sizes (headings only,
never body), minimum 44pt targets (all primary actions are 48pt),
sheet presentation for the donate task, and status conveyed by
text as well as color. On iOS, interactive elements additionally
take the Liquid Glass treatment in the native build (Stage 6
exhibit: the SwiftUI app already uses it); the web hi-fi uses the
flat Heritage Premium surfaces, which is the correct split: glass
is an Apple platform material, not a web one.

## Navigation and behavior confirmation

Navigation is unchanged from the approved lo-fi: three-tab bar
(Home, Honor, Schools) on public screens; labeled portal and admin
headers inside signed-in areas; Donate is always a sheet over the
need. Screens with no clear single action: none. Every screen's
primary action is the navy button.

## Gate

Risha approves the hi-fi. After this gate, visual changes stop and
Stage 6 documents the platform and build decisions against these
screens.
