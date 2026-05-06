import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "email-validator",
    category: "text",
    applicationCategory: "DeveloperApplication",
    updatedAt: "2026-05-06",
    related: ["regex-tester", "url-encoder"],
    primaryKeyword: { en: "email validator", ja: "メールアドレス検証" },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
