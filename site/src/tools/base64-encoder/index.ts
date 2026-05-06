import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "base64-encoder",
    category: "text",
    applicationCategory: "DeveloperApplication",
    updatedAt: "2026-05-06",
    related: ["json-formatter", "case-converter"],
    primaryKeyword: { en: "base64 encoder decoder", ja: "Base64 エンコード デコード" },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
