"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

export default function RoiCalculator() {
  const t = useTranslations("tools.roi-calculator");
  const locale = useLocale();
  const [investment, setInvestment] = useState("100000");
  const [returns, setReturns] = useState("125000");
  const [holdYears, setHoldYears] = useState("2");

  const result = useMemo(() => {
    const inv = parseFloat(investment);
    const ret = parseFloat(returns);
    const yrs = parseFloat(holdYears);
    if (![inv, ret].every(isFinite) || inv <= 0) return null;
    const profit = ret - inv;
    const roi = (profit / inv) * 100;
    let annualized: number | null = null;
    if (isFinite(yrs) && yrs > 0) {
      annualized = (Math.pow(ret / inv, 1 / yrs) - 1) * 100;
    }
    return { profit, roi, annualized };
  }, [investment, returns, holdYears]);

  const fmt = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }), [locale]);

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="text-sm font-medium">{t("input.investment")}</span>
          <input type="number" value={investment} onChange={(e) => setInvestment(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 tabular-nums dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.returns")}</span>
          <input type="number" value={returns} onChange={(e) => setReturns(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 tabular-nums dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.holdYears")}</span>
          <input type="number" step="0.1" value={holdYears} onChange={(e) => setHoldYears(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 tabular-nums dark:border-slate-700 dark:bg-slate-900" />
        </label>
      </div>

      <div aria-live="polite" className="mt-6 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
        {result ? (
          <dl className="grid gap-2 text-sm">
            <div className={`flex justify-between rounded px-3 py-2 ${result.roi >= 0 ? "bg-emerald-50 dark:bg-emerald-900/20" : "bg-rose-50 dark:bg-rose-900/20"}`}>
              <dt className="font-medium">{t("result.roi")}</dt>
              <dd className="tabular-nums text-2xl font-bold">{fmt.format(result.roi)}%</dd>
            </div>
            {result.annualized != null && (
              <div className={`flex justify-between rounded px-3 py-2 ${result.annualized >= 0 ? "bg-emerald-50 dark:bg-emerald-900/20" : "bg-rose-50 dark:bg-rose-900/20"}`}>
                <dt className="font-medium">{t("result.annualized")}</dt>
                <dd className="tabular-nums text-2xl font-bold">{fmt.format(result.annualized)}%</dd>
              </div>
            )}
            <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800">
              <dt>{t("result.profit")}</dt>
              <dd className="tabular-nums">{fmt.format(result.profit)}</dd>
            </div>
          </dl>
        ) : (
          <div className="text-sm text-slate-500">{t("empty")}</div>
        )}
      </div>
    </div>
  );
}
