import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "savings-goal-calculator",
    category: "finance",
    applicationCategory: "FinanceApplication",
    updatedAt: "2026-05-07",
    related: ["compound-interest-calculator", "loan-calculator"],
    primaryKeyword: { en: "savings goal calculator", ja: "貯金目標 計算" },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
