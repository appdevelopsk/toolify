import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "random-number-generator",
    category: "math",
    applicationCategory: "UtilitiesApplication",
    updatedAt: "2026-05-06",
    related: ["password-generator", "uuid-generator"],
    primaryKeyword: { en: "random number generator", ja: "乱数生成" },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
