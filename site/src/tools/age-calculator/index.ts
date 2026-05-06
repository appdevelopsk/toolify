import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "age-calculator",
    category: "datetime",
    applicationCategory: "UtilitiesApplication",
    updatedAt: "2026-05-06",
    related: ["bmi-calculator", "length-converter"],
    primaryKeyword: { en: "age calculator", ja: "年齢計算" },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
