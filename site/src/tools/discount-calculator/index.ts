import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "discount-calculator",
    category: "finance",
    applicationCategory: "FinanceApplication",
    updatedAt: "2026-05-06",
    related: ["sales-tax-calculator", "tip-calculator", "percentage-calculator"],
    primaryKeyword: { en: "discount calculator", ja: "割引 計算" },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
