import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "age-difference-calculator",
    category: "datetime",
    applicationCategory: "EducationApplication",
    updatedAt: "2026-05-07",
    related: ["age-calculator", "date-calculator", "iso-week-calculator"],
    primaryKeyword: {
      en: "age difference calculator",
      ja: "年齢差 計算",
      "zh-CN": "年龄差 计算器",
    },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
