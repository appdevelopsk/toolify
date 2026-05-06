import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "timezone-converter",
    category: "datetime",
    applicationCategory: "UtilitiesApplication",
    updatedAt: "2026-05-06",
    related: ["countdown-timer", "timestamp-converter"],
    primaryKeyword: { en: "timezone converter", ja: "タイムゾーン変換" },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
