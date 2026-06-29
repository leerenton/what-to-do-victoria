import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["DM Sans", "sans-serif"],
        display: ["Nunito", "sans-serif"],
      },
      colors: {
        brand: {
          teal: "#48c7d4",
          dark: "#1a1a2e",
        },
      },
    },
  },
  plugins: [],
};

export default config;
