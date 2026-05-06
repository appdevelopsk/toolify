import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "temperature-converter",
    category: "converter",
    applicationCategory: "UtilitiesApplication",
    updatedAt: "2026-05-06",
    related: ["length-converter"],
    primaryKeyword: { en: "temperature converter", ja: "温度変換" },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
