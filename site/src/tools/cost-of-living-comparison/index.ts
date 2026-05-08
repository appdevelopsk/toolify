import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "cost-of-living-comparison",
    category: "finance",
    applicationCategory: "FinanceApplication",
    updatedAt: "2026-05-08",
    related: ["salary-converter", "inflation-calculator", "vat-calculator"],
    primaryKeyword: { en: "cost of living comparison", ja: "生活費 比較 都市" },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
