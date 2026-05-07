import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "weight-loss-calculator",
    category: "health",
    applicationCategory: "HealthApplication",
    updatedAt: "2026-05-07",
    related: ["calorie-calculator", "bmr-calculator", "macro-calculator", "body-fat-calculator"],
    primaryKeyword: {
      en: "weight loss calculator",
      ja: "減量 計算",
      "zh-CN": "减肥 计算器",
    },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
