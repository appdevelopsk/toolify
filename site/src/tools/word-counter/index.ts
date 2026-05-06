import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "word-counter",
    category: "text",
    applicationCategory: "UtilitiesApplication",
    updatedAt: "2026-05-06",
    related: ["password-generator"],
    primaryKeyword: { en: "word counter", ja: "文字数カウンター" },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
