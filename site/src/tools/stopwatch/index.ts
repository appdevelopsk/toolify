import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "stopwatch",
    category: "datetime",
    applicationCategory: "UtilitiesApplication",
    updatedAt: "2026-05-08",
    related: ["countdown-timer", "pomodoro-timer", "wpm-counter"],
    primaryKeyword: { en: "stopwatch", ja: "ストップウォッチ" },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
