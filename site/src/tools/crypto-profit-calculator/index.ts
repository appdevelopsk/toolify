import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "crypto-profit-calculator",
    category: "finance",
    applicationCategory: "FinanceApplication",
    updatedAt: "2026-05-07",
    related: ["compound-interest-calculator", "percentage-calculator", "savings-goal-calculator"],
    primaryKeyword: {
      en: "crypto profit calculator",
      ja: "仮想通貨 利益 計算",
      "zh-CN": "加密货币 收益 计算器",
    },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
