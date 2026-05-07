import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "pomodoro-timer",
    category: "datetime",
    applicationCategory: "UtilitiesApplication",
    updatedAt: "2026-05-07",
    related: ["countdown-timer", "date-calculator"],
    primaryKeyword: { en: "pomodoro timer", ja: "ポモドーロタイマー" },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
