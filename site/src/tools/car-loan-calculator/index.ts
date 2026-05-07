import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "car-loan-calculator",
    category: "finance",
    applicationCategory: "FinanceApplication",
    updatedAt: "2026-05-07",
    related: ["loan-calculator", "mortgage-calculator", "simple-interest-calculator"],
    primaryKeyword: {
      en: "car loan calculator",
      ja: "自動車ローン 計算",
      "zh-CN": "汽车贷款 计算器",
    },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
