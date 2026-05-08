import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "loan-amortization-schedule",
    category: "finance",
    applicationCategory: "FinanceApplication",
    updatedAt: "2026-05-08",
    related: ["loan-calculator", "mortgage-calculator", "car-loan-calculator"],
    primaryKeyword: { en: "loan amortization schedule", ja: "ローン 償却 表" },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
