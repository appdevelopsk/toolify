import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "leap-year-checker",
    category: "datetime",
    applicationCategory: "EducationApplication",
    updatedAt: "2026-05-07",
    related: ["age-calculator", "date-calculator"],
    primaryKeyword: { en: "leap year checker", ja: "うるう年 判定" },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
