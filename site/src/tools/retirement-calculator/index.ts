import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "retirement-calculator",
    category: "finance",
    applicationCategory: "FinanceApplication",
    updatedAt: "2026-05-07",
    related: ["compound-interest-calculator", "savings-goal-calculator", "salary-converter"],
    primaryKeyword: {
      en: "retirement calculator",
      ja: "退職資金 計算",
      "zh-CN": "退休 计算器",
    },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
