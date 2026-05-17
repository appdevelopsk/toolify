"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

export default function SimpleInterestCalculator() {
  const t = useTranslations("tools.simple-interest-calculator");
  const locale = useLocale();
  const [principal, setPrincipal] = useState("10000");
  const [ratePct, setRatePct] = useState("5");
  const [years, setYears] = useState("3");

  const result = useMemo(() => {
    const p = parseFloat(principal);
    const r = parseFloat(ratePct);
    const y = parseFloat(years);
    if (![p, r, y].every(isFinite) || p < 0 || r < 0 || y < 0) return null;
    const interest = (p * r * y) / 100;
    const total = p + interest;
    return { interest, total };
  }, [principal, ratePct, years]);

  const fmt = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }), [locale]);

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="text-sm font-medium">{t("input.principal")}</span>
          <input type="number" value={principal} onChange={(e) => setPrincipal(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 tabular-nums dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.ratePct")}</span>
          <input type="number" step="0.1" value={ratePct} onChange={(e) => setRatePct(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 tabular-nums dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.years")}</span>
          <input type="number" step="0.1" value={years} onChange={(e) => setYears(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 tabular-nums dark:border-slate-700 dark:bg-slate-900" />
        </label>
      </div>

      <div aria-live="polite" className="mt-6 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
        {result ? (
          <dl className="grid gap-2 text-sm">
            <div className="flex justify-between rounded bg-emerald-50 px-3 py-2 dark:bg-emerald-900/20">
              <dt className="font-medium">{t("result.interest")}</dt>
              <dd className="tabular-nums text-lg font-bold">{fmt.format(result.interest)}</dd>
            </div>
            <div className="flex justify-between rounded bg-slate-100 px-3 py-2 dark:bg-slate-800">
              <dt className="font-medium">{t("result.total")}</dt>
              <dd className="tabular-nums text-lg font-bold">{fmt.format(result.total)}</dd>
            </div>
          </dl>
        ) : (
          <div className="text-sm text-slate-600 dark:text-slate-400">{t("empty")}</div>
        )}
      </div>
    </div>
  );
}
