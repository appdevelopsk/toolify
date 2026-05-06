import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "lorem-ipsum-generator",
    category: "text",
    applicationCategory: "DesignApplication",
    updatedAt: "2026-05-06",
    related: ["word-counter", "case-converter"],
    primaryKeyword: { en: "lorem ipsum generator", ja: "Lorem ipsum 生成" },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
