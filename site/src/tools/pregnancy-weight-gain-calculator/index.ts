import type { ToolMeta } from "@/lib/tools/types";

const meta: ToolMeta = {
  slug: "pregnancy-weight-gain-calculator",
  category: "health",
  applicationCategory: "HealthApplication",
  updatedAt: "2026-06-06",
  related: ["bmi-calculator", "pregnancy-week-calculator", "due-date-calculator"],
  primaryKeyword: {
    en: "pregnancy weight gain calculator",
    ja: "妊娠 体重増加 計算",
  },
  hasHowTo: true,
  hasFaq: true,
  sources: [
    { label: "NASEM / IOM — Weight Gain During Pregnancy (2009)", url: "https://nap.nationalacademies.org/catalog/12584/weight-gain-during-pregnancy-reexamining-the-guidelines" },
    { label: "CDC — Weight Gain During Pregnancy", url: "https://www.cdc.gov/maternal-infant-health/pregnancy-weight-gain/" },
  ],
};

export default meta;
