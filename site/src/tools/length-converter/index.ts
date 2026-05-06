import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "length-converter",
    category: "converter",
    applicationCategory: "UtilitiesApplication",
    updatedAt: "2026-05-06",
    related: ["bmi-calculator", "age-calculator"],
    primaryKeyword: { en: "length converter", ja: "長さ単位変換" },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
