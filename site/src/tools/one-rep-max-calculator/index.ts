import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "one-rep-max-calculator",
    category: "health",
    applicationCategory: "HealthApplication",
    updatedAt: "2026-05-07",
    related: ["bmr-calculator", "calorie-calculator", "macro-calculator", "body-fat-calculator"],
    primaryKeyword: {
      en: "one rep max calculator",
      ja: "1RM 計算",
      "zh-CN": "1RM 计算器",
    },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
