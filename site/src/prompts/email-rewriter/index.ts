import type { PromptDefinition } from "@/lib/prompts/types";

const def: PromptDefinition = {
  meta: {
    slug: "email-rewriter",
    category: "writing",
    recommendedFor: ["chatgpt", "claude", "any"],
    updatedAt: "2026-05-08",
    related: ["meeting-prep", "blog-outline"],
    primaryKeyword: {
      en: "email rewriter prompt",
      ja: "メール書き直し プロンプト",
      "zh-CN": "邮件改写 提示词",
      "zh-TW": "電郵改寫 提示詞",
      ko: "이메일 다시쓰기 프롬프트",
      es: "prompt reescribir email",
    },
  },
};

export default def;
