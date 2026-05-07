import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "emergency-fund-calculator",
    category: "finance",
    applicationCategory: "FinanceApplication",
    updatedAt: "2026-05-07",
    related: ["savings-goal-calculator", "retirement-calculator", "compound-interest-calculator"],
    primaryKeyword: {
      en: "emergency fund calculator",
      ja: "生活防衛資金 計算",
      "zh-CN": "应急基金 计算器",
    },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
