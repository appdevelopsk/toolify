import type { PromptDefinition } from "@/lib/prompts/types";

const def: PromptDefinition = {
  meta: {
    slug: "meeting-prep",
    category: "business",
    recommendedFor: ["chatgpt", "claude", "any"],
    updatedAt: "2026-05-08",
    related: ["email-rewriter", "research-summary"],
    primaryKeyword: {
      en: "meeting prep prompt",
      ja: "会議準備 プロンプト",
      "zh-CN": "会议准备 提示词",
      "zh-TW": "會議準備 提示詞",
      ko: "회의 준비 프롬프트",
      es: "prompt preparación reunión",
    },
  },
};

export default def;
