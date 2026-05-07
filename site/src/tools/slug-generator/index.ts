import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "slug-generator",
    category: "text",
    applicationCategory: "DeveloperApplication",
    updatedAt: "2026-05-07",
    related: ["case-converter", "url-encoder", "text-replace"],
    primaryKeyword: {
      en: "slug generator",
      ja: "URL スラッグ 生成",
      "zh-CN": "URL slug 生成器",
    },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
