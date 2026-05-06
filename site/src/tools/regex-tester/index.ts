import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "regex-tester",
    category: "text",
    applicationCategory: "DeveloperApplication",
    updatedAt: "2026-05-06",
    related: ["text-diff", "json-formatter"],
    primaryKeyword: { en: "regex tester", ja: "正規表現テスター" },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
