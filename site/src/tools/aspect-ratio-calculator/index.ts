import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "aspect-ratio-calculator",
    category: "math",
    applicationCategory: "DesignApplication",
    updatedAt: "2026-05-06",
    related: ["color-converter", "contrast-checker"],
    primaryKeyword: { en: "aspect ratio calculator", ja: "アスペクト比 計算" },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
