import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "markdown-to-html",
    category: "text",
    applicationCategory: "DeveloperApplication",
    updatedAt: "2026-05-07",
    related: ["html-to-markdown", "case-converter", "text-replace"],
    primaryKeyword: {
      en: "markdown to html",
      ja: "Markdown HTML 変換",
      "zh-CN": "Markdown HTML 转换",
    },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
