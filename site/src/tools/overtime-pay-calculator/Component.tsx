"use client";

import { useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";

export default function OvertimePayCalculator() {
  const t = useTranslations("tools.overtime-pay-calculator");
  const locale = useLocale();
  const [hours, setHours] = useState("");
  const [rate, setRate] = useState("");
  const [multiplier, setMultiplier] = useState("1.5");

  const result = useMemo(() => {
    const h = parseFloat(hours), r = parseFloat(rate), m = parseFloat(multiplier);
    if (![h, r, m].every(isFinite) || h < 0 || r < 0 || m <= 0) return null;
    return h * r * m;
  }, [hours, rate, multiplier]);

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
        {field(t("input.hours"), hours, setHours, "10")}
        {field(t("input.rate"), rate, setRate, "25")}
        {field(t("input.multiplier"), multiplier, setMultiplier, "1.5")}
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
