import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "tip-calculator",
    category: "finance",
    applicationCategory: "FinanceApplication",
    updatedAt: "2026-05-06",
    related: ["percentage-calculator", "compound-interest-calculator"],
    primaryKeyword: { en: "tip calculator", ja: "チップ計算機" },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
