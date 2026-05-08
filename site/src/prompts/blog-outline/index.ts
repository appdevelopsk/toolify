import type { PromptDefinition } from "@/lib/prompts/types";

const def: PromptDefinition = {
  meta: {
    slug: "blog-outline",
    category: "writing",
    recommendedFor: ["claude", "chatgpt", "any"],
    updatedAt: "2026-05-08",
    related: ["email-rewriter", "research-summary"],
    primaryKeyword: {
      en: "blog outline prompt",
      ja: "ブログ アウトライン プロンプト",
      "zh-CN": "博客大纲 提示词",
      "zh-TW": "部落格大綱 提示詞",
      ko: "블로그 개요 프롬프트",
      es: "prompt esquema blog",
    },
  },
};

export default def;
