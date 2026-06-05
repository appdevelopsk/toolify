import type { ToolMeta } from "@/lib/tools/types";

const meta: ToolMeta = {
    slug: "water-intake-calculator",
    category: "health",
    applicationCategory: "HealthApplication",
    updatedAt: "2026-05-06",
    related: ["calorie-calculator", "bmi-calculator"],
    primaryKeyword: { en: "water intake calculator", ja: "水分摂取量 計算" },
    hasHowTo: true,
    hasFaq: true,
  sources: [
    { label: "National Academies — Dietary Reference Intakes for Water", url: "https://nap.nationalacademies.org/catalog/10925/dietary-reference-intakes-for-water-potassium-sodium-chloride-and-sulfate" },
    { label: "U.S. CDC — Water and Healthier Drinks", url: "https://www.cdc.gov/healthy-weight-growth/water-healthy-drinks/index.html" },
  ],
  };

export default meta;
