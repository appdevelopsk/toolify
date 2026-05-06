import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "macro-calculator",
    category: "health",
    applicationCategory: "HealthApplication",
    updatedAt: "2026-05-06",
    related: ["calorie-calculator", "ideal-weight-calculator"],
    primaryKeyword: { en: "macro calculator", ja: "マクロ栄養素計算" },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
