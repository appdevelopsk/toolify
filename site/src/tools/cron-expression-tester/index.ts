import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "cron-expression-tester",
    category: "datetime",
    applicationCategory: "DeveloperApplication",
    updatedAt: "2026-05-06",
    related: ["timezone-converter", "countdown-timer"],
    primaryKeyword: { en: "cron expression tester", ja: "cron 式テスター" },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
