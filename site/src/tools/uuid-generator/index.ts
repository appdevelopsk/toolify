import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "uuid-generator",
    category: "text",
    applicationCategory: "DeveloperApplication",
    updatedAt: "2026-05-06",
    related: ["password-generator", "base64-encoder"],
    primaryKeyword: { en: "UUID generator", ja: "UUID 生成" },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
