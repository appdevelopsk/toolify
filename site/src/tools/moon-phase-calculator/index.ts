import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "moon-phase-calculator",
    category: "datetime",
    applicationCategory: "EducationApplication",
    updatedAt: "2026-05-07",
    related: ["age-calculator", "iso-week-calculator", "leap-year-checker"],
    primaryKeyword: {
      en: "moon phase calculator",
      ja: "月齢 計算",
      "zh-CN": "月相 计算",
    },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
