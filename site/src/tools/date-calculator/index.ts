import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "date-calculator",
    category: "datetime",
    applicationCategory: "UtilitiesApplication",
    updatedAt: "2026-05-06",
    related: ["age-calculator", "countdown-timer"],
    primaryKeyword: { en: "date calculator", ja: "日付計算" },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
