import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "contrast-checker",
    category: "color",
    applicationCategory: "DesignApplication",
    updatedAt: "2026-05-06",
    related: ["color-converter"],
    primaryKeyword: { en: "contrast checker", ja: "コントラストチェッカー" },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
