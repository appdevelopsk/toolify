import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "stock-profit-calculator",
    category: "finance",
    applicationCategory: "FinanceApplication",
    updatedAt: "2026-05-07",
    related: ["compound-interest-calculator", "crypto-profit-calculator", "retirement-calculator"],
    primaryKeyword: {
      en: "stock profit calculator",
      ja: "株式 利益 計算",
      "zh-CN": "股票 收益 计算器",
    },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
