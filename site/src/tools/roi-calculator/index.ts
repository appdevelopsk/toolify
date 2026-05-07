import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "roi-calculator",
    category: "finance",
    applicationCategory: "FinanceApplication",
    updatedAt: "2026-05-07",
    related: ["compound-interest-calculator", "stock-profit-calculator", "crypto-profit-calculator"],
    primaryKeyword: {
      en: "roi calculator",
      ja: "ROI 計算",
      "zh-CN": "ROI 计算器",
    },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
