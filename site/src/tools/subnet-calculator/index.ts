import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "subnet-calculator",
    category: "text",
    applicationCategory: "DeveloperApplication",
    updatedAt: "2026-05-07",
    related: ["url-encoder", "hash-generator", "uuid-generator"],
    primaryKeyword: {
      en: "subnet calculator",
      ja: "サブネット 計算",
      "zh-CN": "子网 计算器",
    },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
