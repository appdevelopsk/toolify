import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "device-info-checker",
    category: "text",
    applicationCategory: "DeveloperApplication",
    updatedAt: "2026-05-07",
    related: ["aspect-ratio-calculator", "color-converter", "url-encoder"],
    primaryKeyword: {
      en: "device info checker",
      ja: "PC 情報 表示",
      "zh-CN": "PC 信息 查看",
    },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
