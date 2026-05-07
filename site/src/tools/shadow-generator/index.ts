import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "shadow-generator",
    category: "color",
    applicationCategory: "DesignApplication",
    updatedAt: "2026-05-07",
    related: ["gradient-generator", "color-converter", "color-palette-generator"],
    primaryKeyword: {
      en: "css box shadow generator",
      ja: "CSS 影 生成",
      "zh-CN": "CSS 阴影 生成器",
    },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
