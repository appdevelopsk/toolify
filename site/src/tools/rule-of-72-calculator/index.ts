import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "rule-of-72-calculator",
    category: "finance",
    applicationCategory: "FinanceApplication",
    updatedAt: "2026-05-07",
    related: ["compound-interest-calculator", "savings-goal-calculator", "inflation-calculator"],
    primaryKeyword: { en: "rule of 72 calculator", ja: "72の法則 計算" },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
