"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

function isLeap(y: number): boolean {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}

function nextLeap(y: number): number {
  let n = y + 1;
  while (!isLeap(n)) n++;
  return n;
}

function prevLeap(y: number): number {
  let p = y - 1;
  while (!isLeap(p)) p--;
  return p;
}

export default function LeapYearChecker() {
  const t = useTranslations("tools.leap-year-checker");
  const locale = useLocale();
  const [year, setYear] = useState(String(new Date().getFullYear()));

  const result = useMemo(() => {
    const y = parseInt(year, 10);
    if (!isFinite(y)) return null;
    const leap = isLeap(y);
    return {
      year: y,
      leap,
      reason: y % 400 === 0 ? "div400" : y % 100 === 0 ? "div100" : y % 4 === 0 ? "div4" : "notDiv4",
      next: nextLeap(y),
      prev: prevLeap(y),
      febDays: leap ? 29 : 28,
      yearDays: leap ? 366 : 365,
    };
  }, [year]);

  const fmt = useMemo(() => new Intl.NumberFormat(locale), [locale]);

  return (
    <div>
      <label className="block">
        <span className="text-sm font-medium">{t("input.year")}</span>
        <input
          type="number"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-mono text-2xl tabular-nums dark:border-slate-700 dark:bg-slate-900"
        />
      </label>

      <div className="mt-3 flex flex-wrap gap-2">
        {[2000, 2024, 2025, 2100, 2400].map((y) => (
          <button
            key={y}
            onClick={() => setYear(String(y))}
            className="rounded border border-slate-300 px-3 py-1 text-sm hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            {y}
          </button>
        ))}
      </div>

      <div aria-live="polite" className={`mt-6 rounded-lg border p-4 ${result ? (result.leap ? "border-emerald-300 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-900/20" : "border-amber-300 bg-amber-50 dark:border-amber-900 dark:bg-amber-900/20") : "border-slate-200 dark:border-slate-800"}`}>
        {result ? (
          <>
            <div className="flex items-center gap-2">
              <span className={`text-3xl ${result.leap ? "text-emerald-600 dark:text-emerald-400" : "text-amber-700 dark:text-amber-400"}`}>
                {result.leap ? "✓" : "✗"}
              </span>
              <div>
                <div className="text-2xl font-bold">
                  {fmt.format(result.year)} {t(result.leap ? "result.isLeap" : "result.notLeap")}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">{t(`reason.${result.reason}`)}</div>
              </div>
            </div>
            <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
              <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800"><dt>{t("result.yearDays")}</dt><dd className="tabular-nums">{result.yearDays}</dd></div>
              <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800"><dt>{t("result.febDays")}</dt><dd className="tabular-nums">{result.febDays}</dd></div>
              <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800"><dt>{t("result.prevLeap")}</dt><dd className="tabular-nums">{fmt.format(result.prev)}</dd></div>
              <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800"><dt>{t("result.nextLeap")}</dt><dd className="tabular-nums">{fmt.format(result.next)}</dd></div>
            </dl>
          </>
        ) : (
          <div className="text-sm text-slate-600 dark:text-slate-400">{t("empty")}</div>
        )}
      </div>
    </div>
  );
}
