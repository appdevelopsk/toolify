import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "workdays-calculator",
    category: "datetime",
    applicationCategory: "BusinessApplication",
    updatedAt: "2026-05-07",
    related: ["date-calculator", "age-calculator", "countdown-timer"],
    primaryKeyword: {
      en: "workdays calculator",
      ja: "営業日 計算",
      "zh-CN": "工作日 计算器",
    },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
