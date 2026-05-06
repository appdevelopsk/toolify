import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "data-size-converter",
    category: "converter",
    applicationCategory: "UtilitiesApplication",
    updatedAt: "2026-05-06",
    related: ["length-converter", "time-converter"],
    primaryKeyword: { en: "data size converter", ja: "データ容量変換" },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
