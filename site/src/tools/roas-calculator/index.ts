import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "roas-calculator",
    category: "finance",
    applicationCategory: "FinanceApplication",
    updatedAt: "2026-05-08",
    related: ["roi-calculator", "markup-calculator", "discount-calculator"],
    primaryKeyword: { en: "ROAS calculator", ja: "ROAS 広告費用対効果" },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
