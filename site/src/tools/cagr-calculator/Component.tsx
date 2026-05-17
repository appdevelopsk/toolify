"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

export default function CagrCalculator() {
  const t = useTranslations("tools.cagr-calculator");
  const locale = useLocale();
  const [start, setStart] = useState("10000");
  const [end, setEnd] = useState("18000");
  const [years, setYears] = useState("5");

  const result = useMemo(() => {
    const s = parseFloat(start);
    const e = parseFloat(end);
    const y = parseFloat(years);
    if (!isFinite(s) || !isFinite(e) || !isFinite(y)) return null;
    if (s <= 0 || y <= 0) return null;
    const ratio = e / s;
    if (ratio <= 0) return null;
    const cagrPct = (Math.pow(ratio, 1 / y) - 1) * 100;
    const totalReturnPct = (ratio - 1) * 100;
    const absoluteGain = e - s;
    return { cagrPct, totalReturnPct, absoluteGain, multiplier: ratio };
  }, [start, end, years]);

  const fmtPct = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }), [locale]);
  const fmtNum = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }), [locale]);
  const fmtMul = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }), [locale]);

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="text-sm font-medium">{t("input.start")}</span>
          <input
            type="number"
            inputMode="decimal"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-mono tabular-nums dark:border-slate-700 dark:bg-slate-900"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.end")}</span>
          <input
            type="number"
            inputMode="decimal"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-mono tabular-nums dark:border-slate-700 dark:bg-slate-900"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.years")}</span>
          <input
            type="number"
            inputMode="decimal"
            step="0.1"
            value={years}
            onChange={(e) => setYears(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-mono tabular-nums dark:border-slate-700 dark:bg-slate-900"
          />
        </label>
      </div>

      <div aria-live="polite" className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
        {result ? (
          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800 sm:col-span-2">
              <dt className="font-medium">{t("result.cagr")}</dt>
              <dd className="tabular-nums text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {result.cagrPct >= 0 ? "+" : ""}{fmtPct.format(result.cagrPct)}%
              </dd>
            </div>
            <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800">
              <dt>{t("result.totalReturn")}</dt>
              <dd className="tabular-nums">{result.totalReturnPct >= 0 ? "+" : ""}{fmtPct.format(result.totalReturnPct)}%</dd>
            </div>
            <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800">
              <dt>{t("result.multiplier")}</dt>
              <dd className="tabular-nums">{fmtMul.format(result.multiplier)}×</dd>
            </div>
            <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800 sm:col-span-2">
              <dt>{t("result.absoluteGain")}</dt>
              <dd className="tabular-nums">{result.absoluteGain >= 0 ? "+" : ""}{fmtNum.format(result.absoluteGain)}</dd>
            </div>
          </dl>
        ) : (
          <div className="text-sm text-slate-600 dark:text-slate-400">{t("empty")}</div>
        )}
      </div>
    </div>
  );
}
