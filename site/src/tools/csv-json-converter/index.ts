import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "csv-json-converter",
    category: "text",
    applicationCategory: "DeveloperApplication",
    updatedAt: "2026-05-08",
    related: ["json-formatter", "markdown-to-html", "text-replace"],
    primaryKeyword: { en: "CSV to JSON converter", ja: "CSV JSON 変換" },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
