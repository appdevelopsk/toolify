import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "factorial-calculator",
    category: "math",
    applicationCategory: "EducationApplication",
    updatedAt: "2026-05-07",
    related: ["statistics-calculator", "prime-checker", "scientific-notation-converter"],
    primaryKeyword: {
      en: "factorial calculator",
      ja: "階乗 計算",
      "zh-CN": "阶乘 计算器",
    },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
