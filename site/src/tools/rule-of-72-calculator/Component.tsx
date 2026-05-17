"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

export default function RuleOf72Calculator() {
  const t = useTranslations("tools.rule-of-72-calculator");
  const locale = useLocale();
  const [mode, setMode] = useState<"toYears" | "toRate">("toYears");
  const [rate, setRate] = useState("7");
  const [years, setYears] = useState("10");

  const result = useMemo(() => {
    if (mode === "toYears") {
      const r = parseFloat(rate);
      if (!isFinite(r) || r <= 0) return null;
      // Simple rule of 72
      const yearsToDouble = 72 / r;
      // Exact compound: years = ln(2) / ln(1 + r/100)
      const exact = Math.log(2) / Math.log(1 + r / 100);
      const error = ((yearsToDouble - exact) / exact) * 100;
      return { mode: "toYears" as const, rate: r, simple: yearsToDouble, exact, error };
    } else {
      const y = parseFloat(years);
      if (!isFinite(y) || y <= 0) return null;
      const rateNeeded = 72 / y;
      const exact = (Math.pow(2, 1 / y) - 1) * 100;
      const error = ((rateNeeded - exact) / exact) * 100;
      return { mode: "toRate" as const, years: y, simple: rateNeeded, exact, error };
    }
  }, [mode, rate, years]);

  const fmt = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }), [locale]);

  return (
    <div>
      <div className="mb-4 inline-flex rounded-lg border border-slate-300 p-1 dark:border-slate-700">
        <button
          onClick={() => setMode("toYears")}
          className={`rounded px-3 py-1 text-sm ${mode === "toYears" ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900" : ""}`}
        >
          {t("mode.toYears")}
        </button>
        <button
          onClick={() => setMode("toRate")}
          className={`rounded px-3 py-1 text-sm ${mode === "toRate" ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900" : ""}`}
        >
          {t("mode.toRate")}
        </button>
      </div>

      {mode === "toYears" ? (
        <label className="block">
          <span className="text-sm font-medium">{t("input.ratePct")}</span>
          <input
            type="number"
            inputMode="decimal"
            step="0.1"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-mono text-2xl tabular-nums dark:border-slate-700 dark:bg-slate-900"
          />
        </label>
      ) : (
        <label className="block">
          <span className="text-sm font-medium">{t("input.years")}</span>
          <input
            type="number"
            inputMode="decimal"
            step="0.5"
            value={years}
            onChange={(e) => setYears(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-mono text-2xl tabular-nums dark:border-slate-700 dark:bg-slate-900"
          />
        </label>
      )}

      <div aria-live="polite" className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
        {result ? (
          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800">
              <dt className="font-medium">{t(result.mode === "toYears" ? "result.yearsToDouble" : "result.rateNeeded")}</dt>
              <dd className="tabular-nums text-lg font-bold">
                {fmt.format(result.simple)}
                {result.mode === "toYears" ? " " + t("result.years") : "%"}
              </dd>
            </div>
            <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800">
              <dt>{t("result.exact")}</dt>
              <dd className="tabular-nums">
                {fmt.format(result.exact)}
                {result.mode === "toYears" ? " " + t("result.years") : "%"}
              </dd>
            </div>
            <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800 sm:col-span-2">
              <dt>{t("result.approxError")}</dt>
              <dd className="tabular-nums">{result.error >= 0 ? "+" : ""}{fmt.format(result.error)}%</dd>
            </div>
          </dl>
        ) : (
          <div className="text-sm text-slate-600 dark:text-slate-400">{t("empty")}</div>
        )}
      </div>
    </div>
  );
}
