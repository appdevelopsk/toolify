import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "statistics-calculator",
    category: "math",
    applicationCategory: "EducationApplication",
    updatedAt: "2026-05-07",
    related: ["percentage-calculator", "gpa-calculator", "compound-interest-calculator"],
    primaryKeyword: {
      en: "statistics calculator",
      ja: "統計 計算",
      "zh-CN": "统计 计算器",
    },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
