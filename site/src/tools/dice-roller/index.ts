import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "dice-roller",
    category: "math",
    applicationCategory: "GameApplication",
    updatedAt: "2026-05-07",
    related: ["random-number-generator", "uuid-generator"],
    primaryKeyword: { en: "dice roller", ja: "サイコロ" },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
