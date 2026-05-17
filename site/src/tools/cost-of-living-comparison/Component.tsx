"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

// Approximate Numbeo-style cost-of-living indexes (NYC = 100). Provided as quick presets.
// Users can override with any value from sources like Numbeo, EIU, or Mercer.
const PRESETS: Array<{ key: string; index: number; rentIndex: number }> = [
  { key: "newYork", index: 100, rentIndex: 100 },
  { key: "sanFrancisco", index: 96, rentIndex: 86 },
  { key: "losAngeles", index: 80, rentIndex: 67 },
  { key: "chicago", index: 75, rentIndex: 50 },
  { key: "austin", index: 75, rentIndex: 55 },
  { key: "seattle", index: 86, rentIndex: 71 },
  { key: "boston", index: 90, rentIndex: 79 },
  { key: "miami", index: 78, rentIndex: 73 },
  { key: "denver", index: 76, rentIndex: 56 },
  { key: "london", index: 80, rentIndex: 65 },
  { key: "paris", index: 75, rentIndex: 53 },
  { key: "berlin", index: 65, rentIndex: 38 },
  { key: "tokyo", index: 78, rentIndex: 38 },
  { key: "osaka", index: 70, rentIndex: 28 },
  { key: "seoul", index: 79, rentIndex: 30 },
  { key: "singapore", index: 90, rentIndex: 75 },
  { key: "hongKong", index: 88, rentIndex: 80 },
  { key: "shanghai", index: 60, rentIndex: 35 },
  { key: "beijing", index: 60, rentIndex: 33 },
  { key: "taipei", index: 65, rentIndex: 30 },
  { key: "sydney", index: 82, rentIndex: 60 },
  { key: "toronto", index: 78, rentIndex: 60 },
  { key: "mexicoCity", index: 45, rentIndex: 25 },
  { key: "saoPaulo", index: 42, rentIndex: 22 },
  { key: "buenosAires", index: 38, rentIndex: 18 },
  { key: "madrid", index: 60, rentIndex: 35 },
  { key: "barcelona", index: 60, rentIndex: 38 },
];

