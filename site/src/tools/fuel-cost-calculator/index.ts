import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "fuel-cost-calculator",
    category: "finance",
    applicationCategory: "FinanceApplication",
    updatedAt: "2026-05-07",
    related: ["fuel-economy-converter", "car-loan-calculator", "salary-converter"],
    primaryKeyword: {
      en: "fuel cost calculator",
      ja: "ガソリン代 計算",
      "zh-CN": "燃料 成本 计算",
    },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
