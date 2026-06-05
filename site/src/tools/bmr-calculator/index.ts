import type { ToolMeta } from "@/lib/tools/types";

const meta: ToolMeta = {
    slug: "bmr-calculator",
    category: "health",
    applicationCategory: "HealthApplication",
    updatedAt: "2026-05-07",
    related: ["calorie-calculator", "macro-calculator", "bmi-calculator"],
    primaryKeyword: { en: "BMR calculator", ja: "基礎代謝 計算" },
    hasHowTo: true,
    hasFaq: true,
  sources: [
    { label: "Mifflin-St Jeor equation (Am J Clin Nutr, 1990) — PubMed", url: "https://pubmed.ncbi.nlm.nih.gov/2305711/" },
  ],
  };

export default meta;
