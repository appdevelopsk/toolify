import type { ToolMeta } from "@/lib/tools/types";

const meta: ToolMeta = {
    slug: "calorie-calculator",
    category: "health",
    applicationCategory: "HealthApplication",
    updatedAt: "2026-05-06",
    related: ["bmi-calculator", "ideal-weight-calculator"],
    primaryKeyword: { en: "calorie calculator", ja: "カロリー計算機" },
    hasHowTo: true,
    hasFaq: true,
  sources: [
    { label: "Mifflin-St Jeor equation (Am J Clin Nutr, 1990) — PubMed", url: "https://pubmed.ncbi.nlm.nih.gov/2305711/" },
    { label: "U.S. CDC — Physical Activity Guidelines", url: "https://www.cdc.gov/physical-activity-basics/guidelines/index.html" },
  ],
  };

export default meta;
