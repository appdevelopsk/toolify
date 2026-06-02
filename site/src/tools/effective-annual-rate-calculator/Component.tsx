"use client";

import { useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";

export default function EffectiveAnnualRateCalculator() {
  const t = useTranslations("tools.effective-annual-rate-calculator");
  const locale = useLocale();
  const [rate, setRate] = useState("");
  const [periods, setPeriods] = useState("");

  const result = useMemo(() => {
    const r = parseFloat(rate), n = parseFloat(periods);
    if (![r, n].every(isFinite) || r < 0 || n <= 0) return null;
    return (Math.pow(1 + r / 100 / n, n) - 1) * 100;
  }, [rate, periods]);

  const fmt = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 3 }), [locale]);

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">{t("input.rate")}</span>
          <input inputMode="decimal" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="12"
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.periods")}</span>
          <input inputMode="numeric" value={periods} onChange={(e) => setPeriods(e.target.value)} placeholder="12"
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
        </label>
      </div>
      <div className="mt-6 rounded-lg bg-brand-50 p-4 dark:bg-slate-800">
        {result === null ? (
          <p className="text-slate-600 dark:text-slate-400">{t("result.empty")}</p>
        ) : (
          <>
            <p className="text-sm text-slate-600 dark:text-slate-400">{t("result.label")}</p>
            <p className="text-3xl font-bold">{fmt.format(result)}<span className="text-xl font-medium">%</span></p>
          </>
        )}
      </div>
    </div>
  );
}
