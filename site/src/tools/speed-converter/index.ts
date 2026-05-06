import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "speed-converter",
    category: "converter",
    applicationCategory: "UtilitiesApplication",
    updatedAt: "2026-05-06",
    related: ["length-converter", "fuel-economy-converter"],
    primaryKeyword: { en: "speed converter", ja: "速度単位変換" },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
