import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "hash-generator",
    category: "text",
    applicationCategory: "DeveloperApplication",
    updatedAt: "2026-05-06",
    related: ["uuid-generator", "base64-encoder"],
    primaryKeyword: { en: "hash generator", ja: "ハッシュ生成" },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
