import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "roman-numeral-converter",
    category: "text",
    applicationCategory: "EducationApplication",
    updatedAt: "2026-05-06",
    related: ["case-converter", "percentage-calculator"],
    primaryKeyword: { en: "Roman numeral converter", ja: "ローマ数字 変換" },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
