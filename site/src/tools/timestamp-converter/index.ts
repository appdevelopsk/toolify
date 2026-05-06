import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "timestamp-converter",
    category: "datetime",
    applicationCategory: "DeveloperApplication",
    updatedAt: "2026-05-06",
    related: ["age-calculator", "countdown-timer"],
    primaryKeyword: { en: "Unix timestamp converter", ja: "Unix タイムスタンプ 変換" },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
