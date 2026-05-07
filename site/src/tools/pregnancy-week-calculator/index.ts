import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "pregnancy-week-calculator",
    category: "health",
    applicationCategory: "HealthApplication",
    updatedAt: "2026-05-07",
    related: ["due-date-calculator", "ovulation-calculator", "age-calculator"],
    primaryKeyword: {
      en: "pregnancy week calculator",
      ja: "妊娠週数 計算",
      "zh-CN": "孕周 计算器",
    },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
