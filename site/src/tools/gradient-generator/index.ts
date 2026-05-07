import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "gradient-generator",
    category: "color",
    applicationCategory: "DesignApplication",
    updatedAt: "2026-05-07",
    related: ["color-converter", "contrast-checker"],
    primaryKeyword: {
      en: "css gradient generator",
      ja: "CSS グラデーション 生成",
      "zh-CN": "CSS 渐变 生成器",
    },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
