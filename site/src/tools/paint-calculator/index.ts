import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "paint-calculator",
    category: "math",
    applicationCategory: "UtilitiesApplication",
    updatedAt: "2026-05-06",
    related: ["area-converter", "length-converter"],
    primaryKeyword: { en: "paint calculator", ja: "塗料 必要量 計算" },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
