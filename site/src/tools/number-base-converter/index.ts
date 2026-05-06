import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "number-base-converter",
    category: "math",
    applicationCategory: "DeveloperApplication",
    updatedAt: "2026-05-06",
    related: ["color-converter", "data-size-converter"],
    primaryKeyword: { en: "number base converter", ja: "進数変換" },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
