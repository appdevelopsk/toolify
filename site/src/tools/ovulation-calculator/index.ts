import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "ovulation-calculator",
    category: "health",
    applicationCategory: "HealthApplication",
    updatedAt: "2026-05-07",
    related: ["due-date-calculator", "age-calculator", "date-calculator"],
    primaryKeyword: {
      en: "ovulation calculator",
      ja: "排卵日 計算",
      "zh-CN": "排卵日 计算器",
    },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
