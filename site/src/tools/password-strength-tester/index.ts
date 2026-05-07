import type { ToolDefinition } from "@/lib/tools/types";
import Component from "./Component";

const def: ToolDefinition = {
  meta: {
    slug: "password-strength-tester",
    category: "text",
    applicationCategory: "DeveloperApplication",
    updatedAt: "2026-05-07",
    related: ["password-generator", "hash-generator", "uuid-generator"],
    primaryKeyword: {
      en: "password strength tester",
      ja: "パスワード 強度 判定",
      "zh-CN": "密码 强度 测试",
    },
    hasHowTo: true,
    hasFaq: true,
  },
  Component,
};

export default def;
