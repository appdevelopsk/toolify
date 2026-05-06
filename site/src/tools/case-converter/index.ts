import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "case-converter",
    category: "text",
    applicationCategory: "UtilitiesApplication",
    updatedAt: "2026-05-06",
    related: ["word-counter", "base64-encoder"],
    primaryKeyword: { en: "case converter", ja: "大文字小文字変換" },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
