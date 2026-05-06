import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "color-converter",
    category: "color",
    applicationCategory: "DesignApplication",
    updatedAt: "2026-05-06",
    related: ["contrast-checker"],
    primaryKeyword: { en: "color converter", ja: "カラーコード変換" },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
