import type { PromptDefinition } from "@/lib/prompts/types";

const def: PromptDefinition = {
  meta: {
    slug: "user-interview-script",
    category: "research",
    recommendedFor: ["claude", "chatgpt", "any"],
    updatedAt: "2026-05-08",
    related: ["research-summary", "meeting-prep"],
    primaryKeyword: {
      en: "user interview prompt",
      ja: "ユーザーインタビュー プロンプト",
      "zh-CN": "用户访谈 提示词",
      "zh-TW": "使用者訪談 提示詞",
      ko: "사용자 인터뷰 프롬프트",
      es: "prompt entrevista usuario",
    },
  },
};

export default def;
