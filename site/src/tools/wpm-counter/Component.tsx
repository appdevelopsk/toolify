"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

const SAMPLE_TEXTS: Record<string, string> = {
  en: "The quick brown fox jumps over the lazy dog. Practice typing this sentence to measure your speed and accuracy.",
  ja: "速いキツネが怠け者の犬を飛び越えました。タイピング速度と正確さを測定するために、この文を入力してみてください。",
  "zh-CN": "敏捷的棕色狐狸跳过懒狗。练习打字这段以测量你的速度和准确度。",
};

export default function WpmCounter() {
  const t = useTranslations("tools.wpm-counter");
  const locale = useLocale();
  const sample = SAMPLE_TEXTS[locale] ?? SAMPLE_TEXTS.en!;
  const [target, setTarget] = useState(sample);
  const [typed, setTyped] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  function handleType(value: string) {
    if (startTime == null && value.length > 0) {
      setStartTime(Date.now());
    }
    setTyped(value);
    if (value === target && startTime) {
      setEndTime(Date.now());
    } else if (endTime != null) {
      setEndTime(null);
    }
  }

  function reset() {
    setTyped("");
    setStartTime(null);
    setEndTime(null);
    inputRef.current?.focus();
  }

  function newSample() {
    setTarget(SAMPLE_TEXTS[locale] ?? SAMPLE_TEXTS.en!);
    reset();
  }

  const stats = useMemo(() => {
    if (startTime == null) return null;
    const now = endTime ?? Date.now();
    const elapsedMin = Math.max((now - startTime) / 60000, 0.001);
    const charsTyped = typed.length;
    const wordsTyped = charsTyped / 5; // standard WPM convention
    const wpm = wordsTyped / elapsedMin;
    let correct = 0;
    for (let i = 0; i < typed.length; i++) {
      if (typed[i] === target[i]) correct++;
    }
    const accuracy = typed.length === 0 ? 100 : (correct / typed.length) * 100;
    const cpm = charsTyped / elapsedMin;
    const completed = typed === target;
    return { wpm, cpm, accuracy, elapsedSec: (now - startTime) / 1000, charsTyped, completed };
  }, [typed, target, startTime, endTime]);

  // Live update timer when typing
  const [, setTick] = useState(0);
  useEffect(() => {
    if (startTime == null || endTime != null) return;
    const id = setInterval(() => setTick((x) => x + 1), 200);
    return () => clearInterval(id);
  }, [startTime, endTime]);

  const fmt = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }), [locale]);

  return (
    <div>
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 font-mono text-base leading-relaxed dark:border-slate-800 dark:bg-slate-900">
        {Array.from(target).map((ch, i) => {
          const t = typed[i];
          let cls = "text-slate-400";
          if (t !== undefined) cls = t === ch ? "text-emerald-600 dark:text-emerald-400" : "bg-rose-200 text-rose-900 dark:bg-rose-800 dark:text-rose-100";
          if (i === typed.length) cls += " border-l-2 border-brand-500";
          return <span key={i} className={cls}>{ch}</span>;
        })}
      </div>

      <textarea
        ref={inputRef}
        value={typed}
        onChange={(e) => handleType(e.target.value)}
        autoFocus
        rows={3}
        placeholder={t("placeholder")}
        className="mt-3 w-full rounded border border-slate-300 px-3 py-2 font-mono text-base dark:border-slate-700 dark:bg-slate-900"
      />

      <div className="mt-3 flex flex-wrap gap-2">
        <button onClick={reset} className="rounded border border-slate-300 px-3 py-1 text-sm hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800">
          {t("reset")}
        </button>
        <button onClick={newSample} className="rounded border border-slate-300 px-3 py-1 text-sm hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800">
          {t("newSample")}
        </button>
      </div>

      <div aria-live="polite" className="mt-6 grid gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-slate-200 p-3 text-center dark:border-slate-800">
          <div className="text-xs text-slate-600 dark:text-slate-400">{t("result.wpm")}</div>
          <div className="text-3xl font-bold tabular-nums">{stats ? fmt.format(stats.wpm) : "—"}</div>
        </div>
        <div className="rounded-lg border border-slate-200 p-3 text-center dark:border-slate-800">
          <div className="text-xs text-slate-600 dark:text-slate-400">{t("result.cpm")}</div>
          <div className="text-3xl font-bold tabular-nums">{stats ? fmt.format(stats.cpm) : "—"}</div>
        </div>
        <div className="rounded-lg border border-slate-200 p-3 text-center dark:border-slate-800">
          <div className="text-xs text-slate-600 dark:text-slate-400">{t("result.accuracy")}</div>
          <div className="text-3xl font-bold tabular-nums">{stats ? `${fmt.format(stats.accuracy)}%` : "—"}</div>
        </div>
        <div className="rounded-lg border border-slate-200 p-3 text-center dark:border-slate-800">
          <div className="text-xs text-slate-600 dark:text-slate-400">{t("result.elapsed")}</div>
          <div className="text-3xl font-bold tabular-nums">{stats ? `${fmt.format(stats.elapsedSec)}s` : "—"}</div>
        </div>
      </div>
      {stats?.completed && (
        <div className="mt-3 rounded-lg border border-emerald-300 bg-emerald-50 p-3 text-center text-sm font-medium text-emerald-900 dark:border-emerald-900 dark:bg-emerald-900/20 dark:text-emerald-200">
          🎉 {t("completed")}
        </div>
      )}
    </div>
  );
}
