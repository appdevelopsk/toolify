"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

export default function EmergencyFundCalculator() {
  const t = useTranslations("tools.emergency-fund-calculator");
  const locale = useLocale();
  const [monthlyExpenses, setMonthlyExpenses] = useState("250000");
  const [months, setMonths] = useState("6");
  const [currentSavings, setCurrentSavings] = useState("500000");
  const [monthlyContribution, setMonthlyContribution] = useState("30000");

  const result = useMemo(() => {
    const e = parseFloat(monthlyExpenses);
    const m = parseFloat(months);
    const cs = parseFloat(currentSavings);
    const mc = parseFloat(monthlyContribution);
    if (![e, m, cs].every(isFinite) || e <= 0 || m <= 0) return null;
    const target = e * m;
    const gap = Math.max(0, target - cs);
    const progress = Math.min(100, (cs / target) * 100);
    let monthsToFill: number | null = null;
    if (gap > 0 && mc > 0) monthsToFill = Math.ceil(gap / mc);
    const targetDate = monthsToFill != null ? (() => { const d = new Date(); d.setMonth(d.getMonth() + monthsToFill); return d; })() : null;
    return { target, gap, progress, monthsToFill, targetDate, hasEnough: cs >= target };
  }, [monthlyExpenses, months, currentSavings, monthlyContribution]);

  const fmt = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }), [locale]);
  const fmtDate = useMemo(() => new Intl.DateTimeFormat(locale, { year: "numeric", month: "long" }), [locale]);

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">{t("input.monthlyExpenses")}</span>
          <input type="number" value={monthlyExpenses} onChange={(e) => setMonthlyExpenses(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 tabular-nums dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.months")}</span>
          <select value={months} onChange={(e) => setMonths(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
            <option value="3">3 ({t("monthsUnit")}) — {t("level.minimal")}</option>
            <option value="6">6 — {t("level.standard")}</option>
            <option value="9">9 — {t("level.cautious")}</option>
            <option value="12">12 — {t("level.conservative")}</option>
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.currentSavings")}</span>
          <input type="number" value={currentSavings} onChange={(e) => setCurrentSavings(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 tabular-nums dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.monthlyContribution")}</span>
          <input type="number" value={monthlyContribution} onChange={(e) => setMonthlyContribution(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 tabular-nums dark:border-slate-700 dark:bg-slate-900" />
        </label>
      </div>

      <div aria-live="polite" className="mt-6 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
        {result ? (
          <div>
            <div className={`rounded p-3 ${result.hasEnough ? "bg-emerald-50 dark:bg-emerald-900/20" : "bg-amber-50 dark:bg-amber-900/20"}`}>
              <div className="text-xs font-medium">
                {result.hasEnough ? "✓ " + t("result.complete") : t("result.target")}
              </div>
              <div className="tabular-nums text-3xl font-bold">{fmt.format(result.target)}</div>
            </div>
            <div className="mt-3">
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                <span>{t("result.progress")}</span>
                <span className="tabular-nums">{result.progress.toFixed(1)}%</span>
              </div>
              <div className="mt-1 h-3 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                <div className={result.hasEnough ? "h-full bg-emerald-500" : "h-full bg-amber-500"} style={{ width: `${result.progress}%` }} />
              </div>
            </div>
            <dl className="mt-4 grid gap-2 text-sm">
              <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800">
                <dt>{t("result.gap")}</dt>
                <dd className="tabular-nums">{fmt.format(result.gap)}</dd>
              </div>
              {result.monthsToFill != null && (
                <>
                  <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800">
                    <dt>{t("result.monthsToFill")}</dt>
                    <dd className="tabular-nums">{result.monthsToFill}</dd>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800">
                    <dt>{t("result.completeBy")}</dt>
                    <dd className="tabular-nums">{result.targetDate ? fmtDate.format(result.targetDate) : "—"}</dd>
                  </div>
                </>
              )}
            </dl>
          </div>
        ) : (
          <div className="text-sm text-slate-600 dark:text-slate-400">{t("empty")}</div>
        )}
      </div>
    </div>
  );
}
