"use client";

import { useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";

export default function SipCalculator() {
  const t = useTranslations("tools.sip-calculator");
  const locale = useLocale();
  const [monthly, setMonthly] = useState("");
  const [rate, setRate] = useState("");
  const [years, setYears] = useState("");

  const result = useMemo(() => {
    const p = parseFloat(monthly), r = parseFloat(rate), y = parseFloat(years);
    if (![p, r, y].every(isFinite) || p < 0 || r < 0 || y <= 0) return null;
    const i = r / 100 / 12;
    const n = Math.round(y * 12);
    const fv = i === 0 ? p * n : p * (((Math.pow(1 + i, n) - 1) / i) * (1 + i));
    return { fv, invested: p * n };
  }, [monthly, rate, years]);

  const fmt = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }), [locale]);

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
        {field(t("input.monthly"), monthly, setMonthly, "10000")}
        {field(t("input.rate"), rate, setRate, "12")}
        {field(t("input.years"), years, setYears, "10")}
      </div>
      <div className="mt-6 rounded-lg bg-brand-50 p-4 dark:bg-slate-800">
        {result === null ? (
          <p className="text-slate-600 dark:text-slate-400">{t("result.empty")}</p>
        ) : (
          <>
            <p className="text-sm text-slate-600 dark:text-slate-400">{t("result.label")}</p>
            <p className="text-3xl font-bold">{fmt.format(result.fv)}</p>
          </>
        )}
      </div>
    </div>
  );
}
