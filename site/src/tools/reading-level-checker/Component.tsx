"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

const READING_WPM = 238;

/** Count vowel groups as a syllable estimate for English/Latin text */
function countSyllablesEn(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (w.length === 0) return 0;
  if (w.length <= 3) return 1;
  // Remove trailing 'e' (silent e)
  const stripped = w.replace(/e$/, "");
  const vowelGroups = stripped.match(/[aeiouy]+/g);
  const count = vowelGroups ? vowelGroups.length : 1;
  return Math.max(1, count);
}

function countSyllables(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean);
  return words.reduce((sum, w) => sum + countSyllablesEn(w), 0);
}

function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).filter(Boolean).length;
}

function countSentences(text: string): number {
  if (!text.trim()) return 0;
  const matches = text.match(/[^.!?]+[.!?]+/g);
  return matches ? matches.length : (text.trim().length > 0 ? 1 : 0);
}

function countCharsNoSpaces(text: string): number {
  return text.replace(/\s/g, "").length;
}

interface Stats {
  words: number;
  sentences: number;
  syllables: number;
  fleschEase: number | null;
  fkGrade: number | null;
  readingTimeSec: number;
  avgSentenceLength: number | null;
  avgWordLength: number | null;
}

function computeStats(text: string): Stats {
  const words = countWords(text);
  const sentences = countSentences(text);
  const syllables = countSyllables(text);
  const charsNoSpaces = countCharsNoSpaces(text);

  const readingTimeSec = words > 0 ? (words / READING_WPM) * 60 : 0;

  if (words === 0 || sentences === 0) {
    return {
      words,
      sentences,
      syllables,
      fleschEase: null,
      fkGrade: null,
      readingTimeSec,
      avgSentenceLength: null,
      avgWordLength: null,
    };
  }

  const wordsPerSentence = words / sentences;
  const syllablesPerWord = syllables / words;

  const fleschEase = 206.835 - 1.015 * wordsPerSentence - 84.6 * syllablesPerWord;
  const fkGrade = 0.39 * wordsPerSentence + 11.8 * syllablesPerWord - 15.59;
  const avgSentenceLength = wordsPerSentence;
  const avgWordLength = charsNoSpaces / words;

  return { words, sentences, syllables, fleschEase, fkGrade, readingTimeSec, avgSentenceLength, avgWordLength };
}

function fleschColorClass(score: number | null): string {
  if (score === null) return "text-slate-500";
  if (score >= 90) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 80) return "text-green-600 dark:text-green-400";
  if (score >= 70) return "text-lime-600 dark:text-lime-400";
  if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
  if (score >= 50) return "text-orange-500 dark:text-orange-400";
  return "text-red-600 dark:text-red-400";
}

function formatReadingTime(sec: number, t: (key: string) => string): string {
  if (sec <= 0) return `0 ${t("unit.sec")}`;
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  if (m === 0) return `${s} ${t("unit.sec")}`;
  if (s === 0) return `${m} ${t("unit.min")}`;
  return `${m} ${t("unit.min")} ${s} ${t("unit.sec")}`;
}

function isCjkLocale(locale: string): boolean {
  return locale.startsWith("ja") || locale.startsWith("zh") || locale.startsWith("ko") || locale.startsWith("th") || locale.startsWith("ar") || locale.startsWith("hi");
}

export default function ReadingLevelChecker() {
  const t = useTranslations("tools.reading-level-checker");
  const locale = useLocale();
  const [text, setText] = useState("");

  const stats = useMemo(() => computeStats(text), [text]);
  const fmt = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }), [locale]);
  const fmtInt = useMemo(() => new Intl.NumberFormat(locale), [locale]);

  const fleschLabel = useMemo(() => {
    const s = stats.fleschEase;
    if (s === null) return "—";
    if (s >= 90) return t("level.veryEasy");
    if (s >= 80) return t("level.easy");
    if (s >= 70) return t("level.fairlyEasy");
    if (s >= 60) return t("level.standard");
    if (s >= 50) return t("level.fairlyDifficult");
    if (s >= 30) return t("level.difficult");
    return t("level.veryConfusing");
  }, [stats.fleschEase, t]);

  const gradeLabel = useMemo(() => {
    const g = stats.fkGrade;
    if (g === null) return "—";
    if (g < 1) return t("grade.kindergarten");
    if (g < 6) return t("grade.elementary");
    if (g < 9) return t("grade.middleSchool");
    if (g < 13) return t("grade.highSchool");
    if (g < 17) return t("grade.college");
    return t("grade.professional");
  }, [stats.fkGrade, t]);

  const colorClass = fleschColorClass(stats.fleschEase);
  const showCjkNote = isCjkLocale(locale) && text.trim().length > 0;

  return (
    <div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t("placeholder")}
        rows={10}
        className="w-full rounded border border-slate-300 px-3 py-2 font-mono text-sm dark:border-slate-700 dark:bg-slate-900"
      />

      {showCjkNote && (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{t("cjkNote")}</p>
      )}

      <div aria-live="polite" className="mt-4 space-y-4">
        {/* Primary scores */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="col-span-2 rounded-lg border border-slate-200 p-4 dark:border-slate-800 sm:col-span-2">
            <div className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">{t("stat.fleschEase")}</div>
            <div className={`mt-1 text-3xl font-bold tabular-nums ${colorClass}`}>
              {stats.fleschEase !== null ? fmt.format(stats.fleschEase) : "—"}
            </div>
            <div className={`mt-1 text-sm font-medium ${colorClass}`}>{fleschLabel}</div>
          </div>
          <div className="col-span-2 rounded-lg border border-slate-200 p-4 dark:border-slate-800 sm:col-span-2">
            <div className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">{t("stat.fkGrade")}</div>
            <div className="mt-1 text-3xl font-bold tabular-nums">
              {stats.fkGrade !== null ? fmt.format(stats.fkGrade) : "—"}
            </div>
            <div className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-400">{gradeLabel}</div>
          </div>
        </div>

        {/* Secondary stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded border border-slate-200 p-3 dark:border-slate-800">
            <div className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">{t("stat.words")}</div>
            <div className="mt-1 text-2xl font-bold tabular-nums">{fmtInt.format(stats.words)}</div>
          </div>
          <div className="rounded border border-slate-200 p-3 dark:border-slate-800">
            <div className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">{t("stat.sentences")}</div>
            <div className="mt-1 text-2xl font-bold tabular-nums">{fmtInt.format(stats.sentences)}</div>
          </div>
          <div className="rounded border border-slate-200 p-3 dark:border-slate-800">
            <div className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">{t("stat.syllables")}</div>
            <div className="mt-1 text-2xl font-bold tabular-nums">{fmtInt.format(stats.syllables)}</div>
          </div>
          <div className="rounded border border-slate-200 p-3 dark:border-slate-800">
            <div className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">{t("stat.readingTime")}</div>
            <div className="mt-1 text-lg font-bold tabular-nums">{formatReadingTime(stats.readingTimeSec, t)}</div>
          </div>
          <div className="rounded border border-slate-200 p-3 dark:border-slate-800">
            <div className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">{t("stat.avgSentenceLength")}</div>
            <div className="mt-1 text-2xl font-bold tabular-nums">
              {stats.avgSentenceLength !== null ? fmt.format(stats.avgSentenceLength) : "—"}
            </div>
          </div>
          <div className="rounded border border-slate-200 p-3 dark:border-slate-800">
            <div className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">{t("stat.avgWordLength")}</div>
            <div className="mt-1 text-2xl font-bold tabular-nums">
              {stats.avgWordLength !== null ? fmt.format(stats.avgWordLength) : "—"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
