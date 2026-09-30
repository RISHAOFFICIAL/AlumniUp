import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#0F1F38",
          light: "#1a2f52",
        },
        gold: {
          DEFAULT: "#B8882A",
          light: "#D4A84E",
        },
        cream: "#F8F7F5",
        green: {
          DEFAULT: "#1B6B42",
        },
        border: "#E0DBD2",
      },
      fontFamily: {
        serif: ["Cormorant Garamond", "Georgia", "serif"],
        sans: ["Instrument Sans", "system-ui", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "6px",
      },
      maxWidth: {
        page: "1100px",
      },
    },
  },
  plugins: [],
};
export default config;