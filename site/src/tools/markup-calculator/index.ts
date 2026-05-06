import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "markup-calculator",
    category: "finance",
    applicationCategory: "FinanceApplication",
    updatedAt: "2026-05-06",
    related: ["discount-calculator", "percentage-calculator"],
    primaryKeyword: { en: "markup calculator", ja: "値入率計算" },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
