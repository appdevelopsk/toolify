"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

export default function ElectricityCostCalculator() {
  const t = useTranslations("tools.electricity-cost-calculator");
  const locale = useLocale();
  const [watts, setWatts] = useState("1000");
  const [hoursPerDay, setHoursPerDay] = useState("8");
  const [days, setDays] = useState("30");
  const [ratePerKwh, setRatePerKwh] = useState("0.15");

  const result = useMemo(() => {
    const w = parseFloat(watts);
    const h = parseFloat(hoursPerDay);
    const d = parseFloat(days);
    const r = parseFloat(ratePerKwh);
    if (![w, h, d, r].every(isFinite) || w <= 0 || h < 0 || d < 0 || r < 0) return null;
    const kwhPerDay = (w / 1000) * h;
    const costPerDay = kwhPerDay * r;
    const totalKwh = kwhPerDay * d;
    const totalCost = totalKwh * r;
    const costPerMonth = kwhPerDay * r * 30;
    const costPerYear = kwhPerDay * r * 365;
    return { kwhPerDay, costPerDay, totalKwh, totalCost, costPerMonth, costPerYear };
  }, [watts, hoursPerDay, days, ratePerKwh]);

  const fmt = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 4 }), [locale]);
  const fmtCurrency = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 2, minimumFractionDigits: 2 }), [locale]);

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">{t("input.watts")}</span>
          <input
            type="number"
            min={0}
            step="1"
            value={watts}
            onChange={(e) => setWatts(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 tabular-nums dark:border-slate-700 dark:bg-slate-900"
          />
          <span className="text-xs text-slate-500">{t("input.wattsHint")}</span>
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.hoursPerDay")}</span>
          <input
            type="number"
            min={0}
            max={24}
            step="0.5"
            value={hoursPerDay}
            onChange={(e) => setHoursPerDay(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 tabular-nums dark:border-slate-700 dark:bg-slate-900"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.days")}</span>
          <input
            type="number"
            min={0}
            step="1"
            value={days}
            onChange={(e) => setDays(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 tabular-nums dark:border-slate-700 dark:bg-slate-900"
          />
          <span className="text-xs text-slate-500">{t("input.daysHint")}</span>
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.ratePerKwh")}</span>
          <input
            type="number"
            min={0}
            step="0.001"
            value={ratePerKwh}
            onChange={(e) => setRatePerKwh(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 tabular-nums dark:border-slate-700 dark:bg-slate-900"
          />
          <span className="text-xs text-slate-500">{t("input.rateHint")}</span>
        </label>
      </div>

      <div aria-live="polite" className="mt-6 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
        {result ? (
          <dl className="grid gap-3 text-sm">
            <div className="rounded-lg bg-emerald-50 p-4 dark:bg-emerald-900/20">
              <div className="flex items-baseline justify-between">
                <dt className="font-medium text-emerald-800 dark:text-emerald-200">{t("result.totalCost")}</dt>
                <dd className="text-3xl font-bold tabular-nums">{fmtCurrency.format(result.totalCost)}</dd>
              </div>
              <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-300">
                {fmt.format(result.totalKwh)} kWh
              </p>
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
              <div className="rounded border border-slate-200 px-3 py-2 dark:border-slate-700">
                <dt className="text-xs text-slate-500">{t("result.perDay")}</dt>
                <dd className="mt-0.5 font-semibold tabular-nums">{fmtCurrency.format(result.costPerDay)}</dd>
                <dd className="text-xs text-slate-400">{fmt.format(result.kwhPerDay)} kWh</dd>
              </div>
              <div className="rounded border border-slate-200 px-3 py-2 dark:border-slate-700">
                <dt className="text-xs text-slate-500">{t("result.perMonth")}</dt>
                <dd className="mt-0.5 font-semibold tabular-nums">{fmtCurrency.format(result.costPerMonth)}</dd>
                <dd className="text-xs text-slate-400">{fmt.format(result.kwhPerDay * 30)} kWh</dd>
              </div>
              <div className="rounded border border-slate-200 px-3 py-2 dark:border-slate-700">
                <dt className="text-xs text-slate-500">{t("result.perYear")}</dt>
                <dd className="mt-0.5 font-semibold tabular-nums">{fmtCurrency.format(result.costPerYear)}</dd>
                <dd className="text-xs text-slate-400">{fmt.format(result.kwhPerDay * 365)} kWh</dd>
              </div>
            </div>
          </dl>
        ) : (
          <p className="text-center text-slate-400">{t("empty")}</p>
        )}
      </div>
    </div>
  );
}
