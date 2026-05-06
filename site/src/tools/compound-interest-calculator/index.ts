import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "compound-interest-calculator",
    category: "finance",
    applicationCategory: "FinanceApplication",
    updatedAt: "2026-05-06",
    related: ["tip-calculator", "percentage-calculator"],
    primaryKeyword: { en: "compound interest calculator", ja: "複利計算機" },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
