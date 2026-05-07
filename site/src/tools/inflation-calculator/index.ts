import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "inflation-calculator",
    category: "finance",
    applicationCategory: "FinanceApplication",
    updatedAt: "2026-05-07",
    related: ["compound-interest-calculator", "retirement-calculator", "savings-goal-calculator"],
    primaryKeyword: {
      en: "inflation calculator",
      ja: "インフレ 計算",
      "zh-CN": "通胀 计算器",
    },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
