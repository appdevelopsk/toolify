import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "gpa-calculator",
    category: "math",
    applicationCategory: "EducationApplication",
    updatedAt: "2026-05-06",
    related: ["percentage-calculator"],
    primaryKeyword: { en: "GPA calculator", ja: "GPA 計算" },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
