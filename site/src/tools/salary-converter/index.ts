import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "salary-converter",
    category: "finance",
    applicationCategory: "FinanceApplication",
    updatedAt: "2026-05-07",
    related: ["compound-interest-calculator", "savings-goal-calculator"],
    primaryKeyword: { en: "salary converter", ja: "年収 換算" },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
