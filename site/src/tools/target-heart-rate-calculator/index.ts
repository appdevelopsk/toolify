import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "target-heart-rate-calculator",
    category: "health",
    applicationCategory: "HealthApplication",
    updatedAt: "2026-05-07",
    related: ["bmr-calculator", "calorie-calculator", "macro-calculator", "pace-calculator"],
    primaryKeyword: {
      en: "target heart rate calculator",
      ja: "目標 心拍数 計算",
      "zh-CN": "目标 心率 计算器",
    },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
