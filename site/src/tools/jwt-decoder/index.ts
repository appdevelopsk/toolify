import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "jwt-decoder",
    category: "text",
    applicationCategory: "DeveloperApplication",
    updatedAt: "2026-05-08",
    related: ["base64-encoder", "hash-generator", "url-encoder"],
    primaryKeyword: { en: "JWT decoder", ja: "JWT デコーダ" },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
