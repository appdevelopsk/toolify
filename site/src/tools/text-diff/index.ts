import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "text-diff",
    category: "text",
    applicationCategory: "DeveloperApplication",
    updatedAt: "2026-05-06",
    related: ["json-formatter", "case-converter"],
    primaryKeyword: { en: "text diff tool", ja: "テキスト差分" },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
