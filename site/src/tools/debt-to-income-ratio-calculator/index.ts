import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "debt-to-income-ratio-calculator",
    category: "finance",
    applicationCategory: "FinanceApplication",
    updatedAt: "2026-05-08",
    related: ["mortgage-calculator", "loan-calculator", "credit-utilization-calculator"],
    primaryKeyword: { en: "debt to income ratio calculator", ja: "DTI 比率 計算" },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
