import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "mortgage-refinance-calculator",
    category: "finance",
    applicationCategory: "FinanceApplication",
    updatedAt: "2026-05-08",
    related: ["mortgage-calculator", "loan-amortization-schedule", "loan-calculator"],
    primaryKeyword: { en: "mortgage refinance calculator", ja: "住宅ローン 借り換え 計算" },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
