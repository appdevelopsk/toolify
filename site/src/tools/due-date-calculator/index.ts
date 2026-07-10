import type { ToolMeta } from "@/lib/tools/types";

const meta: ToolMeta = {
    slug: "due-date-calculator",
    category: "health",
    applicationCategory: "HealthApplication",
    updatedAt: "2026-07-10",
    related: ["pregnancy-week-calculator", "ovulation-calculator", "conception-date-calculator"],
    primaryKeyword: { en: "due date calculator", ja: "出産予定日計算" },
    hasHowTo: true,
    hasFaq: true,
  sources: [
    { label: "ACOG — Calculating a Due Date", url: "https://www.acog.org/womens-health/faqs/calculating-a-due-date" },
    { label: "ACOG Committee Opinion No. 700 — Methods for Estimating the Due Date", url: "https://www.acog.org/clinical/clinical-guidance/committee-opinion/articles/2017/05/methods-for-estimating-the-due-date" },
    { label: "NHS — Pregnancy due date calculator", url: "https://www.nhs.uk/pregnancy/finding-out/due-date-calculator/" },
  ],
  };

export default meta;
