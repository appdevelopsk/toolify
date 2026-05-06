import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "time-converter",
    category: "converter",
    applicationCategory: "UtilitiesApplication",
    updatedAt: "2026-05-06",
    related: ["age-calculator", "countdown-timer"],
    primaryKeyword: { en: "time unit converter", ja: "時間単位変換" },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
