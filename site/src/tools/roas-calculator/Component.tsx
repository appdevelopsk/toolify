"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

export default function RoasCalculator() {
  const t = useTranslations("tools.roas-calculator");
  const locale = useLocale();
  const [revenue, setRevenue] = useState("50000");
  const [adSpend, setAdSpend] = useState("10000");
  const [grossMarginPct, setGrossMarginPct] = useState("60");

  const result = useMemo(() => {
    const r = parseFloat(revenue);
    const s = parseFloat(adSpend);
    const m = parseFloat(grossMarginPct);
    if (!isFinite(r) || !isFinite(s) || s <= 0) return null;
    const roas = r / s;
    const roasPct = (roas - 1) * 100;
    const grossProfit = r * (m / 100);
    const profitableRoas = grossProfit / s; // ROAS in profit terms
    const netProfit = grossProfit - s;
    const breakeven = isFinite(m) && m > 0 ? 100 / m : null;
    return { roas, roasPct, grossProfit, profitableRoas, netProfit, breakeven };
  }, [revenue, adSpend, grossMarginPct]);

  const fmtX = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }), [locale]);
  const fmt0 = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }), [locale]);

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block">
          <span className="text-sm font-medium">{t("input.revenue")}</span>
          <input type="number" inputMode="decimal" value={revenue} onChange={(e) => setRevenue(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-mono tabular-nums dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.adSpend")}</span>
          <input type="number" inputMode="decimal" value={adSpend} onChange={(e) => setAdSpend(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-mono tabular-nums dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.grossMarginPct")}</span>
          <input type="number" inputMode="decimal" step="1" value={grossMarginPct} onChange={(e) => setGrossMarginPct(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-mono tabular-nums dark:border-slate-700 dark:bg-slate-900" />
        </label>
      </div>

      <div aria-live="polite" className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
        {result ? (
          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            <div className="flex justify-between border-b border-slate-200/60 py-1 sm:col-span-2">
              <dt className="font-medium">{t("result.roas")}</dt>
              <dd className="tabular-nums text-2xl font-bold">{fmtX.format(result.roas)}× ({result.roasPct >= 0 ? "+" : ""}{fmtX.format(result.roasPct)}%)</dd>
            </div>
            <div className="flex justify-between border-b border-slate-200/60 py-1">
              <dt>{t("result.grossProfit")}</dt>
              <dd className="tabular-nums">{fmt0.format(result.grossProfit)}</dd>
            </div>
            <div className="flex justify-between border-b border-slate-200/60 py-1">
              <dt>{t("result.profitableRoas")}</dt>
              <dd className="tabular-nums">{fmtX.format(result.profitableRoas)}×</dd>
            </div>
            <div className={`flex justify-between border-b py-1 sm:col-span-2 ${result.netProfit >= 0 ? "border-emerald-300" : "border-rose-300"}`}>
              <dt>{t("result.netProfit")}</dt>
              <dd className={`tabular-nums text-lg ${result.netProfit >= 0 ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400"}`}>
                {result.netProfit >= 0 ? "+" : ""}{fmt0.format(result.netProfit)}
              </dd>
            </div>
            {result.breakeven !== null && (
              <div className="flex justify-between border-b border-slate-200/60 py-1 sm:col-span-2">
                <dt>{t("result.breakeven")}</dt>
                <dd className="tabular-nums">{fmtX.format(result.breakeven)}×</dd>
              </div>
            )}
          </dl>
        ) : <div className="text-sm text-slate-500">{t("empty")}</div>}
      </div>
    </div>
  );
}
