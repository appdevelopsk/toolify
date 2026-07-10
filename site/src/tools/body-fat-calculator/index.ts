import type { ToolMeta } from "@/lib/tools/types";

const meta: ToolMeta = {
    slug: "body-fat-calculator",
    category: "health",
    applicationCategory: "HealthApplication",
    updatedAt: "2026-07-10",
    related: ["bmi-calculator", "bmr-calculator", "ideal-weight-calculator", "calorie-calculator"],
    primaryKeyword: {
      en: "body fat calculator",
      ja: "体脂肪率 計算",
      "zh-CN": "体脂率 计算器",
    },
    hasHowTo: true,
    hasFaq: true,
  sources: [
    { label: "Hodgdon & Beckett (1984) — Prediction of percent body fat for U.S. Navy men (circumference method)", url: "https://apps.dtic.mil/sti/citations/ADA143890" },
    { label: "World Health Organization — Obesity and overweight", url: "https://www.who.int/news-room/fact-sheets/detail/obesity-and-overweight" },
  ],
  };

export default meta;
