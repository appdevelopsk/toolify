import type { ToolMeta } from "@/lib/tools/types";

const meta: ToolMeta = {
  slug: "conception-date-calculator",
  category: "health",
  applicationCategory: "HealthApplication",
  updatedAt: "2026-06-06",
  related: ["due-date-calculator", "pregnancy-week-calculator", "ovulation-calculator"],
  primaryKeyword: {
    en: "conception date calculator",
    ja: "受精日 計算",
  },
  hasHowTo: true,
  hasFaq: true,
  sources: [
    { label: "ACOG — Calculating a Due Date", url: "https://www.acog.org/womens-health/faqs/calculating-a-due-date" },
    { label: "NICHD — Preconception Care", url: "https://www.nichd.nih.gov/health/topics/preconceptioncare" },
  ],
};

export default meta;
