import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "character-frequency",
    category: "text",
    applicationCategory: "UtilitiesApplication",
    updatedAt: "2026-05-06",
    related: ["word-counter", "text-diff"],
    primaryKeyword: { en: "character frequency analyzer", ja: "文字 出現頻度" },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
