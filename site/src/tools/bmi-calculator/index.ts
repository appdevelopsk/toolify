import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "bmi-calculator",
    category: "health",
    applicationCategory: "HealthApplication",
    updatedAt: "2026-05-06",
    related: ["age-calculator"],
    primaryKeyword: { en: "BMI calculator", ja: "BMI計算機" },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
