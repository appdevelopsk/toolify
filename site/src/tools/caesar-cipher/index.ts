import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "caesar-cipher",
    category: "text",
    applicationCategory: "UtilitiesApplication",
    updatedAt: "2026-05-08",
    related: ["base64-encoder", "hash-generator", "url-encoder"],
    primaryKeyword: { en: "caesar cipher", ja: "シーザー暗号" },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
