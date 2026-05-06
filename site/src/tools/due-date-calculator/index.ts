import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "due-date-calculator",
    category: "health",
    applicationCategory: "HealthApplication",
    updatedAt: "2026-05-06",
    related: ["age-calculator", "calorie-calculator"],
    primaryKeyword: { en: "due date calculator", ja: "出産予定日計算" },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
