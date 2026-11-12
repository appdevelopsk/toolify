import React from "react";
/** Curated topic links for a few related prompt templates. No embed or tracking. */
// Keep the destinations public and stable, with no personal data in UTM parameters.
// Do not turn this into a generic CTA across unrelated tools/prompts.
const BLOG_OUTLINE_DISCUSSION = "https://nattzy.com/t/how-do-you-write-prompts-that-stop-ai-chatbots-from-giving-generic-empty-answers/149?utm_source=toolify365&utm_medium=editorial&utm_campaign=prompt_discussion";
const PROMPT_CLINIC_DISCUSSION = "https://nattzy.com/t/prompt-clinic-turn-a-vague-ai-answer-into-an-actionable-plan/1958?utm_source=toolify365&utm_medium=editorial&utm_campaign=prompt_discussion";
const DISCUSSION_LABEL: Record<string, string> = {
  "en": "Compare prompt-writing techniques in the Nattzy discussion",
  "ja": "Nattzyでプロンプトの改善方法を議論する",
  "zh-CN": "在 Nattzy 讨论如何改进提示词",
  "zh-TW": "在 Nattzy 討論如何改善提示詞",
  "ko": "Nattzy에서 프롬프트 개선 방법 토론하기",
  "es": "Debatir cómo mejorar los prompts en Nattzy",
  "pt-BR": "Discutir como melhorar prompts no Nattzy",
  "fr": "Discuter des techniques de prompt sur Nattzy",
  "de": "Über bessere Prompts auf Nattzy diskutieren",
  "it": "Discuti come migliorare i prompt su Nattzy",
  "ru": "Обсудить улучшение промптов на Nattzy",
  "ar": "ناقش تحسين المطالبات على Nattzy",
  "hi": "Nattzy पर बेहतर प्रॉम्प्ट लिखने पर चर्चा करें",
  "id": "Diskusikan cara memperbaiki prompt di Nattzy",
  "th": "พูดคุยวิธีปรับปรุงพรอมป์ต์บน Nattzy",
  "vi": "Thảo luận cách cải thiện prompt trên Nattzy",
  "tr": "Nattzy'de daha iyi istemler yazmayı tartışın"
};

export function NattzyPromptDiscussion({ slug, locale }: { slug: string; locale: string }) {
  const discussionUrl =
    slug === "blog-outline"
      ? BLOG_OUTLINE_DISCUSSION
      : slug === "code-review" || slug === "research-summary"
        ? `${PROMPT_CLINIC_DISCUSSION}&utm_content=${slug}`
        : null;
  if (!discussionUrl) return null;
  return (
    <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
      <a
        href={discussionUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium underline underline-offset-2 hover:text-brand-600"
      >
        {DISCUSSION_LABEL[locale] ?? DISCUSSION_LABEL.en}
      </a>
    </p>
  );
}
