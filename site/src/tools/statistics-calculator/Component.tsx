"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

function parseNumbers(input: string): number[] {
  return input
    .split(/[\s,;\t\n]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => parseFloat(s))
    .filter((n) => isFinite(n));
}

function median(sorted: number[]): number {
  const n = sorted.length;
  if (n === 0) return NaN;
  const mid = Math.floor(n / 2);
  return n % 2 === 0 ? (sorted[mid - 1]! + sorted[mid]!) / 2 : sorted[mid]!;
}

function modes(values: number[]): number[] {
  const counts = new Map<number, number>();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  let max = 0;
  for (const c of counts.values()) if (c > max) max = c;
  if (max < 2) return [];
  return [...counts.entries()].filter(([, c]) => c === max).map(([v]) => v).sort((a, b) => a - b);
}

export default function StatisticsCalculator() {
  const t = useTranslations("tools.statistics-calculator");
  const locale = useLocale();
  const [input, setInput] = useState("12, 15, 18, 22, 25, 25, 30, 35, 40");
  const [sampleMode, setSampleMode] = useState(true);

  const result = useMemo(() => {
    const xs = parseNumbers(input);
    if (xs.length === 0) return null;
    const sorted = [...xs].sort((a, b) => a - b);
    const sum = xs.reduce((s, v) => s + v, 0);
    const mean = sum / xs.length;
    const min = sorted[0]!;
    const max = sorted[sorted.length - 1]!;
    const range = max - min;
    const med = median(sorted);
    const md = modes(xs);
    const denom = sampleMode && xs.length > 1 ? xs.length - 1 : xs.length;
    const variance = xs.reduce((s, v) => s + (v - mean) ** 2, 0) / denom;
    const stdev = Math.sqrt(variance);
    const q1 = median(sorted.slice(0, Math.floor(sorted.length / 2)));
    const q3 = median(sorted.slice(Math.ceil(sorted.length / 2)));
    return { count: xs.length, sum, mean, min, max, range, median: med, modes: md, variance, stdev, q1, q3 };
  }, [input, sampleMode]);

  const fmt = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 4 }), [locale]);

  return (
    <div>
      <label className="block">
        <span className="text-sm font-medium">{t("input.values")}</span>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={4}
          placeholder={t("placeholder")}
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-mono text-sm tabular-nums dark:border-slate-700 dark:bg-slate-900"
        />
      </label>

      <label className="mt-3 inline-flex items-center gap-2 text-sm">
        <input type="checkbox" checked={sampleMode} onChange={(e) => setSampleMode(e.target.checked)} />
        <span>{t("input.sampleMode")}</span>
      </label>

      <div aria-live="polite" className="mt-6 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
        {result ? (
          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800"><dt>{t("result.count")}</dt><dd className="tabular-nums">{result.count}</dd></div>
            <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800"><dt>{t("result.sum")}</dt><dd className="tabular-nums">{fmt.format(result.sum)}</dd></div>
            <div className="flex justify-between rounded bg-emerald-50 px-2 py-1 dark:bg-emerald-900/20"><dt className="font-medium">{t("result.mean")}</dt><dd className="tabular-nums font-bold">{fmt.format(result.mean)}</dd></div>
            <div className="flex justify-between rounded bg-emerald-50 px-2 py-1 dark:bg-emerald-900/20"><dt className="font-medium">{t("result.median")}</dt><dd className="tabular-nums font-bold">{fmt.format(result.median)}</dd></div>
            <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800"><dt>{t("result.mode")}</dt><dd className="tabular-nums">{result.modes.length ? result.modes.map((m) => fmt.format(m)).join(", ") : t("result.none")}</dd></div>
            <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800"><dt>{t("result.range")}</dt><dd className="tabular-nums">{fmt.format(result.range)}</dd></div>
            <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800"><dt>{t("result.min")}</dt><dd className="tabular-nums">{fmt.format(result.min)}</dd></div>
            <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800"><dt>{t("result.max")}</dt><dd className="tabular-nums">{fmt.format(result.max)}</dd></div>
            <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800"><dt>{t("result.q1")}</dt><dd className="tabular-nums">{fmt.format(result.q1)}</dd></div>
            <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800"><dt>{t("result.q3")}</dt><dd className="tabular-nums">{fmt.format(result.q3)}</dd></div>
            <div className="flex justify-between rounded bg-amber-50 px-2 py-1 dark:bg-amber-900/20"><dt className="font-medium">{t("result.stdev")}</dt><dd className="tabular-nums font-bold">{fmt.format(result.stdev)}</dd></div>
            <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800"><dt>{t("result.variance")}</dt><dd className="tabular-nums">{fmt.format(result.variance)}</dd></div>
          </dl>
        ) : (
          <div className="text-sm text-slate-600 dark:text-slate-400">{t("empty")}</div>
        )}
      </div>
    </div>
  );
}
