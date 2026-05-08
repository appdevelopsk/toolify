import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "investment-fee-impact-calculator",
    category: "finance",
    applicationCategory: "FinanceApplication",
    updatedAt: "2026-05-08",
    related: ["compound-interest-calculator", "retirement-calculator", "cagr-calculator"],
    primaryKeyword: { en: "investment fee impact calculator", ja: "投資 信託報酬 影響" },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
