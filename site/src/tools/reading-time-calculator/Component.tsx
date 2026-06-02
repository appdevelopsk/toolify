"use client";

import { useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";

const SPEEDS = [150, 200, 250, 300] as const;

export default function ReadingTimeCalculator() {
  const t = useTranslations("tools.reading-time-calculator");
  const locale = useLocale();
  const [words, setWords] = useState("");
  const [speed, setSpeed] = useState<number>(250);

  const result = useMemo(() => {
    const w = parseFloat(words);
    if (!isFinite(w) || w <= 0) return null;
    const totalSeconds = Math.round((w / speed) * 60);
    return { minutes: Math.floor(totalSeconds / 60), seconds: totalSeconds % 60 };
  }, [words, speed]);

  const fmt = useMemo(() => new Intl.NumberFormat(locale), [locale]);

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">{t("input.words")}</span>
          <input
            inputMode="numeric"
            value={words}
            onChange={(e) => setWords(e.target.value)}
            placeholder="1000"
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.speed")}</span>
          <select
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          >
            {SPEEDS.map((s) => (
              <option key={s} value={s}>
                {`${s} wpm`}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-6 rounded-lg bg-brand-50 p-4 dark:bg-slate-800">
        {result === null ? (
          <p className="text-slate-600 dark:text-slate-400">{t("result.empty")}</p>
        ) : (
          <>
            <p className="text-sm text-slate-600 dark:text-slate-400">{t("result.label")}</p>
            <p className="text-3xl font-bold">
              {t("result.value", { minutes: result.minutes, seconds: result.seconds })}
            </p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              {t("result.note", { words: fmt.format(parseFloat(words)), speed })}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
