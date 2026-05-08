import type { PromptDefinition } from "@/lib/prompts/types";

const def: PromptDefinition = {
  meta: {
    slug: "research-summary",
    category: "research",
    recommendedFor: ["claude", "perplexity", "chatgpt"],
    updatedAt: "2026-05-08",
    related: ["code-review", "blog-outline"],
    primaryKeyword: {
      en: "research summary prompt",
      ja: "リサーチ要約 プロンプト",
      "zh-CN": "研究总结 提示词",
      "zh-TW": "研究摘要 提示詞",
      ko: "리서치 요약 프롬프트",
      es: "prompt resumen investigación",
    },
  },
};

export default def;
