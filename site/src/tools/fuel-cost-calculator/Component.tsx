"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

type Unit = "metric" | "imperial";

export default function FuelCostCalculator() {
  const t = useTranslations("tools.fuel-cost-calculator");
  const locale = useLocale();
  const [unit, setUnit] = useState<Unit>(locale === "en" ? "imperial" : "metric");
  const [distance, setDistance] = useState("100");
  const [efficiency, setEfficiency] = useState(unit === "metric" ? "12" : "30");
  const [pricePerUnit, setPricePerUnit] = useState(unit === "metric" ? "175" : "3.5");
  const [people, setPeople] = useState("1");

  const result = useMemo(() => {
    const d = parseFloat(distance);
    const e = parseFloat(efficiency);
    const p = parseFloat(pricePerUnit);
    const ppl = parseInt(people, 10) || 1;
    if (![d, e, p].every(isFinite) || d <= 0 || e <= 0 || p < 0) return null;
    const fuelUsed = d / e;
    const totalCost = fuelUsed * p;
    const perUnit = totalCost / d;
    const perPerson = totalCost / Math.max(1, ppl);
    return { fuelUsed, totalCost, perUnit, perPerson };
  }, [distance, efficiency, pricePerUnit, people]);

  const fmt = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }), [locale]);
  const distUnit = unit === "metric" ? "km" : "mi";
  const fuelUnit = unit === "metric" ? "L" : "gal";
  const effLabel = unit === "metric" ? "km/L" : "MPG";
  const priceLabel = unit === "metric" ? "/L" : "/gal";

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2">
        {(["metric", "imperial"] as Unit[]).map((u) => (
          <button key={u} onClick={() => setUnit(u)} className={`rounded px-3 py-1 text-sm ${unit === u ? "bg-brand-600 text-white" : "border border-slate-300 dark:border-slate-700"}`}>
            {t(`unit.${u}`)}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">{t("input.distance")} ({distUnit})</span>
          <input type="number" value={distance} onChange={(e) => setDistance(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 tabular-nums dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.efficiency")} ({effLabel})</span>
          <input type="number" value={efficiency} onChange={(e) => setEfficiency(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 tabular-nums dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.pricePerUnit")} ({priceLabel})</span>
          <input type="number" step="0.01" value={pricePerUnit} onChange={(e) => setPricePerUnit(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 tabular-nums dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.people")}</span>
          <input type="number" min={1} value={people} onChange={(e) => setPeople(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 tabular-nums dark:border-slate-700 dark:bg-slate-900" />
        </label>
      </div>

      <div aria-live="polite" className="mt-6 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
        {result ? (
          <dl className="grid gap-2 text-sm">
            <div className="flex justify-between rounded bg-emerald-50 px-3 py-2 dark:bg-emerald-900/20">
              <dt className="font-medium">{t("result.totalCost")}</dt>
              <dd className="tabular-nums text-2xl font-bold">{fmt.format(result.totalCost)}</dd>
            </div>
            <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800">
              <dt>{t("result.fuelUsed")}</dt>
              <dd className="tabular-nums">{fmt.format(result.fuelUsed)} {fuelUnit}</dd>
            </div>
            <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800">
              <dt>{t("result.perDistance", { unit: distUnit })}</dt>
              <dd className="tabular-nums">{fmt.format(result.perUnit)}</dd>
            </div>
            {parseInt(people, 10) > 1 && (
              <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800">
                <dt>{t("result.perPerson")}</dt>
                <dd className="tabular-nums">{fmt.format(result.perPerson)}</dd>
              </div>
            )}
          </dl>
        ) : (
          <div className="text-sm text-slate-600 dark:text-slate-400">{t("empty")}</div>
        )}
      </div>
    </div>
  );
}
