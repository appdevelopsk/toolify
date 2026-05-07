import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "wpm-counter",
    category: "text",
    applicationCategory: "EducationApplication",
    updatedAt: "2026-05-07",
    related: ["word-counter", "character-frequency", "case-converter"],
    primaryKeyword: {
      en: "wpm counter",
      ja: "WPM タイピング 速度",
      "zh-CN": "WPM 打字 速度",
    },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
