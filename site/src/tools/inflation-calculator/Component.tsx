"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

export default function InflationCalculator() {
  const t = useTranslations("tools.inflation-calculator");
  const locale = useLocale();
  const [amount, setAmount] = useState("100000");
  const [years, setYears] = useState("20");
  const [inflationPct, setInflationPct] = useState("2.5");

  const result = useMemo(() => {
    const a = parseFloat(amount);
    const y = parseFloat(years);
    const i = parseFloat(inflationPct) / 100;
    if (![a, y].every(isFinite) || !isFinite(i)) return null;
    const futureValue = a * Math.pow(1 + i, y);
    const presentValue = a / Math.pow(1 + i, y);
    const lostPurchasingPower = a - presentValue;
    const lostPct = (lostPurchasingPower / a) * 100;
    return { futureValue, presentValue, lostPurchasingPower, lostPct };
  }, [amount, years, inflationPct]);

  const fmt = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }), [locale]);
  const fmtPct = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }), [locale]);

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="text-sm font-medium">{t("input.amount")}</span>
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 tabular-nums dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.years")}</span>
          <input type="number" value={years} onChange={(e) => setYears(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 tabular-nums dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.inflationPct")}</span>
          <input type="number" step="0.1" value={inflationPct} onChange={(e) => setInflationPct(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 tabular-nums dark:border-slate-700 dark:bg-slate-900" />
        </label>
      </div>

      <div aria-live="polite" className="mt-6 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
        {result ? (
          <dl className="grid gap-3 text-sm">
            <div className="rounded bg-amber-50 px-3 py-2 dark:bg-amber-900/20">
              <dt className="text-xs font-medium text-amber-900 dark:text-amber-200">{t("result.futureValue")}</dt>
              <dd className="tabular-nums text-2xl font-bold">{fmt.format(result.futureValue)}</dd>
              <dd className="text-xs text-slate-600 dark:text-slate-400">{t("result.futureNote")}</dd>
            </div>
            <div className="rounded bg-rose-50 px-3 py-2 dark:bg-rose-900/20">
              <dt className="text-xs font-medium text-rose-900 dark:text-rose-200">{t("result.presentValue")}</dt>
              <dd className="tabular-nums text-2xl font-bold">{fmt.format(result.presentValue)}</dd>
              <dd className="text-xs text-slate-600 dark:text-slate-400">{t("result.presentNote")}</dd>
            </div>
            <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800"><dt>{t("result.lostPurchasingPower")}</dt><dd className="tabular-nums">{fmt.format(result.lostPurchasingPower)}</dd></div>
            <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800"><dt>{t("result.lostPct")}</dt><dd className="tabular-nums">{fmtPct.format(result.lostPct)}%</dd></div>
          </dl>
        ) : (
          <div className="text-sm text-slate-500">{t("empty")}</div>
        )}
      </div>
    </div>
  );
}
