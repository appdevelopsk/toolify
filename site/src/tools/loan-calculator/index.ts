import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "loan-calculator",
    category: "finance",
    applicationCategory: "FinanceApplication",
    updatedAt: "2026-05-06",
    related: ["compound-interest-calculator", "sales-tax-calculator"],
    primaryKeyword: { en: "loan calculator", ja: "ローン計算" },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
