import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "url-encoder",
    category: "text",
    applicationCategory: "DeveloperApplication",
    updatedAt: "2026-05-06",
    related: ["base64-encoder", "json-formatter"],
    primaryKeyword: { en: "URL encoder decoder", ja: "URL エンコード デコード" },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
