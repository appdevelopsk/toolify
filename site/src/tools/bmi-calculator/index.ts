import type { ToolMeta } from "@/lib/tools/types";

const meta: ToolMeta = {
    slug: "bmi-calculator",
    category: "health",
    applicationCategory: "HealthApplication",
    updatedAt: "2026-05-06",
    related: ["age-calculator"],
    primaryKeyword: { en: "BMI calculator", ja: "BMI計算機" },
    hasHowTo: true,
    hasFaq: true,
  sources: [
    { label: "World Health Organization — Obesity and overweight", url: "https://www.who.int/news-room/fact-sheets/detail/obesity-and-overweight" },
    { label: "U.S. CDC — Adult BMI Calculator", url: "https://www.cdc.gov/bmi/adult-calculator/index.html" },
  ],
  };

export default meta;
