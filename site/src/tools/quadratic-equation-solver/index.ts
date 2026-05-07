import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "quadratic-equation-solver",
    category: "math",
    applicationCategory: "EducationApplication",
    updatedAt: "2026-05-07",
    related: ["statistics-calculator", "prime-checker", "percentage-calculator"],
    primaryKeyword: {
      en: "quadratic equation solver",
      ja: "二次方程式 解",
      "zh-CN": "二次方程 求解",
    },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
