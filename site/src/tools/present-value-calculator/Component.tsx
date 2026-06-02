"use client";

import { useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";

export default function PresentValueCalculator() {
  const t = useTranslations("tools.present-value-calculator");
  const locale = useLocale();
  const [future, setFuture] = useState("");
  const [rate, setRate] = useState("");
  const [years, setYears] = useState("");

  const result = useMemo(() => {
    const f = parseFloat(future), r = parseFloat(rate), y = parseFloat(years);
    if (![f, r, y].every(isFinite) || f < 0 || y < 0 || r <= -100) return null;
    return f / Math.pow(1 + r / 100, y);
  }, [future, rate, years]);

  const fmt = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }), [locale]);

  const field = (label: string, val: string, set: (v: string) => void, ph: string) => (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <input inputMode="decimal" value={val} onChange={(e) => set(e.target.value)} placeholder={ph}
        className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
    </label>
  );

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-3">
        {field(t("input.future"), future, setFuture, "10000")}
        {field(t("input.rate"), rate, setRate, "5")}
        {field(t("input.years"), years, setYears, "10")}
      </div>
      <div className="mt-6 rounded-lg bg-brand-50 p-4 dark:bg-slate-800">
        {result === null ? (
          <p className="text-slate-600 dark:text-slate-400">{t("result.empty")}</p>
        ) : (
          <>
            <p className="text-sm text-slate-600 dark:text-slate-400">{t("result.label")}</p>
            <p className="text-3xl font-bold">{fmt.format(result)}</p>
          </>
        )}
      </div>
    </div>
  );
}
