"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

const READING_WPM = 200;
const SPEAKING_WPM = 130;

function countWords(text: string, locale: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  // For CJK locales, count each ideograph as one "word"; whitespace-separated for others
  if (locale.startsWith("ja") || locale.startsWith("zh") || locale.startsWith("ko") || locale.startsWith("th")) {
    const cjk = trimmed.match(/[぀-ヿ㐀-䶿一-鿿豈-﫿가-힯]/g) ?? [];
    const nonCjk = trimmed.replace(/[぀-ヿ㐀-䶿一-鿿豈-﫿가-힯]/g, " ");
    const latinWords = nonCjk.split(/\s+/).filter(Boolean).length;
    return cjk.length + latinWords;
  }
  return trimmed.split(/\s+/).filter(Boolean).length;
}

function countSentences(text: string): number {
  if (!text.trim()) return 0;
  const matches = text.match(/[^.!?。！？]+[.!?。！？]+/g);
  return matches ? matches.length : 1;
}

function countParagraphs(text: string): number {
  if (!text.trim()) return 0;
  return text.split(/\n\s*\n/).filter((p) => p.trim()).length;
}

export default function WordCounter() {
  const t = useTranslations("tools.word-counter");
  const locale = useLocale();
  const [text, setText] = useState("");

  const stats = useMemo(() => {
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, "").length;
    const words = countWords(text, locale);
    const sentences = countSentences(text);
    const paragraphs = countParagraphs(text);
    const readingTime = Math.max(0, Math.ceil(words / READING_WPM));
    const speakingTime = Math.max(0, Math.ceil(words / SPEAKING_WPM));
    return { characters, charactersNoSpaces, words, sentences, paragraphs, readingTime, speakingTime };
  }, [text, locale]);

  const fmt = useMemo(() => new Intl.NumberFormat(locale), [locale]);

  return (
    <div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t("placeholder")}
        rows={10}
        className="w-full rounded border border-slate-300 px-3 py-2 font-mono text-sm dark:border-slate-700 dark:bg-slate-900"
      />
      <dl aria-live="polite" className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(
          [
            ["words", stats.words],
            ["characters", stats.characters],
            ["charactersNoSpaces", stats.charactersNoSpaces],
            ["sentences", stats.sentences],
            ["paragraphs", stats.paragraphs],
            ["readingTime", stats.readingTime],
            ["speakingTime", stats.speakingTime],
          ] as const
        ).map(([key, value]) => (
          <div key={key} className="rounded border border-slate-200 p-3 dark:border-slate-800">
            <dt className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">{t(`stat.${key}`)}</dt>
            <dd className="mt-1 text-2xl font-bold tabular-nums">
              {fmt.format(value)}
              {(key === "readingTime" || key === "speakingTime") && (
                <span className="ml-1 text-sm font-normal text-slate-600 dark:text-slate-400">{t("unit.min")}</span>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
