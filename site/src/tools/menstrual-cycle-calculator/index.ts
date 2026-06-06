import type { ToolMeta } from "@/lib/tools/types";

const meta: ToolMeta = {
  slug: "menstrual-cycle-calculator",
  category: "health",
  applicationCategory: "HealthApplication",
  updatedAt: "2026-06-06",
  related: ["ovulation-calculator", "due-date-calculator", "pregnancy-week-calculator"],
  primaryKeyword: {
    en: "period calculator",
    ja: "生理 予定日 計算",
  },
  hasHowTo: true,
  hasFaq: true,
  sources: [
    { label: "NICHD — Menstruation", url: "https://www.nichd.nih.gov/health/topics/menstruation" },
    { label: "OWH — Your Menstrual Cycle", url: "https://www.womenshealth.gov/menstrual-cycle/your-menstrual-cycle" },
  ],
};

export default meta;
