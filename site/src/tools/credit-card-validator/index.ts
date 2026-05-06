import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "credit-card-validator",
    category: "finance",
    applicationCategory: "FinanceApplication",
    updatedAt: "2026-05-06",
    related: ["email-validator", "hash-generator"],
    primaryKeyword: { en: "credit card validator", ja: "クレジットカード番号 検証" },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
