import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "countdown-timer",
    category: "datetime",
    applicationCategory: "UtilitiesApplication",
    updatedAt: "2026-05-06",
    related: ["age-calculator"],
    primaryKeyword: { en: "countdown timer", ja: "カウントダウンタイマー" },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
