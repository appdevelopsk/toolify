import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "volume-converter",
    category: "converter",
    applicationCategory: "UtilitiesApplication",
    updatedAt: "2026-05-06",
    related: ["length-converter", "weight-converter"],
    primaryKeyword: { en: "volume converter", ja: "体積単位変換" },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
