import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "fuel-economy-converter",
    category: "converter",
    applicationCategory: "UtilitiesApplication",
    updatedAt: "2026-05-06",
    related: ["speed-converter", "length-converter"],
    primaryKeyword: { en: "fuel economy converter", ja: "燃費 換算" },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
