"use client";

import { useEffect, useRef, useState } from "react";

/**
 * nattzy.com (Discourse) 埋め込みコメント欄。
 * コメントは nattzy 側にトピックとして作られ、返信ユーザーは nattzy の
 * 登録ユーザーになる（フォーラムへの変換導線）。
 *
 * - スレッドは全ロケール共有: embedUrl は常に /en/ の canonical
 * - iframe はビューポート到達時に遅延ロード（LCP/転送量に影響させない）
 */
const HEADING: Record<string, string> = {
  en: "Comments & questions",
  ja: "コメント・質問",
  "zh-CN": "评论与提问",
  "zh-TW": "留言與提問",
  ko: "댓글 및 질문",
  es: "Comentarios y preguntas",
  "pt-BR": "Comentários e perguntas",
  fr: "Commentaires et questions",
  de: "Kommentare & Fragen",
  it: "Commenti e domande",
  ru: "Комментарии и вопросы",
  ar: "التعليقات والأسئلة",
  hi: "टिप्पणियाँ और प्रश्न",
  id: "Komentar & pertanyaan",
  th: "ความคิดเห็นและคำถาม",
  vi: "Bình luận & câu hỏi",
  tr: "Yorumlar ve sorular",
};

// Only the specifically relevant blog-outline prompt receives this optional forum link.
// Keep its destination first-party-network, public, and free of user identifiers.
const BLOG_OUTLINE_DISCUSSION = "https://nattzy.com/t/how-do-you-write-prompts-that-stop-ai-chatbots-from-giving-generic-empty-answers/149?utm_source=toolify365&utm_medium=editorial&utm_campaign=prompt_discussion";
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

const FORUM_URL = "https://nattzy.com/";
const SITE_URL = "https://toolify365.com";

interface Props {
  /** ロケールを除いたパス（例: "/tools/word-counter"） */
  path: string;
  locale: string;
}

export function NattzyComments({ path, locale }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "600px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const w = window as typeof window & {
      DiscourseEmbed?: { discourseUrl: string; discourseEmbedUrl: string };
    };
    w.DiscourseEmbed = {
      discourseUrl: FORUM_URL,
      // 全ロケール共通スレッド（en canonical）
      discourseEmbedUrl: `${SITE_URL}/en${path}`,
    };
    const s = document.createElement("script");
    s.src = `${FORUM_URL}javascripts/embed.js`;
    s.async = true;
    document.body.appendChild(s);
    return () => {
      s.remove();
    };
  }, [visible, path]);

  return (
    <section ref={ref} className="mx-auto my-10 max-w-3xl px-4">
      <h2 className="mb-4 text-lg font-bold">{HEADING[locale] ?? HEADING.en}</h2>
      {path === "/prompts/blog-outline" && (
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
          <a
            href={BLOG_OUTLINE_DISCUSSION}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-blue-600 dark:hover:text-blue-400"
          >
            {DISCUSSION_LABEL[locale] ?? DISCUSSION_LABEL.en}
          </a>
        </p>
      )}
      <div id="discourse-comments" />
    </section>
  );
}
