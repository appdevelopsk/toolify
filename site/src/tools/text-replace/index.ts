import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "text-replace",
    category: "text",
    applicationCategory: "UtilitiesApplication",
    updatedAt: "2026-05-06",
    related: ["regex-tester", "case-converter"],
    primaryKeyword: { en: "find and replace text", ja: "テキスト 置換" },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
