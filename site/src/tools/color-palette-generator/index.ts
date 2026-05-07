import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "color-palette-generator",
    category: "color",
    applicationCategory: "DesignApplication",
    updatedAt: "2026-05-07",
    related: ["color-converter", "contrast-checker", "gradient-generator"],
    primaryKeyword: {
      en: "color palette generator",
      ja: "カラー パレット 生成",
      "zh-CN": "调色板 生成器",
    },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
