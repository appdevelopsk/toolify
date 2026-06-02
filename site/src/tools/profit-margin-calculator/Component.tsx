"use client";

import { useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";

export default function ProfitMarginCalculator() {
  const t = useTranslations("tools.profit-margin-calculator");
  const locale = useLocale();
  const [cost, setCost] = useState("");
  const [revenue, setRevenue] = useState("");

  const result = useMemo(() => {
    const c = parseFloat(cost);
    const r = parseFloat(revenue);
    if (!isFinite(c) || !isFinite(r) || c < 0 || r < 0) return null;
    const profit = r - c;
    return {
      profit,
      margin: r > 0 ? (profit / r) * 100 : null,
      markup: c > 0 ? (profit / c) * 100 : null,
    };
  }, [cost, revenue]);

  const num = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }), [locale]);
  const pct = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }), [locale]);

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">{t("input.cost")}</span>
          <input
            inputMode="decimal"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            placeholder="40"
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.revenue")}</span>
          <input
            inputMode="decimal"
            value={revenue}
            onChange={(e) => setRevenue(e.target.value)}
            placeholder="100"
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          />
        </label>
      </div>

      <div className="mt-6 rounded-lg bg-brand-50 p-4 dark:bg-slate-800">
        {result === null ? (
          <p className="text-slate-600 dark:text-slate-400">{t("result.empty")}</p>
        ) : (
          <dl className="grid gap-3 sm:grid-cols-3">
            <div>
              <dt className="text-sm text-slate-600 dark:text-slate-400">{t("result.margin")}</dt>
              <dd className="text-2xl font-bold">{result.margin === null ? "—" : `${pct.format(result.margin)}%`}</dd>
            </div>
            <div>
              <dt className="text-sm text-slate-600 dark:text-slate-400">{t("result.markup")}</dt>
              <dd className="text-2xl font-bold">{result.markup === null ? "—" : `${pct.format(result.markup)}%`}</dd>
            </div>
            <div>
              <dt className="text-sm text-slate-600 dark:text-slate-400">{t("result.profit")}</dt>
              <dd className="text-2xl font-bold">{num.format(result.profit)}</dd>
            </div>
          </dl>
        )}
      </div>
    </div>
  );
}
