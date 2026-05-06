import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "password-generator",
    category: "text",
    applicationCategory: "SecurityApplication",
    updatedAt: "2026-05-06",
    related: ["word-counter"],
    primaryKeyword: { en: "password generator", ja: "パスワード生成" },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
