import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "html-to-markdown",
    category: "text",
    applicationCategory: "DeveloperApplication",
    updatedAt: "2026-05-07",
    related: ["markdown-to-html", "case-converter", "text-replace"],
    primaryKeyword: {
      en: "html to markdown",
      ja: "HTML Markdown 変換",
      "zh-CN": "HTML Markdown 转换",
    },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
