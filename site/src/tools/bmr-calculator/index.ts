import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "bmr-calculator",
    category: "health",
    applicationCategory: "HealthApplication",
    updatedAt: "2026-05-07",
    related: ["calorie-calculator", "macro-calculator", "bmi-calculator"],
    primaryKeyword: { en: "BMR calculator", ja: "基礎代謝 計算" },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
