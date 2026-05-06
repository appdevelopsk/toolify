import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "pace-calculator",
    category: "health",
    applicationCategory: "HealthApplication",
    updatedAt: "2026-05-06",
    related: ["calorie-calculator", "speed-converter"],
    primaryKeyword: { en: "running pace calculator", ja: "ランニング ペース 計算" },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
