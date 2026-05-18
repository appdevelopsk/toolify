import type { ToolMeta } from "@/lib/tools/types";

const meta: ToolMeta = {
  slug: "sleep-calculator",
  category: "health",
  applicationCategory: "HealthApplication",
  updatedAt: "2026-05-18",
  related: ["age-calculator", "bmi-calculator", "target-heart-rate-calculator"],
  primaryKeyword: { en: "sleep calculator", ja: "睡眠計算" },
  hasHowTo: true,
  hasFaq: true,
};

export default meta;
