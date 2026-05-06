import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "mortgage-calculator",
    category: "finance",
    applicationCategory: "FinanceApplication",
    updatedAt: "2026-05-06",
    related: ["loan-calculator", "compound-interest-calculator"],
    primaryKeyword: { en: "mortgage calculator", ja: "住宅ローン計算" },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
