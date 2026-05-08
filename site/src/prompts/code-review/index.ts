import type { PromptDefinition } from "@/lib/prompts/types";

const def: PromptDefinition = {
  meta: {
    slug: "code-review",
    category: "coding",
    recommendedFor: ["claude", "chatgpt", "cursor"],
    updatedAt: "2026-05-08",
    related: ["research-summary", "blog-outline"],
    primaryKeyword: {
      en: "code review prompt",
      ja: "コードレビュー プロンプト",
      "zh-CN": "代码审查 提示词",
      "zh-TW": "程式碼審查 提示詞",
      ko: "코드 리뷰 프롬프트",
      es: "prompt revisión código",
    },
  },
};

export default def;
