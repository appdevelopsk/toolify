"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import { currencyFormatter } from "@/lib/currency";

import { convertSalary, DEFAULT_BASIS, parseHoursPerWeek, PERIODS, type Period } from "./calc";

export default function SalaryConverter() {
  const t = useTranslations("tools.salary-converter");
  const locale = useLocale();
  const [amount, setAmount] = useState("60000");
  const [period, setPeriod] = useState<Period>("annual");

  const [hoursPerWeek, setHoursPerWeek] = useState(String(DEFAULT_BASIS.hoursPerWeek));

  const weekHours = useMemo(() => parseHoursPerWeek(hoursPerWeek), [hoursPerWeek]);
  const result = useMemo(
    () => (weekHours === null ? null : convertSalary(parseFloat(amount), period, { ...DEFAULT_BASIS, hoursPerWeek: weekHours })),
    [amount, period, weekHours],
  );

  const currency = useMemo(() => currencyFormatter(locale), [locale]);
  const hoursFmt = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }), [locale]);
  // Labels show the hours actually used; fall back to the default while the field is invalid.
  const labelHours = hoursFmt.format(weekHours ?? DEFAULT_BASIS.hoursPerWeek);
  const periodLabel = (p: Period) => t(`period.${p}`, { hours: labelHours });

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block">
          <span className="text-sm font-medium">{t("input.amount")}</span>
          <input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.period")}</span>
          <select value={period} onChange={(e) => setPeriod(e.target.value as Period)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
            {PERIODS.map((p) => (
              <option key={p} value={p}>{periodLabel(p)}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.hoursPerWeek")}</span>
          <input inputMode="decimal" value={hoursPerWeek} onChange={(e) => setHoursPerWeek(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
        </label>
      </div>

      <div aria-live="polite" className="mt-6 grid gap-2 sm:grid-cols-2">
        {result && PERIODS.map((p) => (
          <div key={p} className={`flex items-baseline justify-between rounded border px-4 py-3 ${p === period ? "border-brand-200 bg-brand-50 dark:border-brand-900 dark:bg-brand-900/20" : "border-slate-200 dark:border-slate-800"}`}>
            <span className="font-medium">{periodLabel(p)}</span>
            <span className="text-xl font-bold tabular-nums">{currency.format(result[p])}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 text-xs text-slate-600 dark:text-slate-400">
        {weekHours !== null && (
          <p className="mb-1 font-medium">
            {t("basisNote", { week: labelHours, year: hoursFmt.format(weekHours * DEFAULT_BASIS.weeksPerYear) })}
          </p>
        )}
        {t("assumption")}
      </div>
    </div>
  );
}
