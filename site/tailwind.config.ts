import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          500: "#0ea5e9",
          // brand-600 darkened from #0284c7 (4.09:1) to #0369a1 (5.33:1) for WCAG AA on white.
          600: "#0369a1",
          // brand-700 likewise shifted darker (was #0369a1).
          700: "#075985",
          900: "#0c4a6e",
        },
      },
      fontFamily: {
        sans: [
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Hiragino Kaku Gothic ProN",
          "Yu Gothic",
          "Meiryo",
          "sans-serif",
        ],
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "none",
          },
        },
      },
    },
  },
  plugins: [],
};

export default config;