export default function CostOfLivingComparison() {
  const t = useTranslations("tools.cost-of-living-comparison");
  const locale = useLocale();

  const [sourceCol, setSourceCol] = useState("100");
  const [sourceRent, setSourceRent] = useState("100");
  const [targetCol, setTargetCol] = useState("78");
  const [targetRent, setTargetRent] = useState("38");
  const [salary, setSalary] = useState("100000");
  const [rentShare, setRentShare] = useState("30");

  const result = useMemo(() => {
    const sCol = parseFloat(sourceCol);
    const sRent = parseFloat(sourceRent);
    const tCol = parseFloat(targetCol);
    const tRent = parseFloat(targetRent);
    const s = parseFloat(salary);
    const rentPct = parseFloat(rentShare) / 100;

    if (![sCol, sRent, tCol, tRent, s, rentPct].every((v) => Number.isFinite(v) && v >= 0)) return null;
    if (sCol <= 0 || sRent <= 0 || s <= 0) return null;

    // Composite ratio: weighted by rent share.
    // Non-rent expenses scale with overall COL ex-rent; rent scales with rent index.
    const nonRentPct = 1 - rentPct;
    const ratio = (tCol / sCol) * nonRentPct + (tRent / sRent) * rentPct;

    const equivalentSalary = s * ratio;
    const monthlyCurrent = s / 12;
    const monthlyEquivalent = equivalentSalary / 12;
    const deltaPct = (ratio - 1) * 100;

    return {
      ratio,
      equivalentSalary,
      monthlyCurrent,
      monthlyEquivalent,
      deltaPct,
      cheaper: ratio < 1,
    };
  }, [sourceCol, sourceRent, targetCol, targetRent, salary, rentShare]);

  const currency = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: locale === "ja" ? "JPY" : locale === "ko" ? "KRW" : locale === "zh-CN" || locale === "zh-TW" ? "CNY" : "USD",
    maximumFractionDigits: 0,
  });

  const applyPreset = (slot: "source" | "target", key: string) => {
    const preset = PRESETS.find((p) => p.key === key);
    if (!preset) return;
    if (slot === "source") {
      setSourceCol(String(preset.index));
      setSourceRent(String(preset.rentIndex));
    } else {
      setTargetCol(String(preset.index));
      setTargetRent(String(preset.rentIndex));
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <fieldset className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
          <legend className="px-2 text-sm font-semibold">{t("sourceHeading")}</legend>
          <div className="space-y-3">
            <label className="block">
              <span className="text-sm font-medium">{t("input.preset")}</span>
              <select className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900" onChange={(e) => applyPreset("source", e.target.value)} value="">
                <option value="">{t("input.presetPlaceholder")}</option>
                {PRESETS.map((p) => (
                  <option key={p.key} value={p.key}>{t(`city.${p.key}`)}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium">{t("input.colIndex")}</span>
              <input type="number" inputMode="decimal" value={sourceCol} onChange={(e) => setSourceCol(e.target.value)} className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
            </label>
            <label className="block">
              <span className="text-sm font-medium">{t("input.rentIndex")}</span>
              <input type="number" inputMode="decimal" value={sourceRent} onChange={(e) => setSourceRent(e.target.value)} className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
            </label>
          </div>
        </fieldset>

        <fieldset className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
          <legend className="px-2 text-sm font-semibold">{t("targetHeading")}</legend>
          <div className="space-y-3">
            <label className="block">
              <span className="text-sm font-medium">{t("input.preset")}</span>
              <select className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900" onChange={(e) => applyPreset("target", e.target.value)} value="">
                <option value="">{t("input.presetPlaceholder")}</option>
                {PRESETS.map((p) => (
                  <option key={p.key} value={p.key}>{t(`city.${p.key}`)}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium">{t("input.colIndex")}</span>
              <input type="number" inputMode="decimal" value={targetCol} onChange={(e) => setTargetCol(e.target.value)} className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
            </label>
            <label className="block">
              <span className="text-sm font-medium">{t("input.rentIndex")}</span>
              <input type="number" inputMode="decimal" value={targetRent} onChange={(e) => setTargetRent(e.target.value)} className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
            </label>
          </div>
        </fieldset>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">{t("input.salary")}</span>
          <input type="number" inputMode="decimal" value={salary} onChange={(e) => setSalary(e.target.value)} className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.rentShare")}</span>
          <input type="number" inputMode="decimal" min="0" max="60" value={rentShare} onChange={(e) => setRentShare(e.target.value)} className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
          <span className="mt-1 block text-xs text-slate-600 dark:text-slate-400">{t("input.rentShareHint")}</span>
        </label>
      </div>

      {result === null ? (
        <p className="rounded bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-900/20 dark:text-amber-200">{t("empty")}</p>
      ) : (
        <div className="space-y-3">
          <div className={`rounded-lg p-4 text-center ${result.cheaper ? "bg-emerald-50 dark:bg-emerald-900/20" : "bg-rose-50 dark:bg-rose-900/20"}`}>
            <div className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-300">{t("result.equivalentLabel")}</div>
            <div className={`mt-1 font-mono text-3xl font-semibold ${result.cheaper ? "text-emerald-800 dark:text-emerald-200" : "text-rose-800 dark:text-rose-200"}`}>{currency.format(result.equivalentSalary)}</div>
            <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              {result.cheaper
                ? t("result.cheaperLine", { pct: Math.abs(result.deltaPct).toFixed(1) })
                : t("result.expensiveLine", { pct: result.deltaPct.toFixed(1) })}
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded border border-slate-200 p-3 dark:border-slate-800">
              <div className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">{t("result.monthlyCurrent")}</div>
              <div className="mt-1 font-mono text-lg">{currency.format(result.monthlyCurrent)}</div>
            </div>
            <div className="rounded border border-slate-200 p-3 dark:border-slate-800">
              <div className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">{t("result.monthlyEquivalent")}</div>
              <div className="mt-1 font-mono text-lg">{currency.format(result.monthlyEquivalent)}</div>
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400">{t("result.disclaimer")}</p>
        </div>
      )}
    </div>
  );
}
