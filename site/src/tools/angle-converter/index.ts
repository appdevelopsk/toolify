import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "angle-converter",
    category: "converter",
    applicationCategory: "UtilityApplication",
    updatedAt: "2026-05-07",
    related: ["pressure-converter", "temperature-converter", "weight-converter"],
    primaryKeyword: {
      en: "angle converter",
      ja: "角度 単位 変換",
      "zh-CN": "角度 单位 换算",
    },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
