import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "fraction-calculator",
    category: "math",
    applicationCategory: "EducationApplication",
    updatedAt: "2026-05-07",
    related: ["percentage-calculator", "statistics-calculator", "prime-checker"],
    primaryKeyword: {
      en: "fraction calculator",
      ja: "分数 計算",
      "zh-CN": "分数 计算器",
    },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
