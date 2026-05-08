import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "annuity-payout-calculator",
    category: "finance",
    applicationCategory: "FinanceApplication",
    updatedAt: "2026-05-08",
    related: ["compound-interest", "loan-calculator", "rule-of-72-calculator"],
    primaryKeyword: { en: "annuity payout calculator", ja: "年金 取り崩し" },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
