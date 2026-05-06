import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "weight-converter",
    category: "converter",
    applicationCategory: "UtilitiesApplication",
    updatedAt: "2026-05-06",
    related: ["length-converter", "temperature-converter"],
    primaryKeyword: { en: "weight converter", ja: "重さ単位変換" },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
