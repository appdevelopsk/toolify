"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

type Period = "hourly" | "daily" | "weekly" | "monthly" | "annual";

const FACTORS: Record<Period, number> = {
  hourly: 1,
  daily: 8, // 8 working hours per day
  weekly: 40, // 40 working hours per week
  monthly: 173.33, // 2080 / 12
  annual: 2080, // 40 × 52
};

export default function SalaryConverter() {
  const t = useTranslations("tools.salary-converter");
  const locale = useLocale();
  const [amount, setAmount] = useState("60000");
  const [period, setPeriod] = useState<Period>("annual");

  const result = useMemo(() => {
    const v = parseFloat(amount);
    if (!isFinite(v) || v < 0) return null;
    const hourly = v / FACTORS[period];
    return {
      hourly,
      daily: hourly * FACTORS.daily,
      weekly: hourly * FACTORS.weekly,
      monthly: hourly * FACTORS.monthly,
      annual: hourly * FACTORS.annual,
    };
  }, [amount, period]);

  const currency = useMemo(
    () => new Intl.NumberFormat(locale, { style: "currency", currency: locale === "ja" ? "JPY" : "USD", maximumFractionDigits: locale === "ja" ? 0 : 2 }),
    [locale],
  );

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">{t("input.amount")}</span>
          <input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.period")}</span>
          <select value={period} onChange={(e) => setPeriod(e.target.value as Period)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
            {(["hourly", "daily", "weekly", "monthly", "annual"] as Period[]).map((p) => (
              <option key={p} value={p}>{t(`period.${p}`)}</option>
            ))}
          </select>
        </label>
      </div>

      <div aria-live="polite" className="mt-6 grid gap-2 sm:grid-cols-2">
        {result && (["hourly", "daily", "weekly", "monthly", "annual"] as Period[]).map((p) => (
          <div key={p} className={`flex items-baseline justify-between rounded border px-4 py-3 ${p === period ? "border-brand-200 bg-brand-50 dark:border-brand-900 dark:bg-brand-900/20" : "border-slate-200 dark:border-slate-800"}`}>
            <span className="font-medium">{t(`period.${p}`)}</span>
            <span className="text-xl font-bold tabular-nums">{currency.format(result[p])}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 text-xs text-slate-600 dark:text-slate-400">
        {t("assumption")}
      </div>
    </div>
  );
}
