import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "body-fat-calculator",
    category: "health",
    applicationCategory: "HealthApplication",
    updatedAt: "2026-05-07",
    related: ["bmi-calculator", "bmr-calculator", "ideal-weight-calculator", "calorie-calculator"],
    primaryKeyword: {
      en: "body fat calculator",
      ja: "体脂肪率 計算",
      "zh-CN": "体脂率 计算器",
    },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
