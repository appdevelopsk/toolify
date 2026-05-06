import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "calorie-calculator",
    category: "health",
    applicationCategory: "HealthApplication",
    updatedAt: "2026-05-06",
    related: ["bmi-calculator", "ideal-weight-calculator"],
    primaryKeyword: { en: "calorie calculator", ja: "カロリー計算機" },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
