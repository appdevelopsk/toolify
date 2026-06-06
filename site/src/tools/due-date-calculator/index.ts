import type { ToolMeta } from "@/lib/tools/types";

const meta: ToolMeta = {
    slug: "due-date-calculator",
    category: "health",
    applicationCategory: "HealthApplication",
    updatedAt: "2026-05-06",
    related: ["pregnancy-week-calculator", "ovulation-calculator", "conception-date-calculator"],
    primaryKeyword: { en: "due date calculator", ja: "出産予定日計算" },
    hasHowTo: true,
    hasFaq: true,
  sources: [
    { label: "ACOG — Calculating a Due Date", url: "https://www.acog.org/womens-health/faqs/calculating-a-due-date" },
  ],
  };

export default meta;
