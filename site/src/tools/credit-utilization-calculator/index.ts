import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "credit-utilization-calculator",
    category: "finance",
    applicationCategory: "FinanceApplication",
    updatedAt: "2026-05-08",
    related: ["debt-to-income-ratio-calculator", "credit-card-validator", "loan-calculator"],
    primaryKeyword: { en: "credit utilization calculator", ja: "クレジットカード 利用率" },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
