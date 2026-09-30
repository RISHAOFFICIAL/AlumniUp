# AlumniUp — Mobile App (Expo)

Universal mobile app for AlumniUp (iOS / Android / web) built with Expo
(managed workflow) + Expo Router + TypeScript. This is the **sibling** of the
web app (`/home/team/shared/alumniup`) and reuses its patterns rather than
reinventing them.

## Stack

- **Expo SDK 57** (React Native 0.86, React 19), **Expo Router** (file-based routing)
- **TypeScript** (strict)
- **@supabase/supabase-js** — real data path (deferred until credentials exist)
- **Zustand** — mock source of truth (mirrors the web app's `src/store/mock.ts`)

## Data source toggle

The app defaults to **mock** mode (no credentials required):

```bash
EXPO_PUBLIC_DATA_SOURCE=mock        # default — renders mock needs, simulates donations
EXPO_PUBLIC_DATA_SOURCE=supabase    # real Supabase + shared API routes
```

Relevant env vars (see `.env.example`):

| Var | Purpose |
| --- | --- |
| `EXPO_PUBLIC_DATA_SOURCE` | `mock` (default) or `supabase` |
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL (real mode only) |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (real mode only) |
| `EXPO_PUBLIC_API_URL` | Base URL for shared `/api/*` routes (default `https://alumniup.org`) |

`EXPO_PUBLIC_*` vars are inlined at **bundle time** — changing them requires a
re-export / rebuild.

## Layout

```
src/
  app/                 # Expo Router screens
    _layout.tsx        # Stack navigator (brand header)
    index.tsx          # Home — grouped needs feed + search + category filter
    need/[id].tsx      # Need detail + Contribute
    login.tsx          # Email/password (Supabase auth, role note)
    wall-of-honor.tsx  # Class-year leaderboard + Wall of Honor
  components/          # NeedCard, DonationSheet, ProgressBar
  constants/theme.ts   # Design tokens (navy/gold/cream/green, fonts, spacing)
  hooks/index.ts       # useNeeds, useAuth, useWallOfHonor, ... (mock + supabase paths)
  lib/
    donations.ts       # submitDonation() — the single Stripe swap point
    supabase.ts        # createClient facade
    utils.ts           # formatCurrency, percentFunded
    data/mock.ts       # MOCK_SCHOOLS / MOCK_NEEDS / MOCK_WALL_OF_HONOR (copied from web)
  store/mock.ts        # Zustand mock store (recordDonation) — copied from web
  types/index.ts       # Shared types + BRAND constants — copied from web
```

`types/index.ts`, `lib/data/mock.ts`, and `store/mock.ts` are **copied verbatim**
from the web app so the two codebases share exact shapes; `hooks/index.ts` mirrors
the web's mock logic (same live post-donation updates) and adapts the Supabase path
to `EXPO_PUBLIC_*`.

## Commands

```bash
npm install
npm run typecheck      # tsc --noEmit
npm run web            # expo start --web
npm start              # expo start (dev server; press w for web, i/a for iOS/Android)
npx expo export --platform web   # static export to ./dist
```

## Deferred (later phases — need device testing + keys)

- Stripe React Native SDK (donation flow goes through `submitDonation`, not Stripe directly)
- Push notifications, biometric login, camera capture, deep links, offline cache
- Custom fonts (Cormorant Garamond / Instrument Sans) — currently system serif/sans
- AsyncStorage adapter for real Supabase auth session persistence
- EAS build + TestFlight / Google Play submission (gated on Apple/Google accounts + GitHub repo)
