import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "gcd-lcm-calculator",
    category: "math",
    applicationCategory: "EducationApplication",
    updatedAt: "2026-05-07",
    related: ["fraction-calculator", "prime-checker", "statistics-calculator"],
    primaryKeyword: {
      en: "gcd lcm calculator",
      ja: "最大公約数 最小公倍数",
      "zh-CN": "最大公约数 最小公倍数",
    },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
