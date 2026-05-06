import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "ideal-weight-calculator",
    category: "health",
    applicationCategory: "HealthApplication",
    updatedAt: "2026-05-06",
    related: ["bmi-calculator", "calorie-calculator"],
    primaryKeyword: { en: "ideal weight calculator", ja: "理想体重計算" },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
