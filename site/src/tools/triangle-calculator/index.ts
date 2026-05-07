import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "triangle-calculator",
    category: "math",
    applicationCategory: "EducationApplication",
    updatedAt: "2026-05-07",
    related: ["aspect-ratio-calculator", "statistics-calculator", "angle-converter"],
    primaryKeyword: {
      en: "triangle calculator",
      ja: "三角形 計算",
      "zh-CN": "三角形 计算器",
    },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
