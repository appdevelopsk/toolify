import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "waist-hip-ratio-calculator",
    category: "health",
    applicationCategory: "HealthApplication",
    updatedAt: "2026-05-07",
    related: ["bmi-calculator", "body-fat-calculator", "ideal-weight-calculator"],
    primaryKeyword: {
      en: "waist hip ratio calculator",
      ja: "ウエスト ヒップ比 計算",
      "zh-CN": "腰臀比 计算器",
    },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
