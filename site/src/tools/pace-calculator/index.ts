import type { ToolMeta } from "@/lib/tools/types";

const meta: ToolMeta = {
    slug: "pace-calculator",
    category: "health",
    applicationCategory: "HealthApplication",
    updatedAt: "2026-11-28",
    related: ["calorie-calculator", "speed-converter"],
    primaryKeyword: { en: "running pace calculator", ja: "ランニング ペース 計算" },
    hasHowTo: true,
    hasFaq: true,
    sources: [
      { label: "NIST — Unit Conversion", url: "https://www.nist.gov/pml/owm/metric-si/unit-conversion" },
    ],
  };

export default meta;
