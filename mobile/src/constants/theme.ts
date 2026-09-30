import { BRAND } from "@/types";

// Design tokens for the mobile app. Colors mirror the web app's BRAND
// constants (canonical source: src/types/index.ts). Fonts are semantic tokens:
// Cormorant Garamond (headings) and Instrument Sans (body) are loaded via
// expo-font in a later phase — until then these map to the platform's
// serif / sans-serif system fonts so the app renders cleanly without assets.
export const COLORS = BRAND;

export const FONTS = {
  heading: "serif",
  body: "sans-serif",
} as const;

export const RADII = { sm: 4, md: 8, lg: 12 } as const;

export const SPACING = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;
