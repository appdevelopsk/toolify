import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "percentage-calculator",
    category: "math",
    applicationCategory: "UtilitiesApplication",
    updatedAt: "2026-05-06",
    related: ["tip-calculator", "compound-interest-calculator"],
    primaryKeyword: { en: "percentage calculator", ja: "パーセント計算機" },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
