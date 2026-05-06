import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "water-intake-calculator",
    category: "health",
    applicationCategory: "HealthApplication",
    updatedAt: "2026-05-06",
    related: ["calorie-calculator", "bmi-calculator"],
    primaryKeyword: { en: "water intake calculator", ja: "水分摂取量 計算" },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
