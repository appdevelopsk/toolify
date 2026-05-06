import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "json-formatter",
    category: "text",
    applicationCategory: "DeveloperApplication",
    updatedAt: "2026-05-06",
    related: ["base64-encoder", "case-converter"],
    primaryKeyword: { en: "JSON formatter", ja: "JSON 整形" },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
