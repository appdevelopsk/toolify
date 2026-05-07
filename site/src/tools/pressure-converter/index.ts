import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "pressure-converter",
    category: "converter",
    applicationCategory: "UtilityApplication",
    updatedAt: "2026-05-07",
    related: ["temperature-converter", "weight-converter", "volume-converter"],
    primaryKeyword: {
      en: "pressure converter",
      ja: "圧力 単位 変換",
      "zh-CN": "压力 单位 换算",
    },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
