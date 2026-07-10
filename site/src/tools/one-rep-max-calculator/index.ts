import type { ToolMeta } from "@/lib/tools/types";

const meta: ToolMeta = {
    slug: "one-rep-max-calculator",
    category: "health",
    applicationCategory: "HealthApplication",
    updatedAt: "2026-07-10",
    related: ["bmr-calculator", "calorie-calculator", "macro-calculator", "body-fat-calculator"],
    primaryKeyword: {
      en: "one rep max calculator",
      ja: "1RM 計算",
      "zh-CN": "1RM 计算器",
    },
    hasHowTo: true,
    hasFaq: true,
  sources: [
    { label: "Brzycki (1993) — Strength testing: predicting a one-rep max from reps-to-fatigue (JOPERD)", url: "https://doi.org/10.1080/07303084.1993.10606684" },
  ],
  };

export default meta;
