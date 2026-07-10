"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useLocalDraft } from "@/lib/hooks/useLocalDraft";
import { DraftNotice } from "@/lib/hooks/DraftNotice";
import { defaultUnitSystem, type UnitSystem } from "@/lib/hooks/useUnitSystem";

type Sex = "male" | "female";

const CM_PER_IN = 2.54;
const KG_PER_LB = 0.45359237;

function navyBodyFat(sex: Sex, heightCm: number, neckCm: number, waistCm: number, hipCm: number): number {
  // US Navy method (cm version)
  if (sex === "male") {
    return 86.010 * Math.log10(waistCm - neckCm) - 70.041 * Math.log10(heightCm) + 36.76;
  }
  // female
  return 163.205 * Math.log10(waistCm + hipCm - neckCm) - 97.684 * Math.log10(heightCm) - 78.387;
}

function bfCategory(sex: Sex, bfPct: number): string {
  if (sex === "male") {
    if (bfPct < 6) return "essential";
    if (bfPct < 14) return "athlete";
    if (bfPct < 18) return "fit";
    if (bfPct < 25) return "average";
    return "obese";
  }
  if (bfPct < 14) return "essential";
  if (bfPct < 21) return "athlete";
  if (bfPct < 25) return "fit";
  if (bfPct < 32) return "average";
  return "obese";
}

/** Convert a numeric input string by a factor, keeping non-numeric text as-is. */
function convertField(value: string, factor: number): string {
  const n = parseFloat(value);
  if (!isFinite(n)) return value;
  return String(Math.round(n * factor * 10) / 10);
}

export default function BodyFatCalculator() {
  const t = useTranslations("tools.body-fat-calculator");
  const locale = useLocale();
  const initialUnit = defaultUnitSystem(locale);
  const [unit, setUnit] = useState<UnitSystem>(initialUnit);
  const [sex, setSex] = useState<Sex>("male");
  const [height, setHeight] = useState(initialUnit === "metric" ? "170" : "67");
  const [waist, setWaist] = useState(initialUnit === "metric" ? "85" : "33.5");
  const [neck, setNeck] = useState(initialUnit === "metric" ? "38" : "15");
  const [hip, setHip] = useState(initialUnit === "metric" ? "95" : "37.5");
  const [weight, setWeight] = useState(initialUnit === "metric" ? "70" : "154");

  const draft = useLocalDraft(
    "body-fat-calculator",
    { unit, sex, height, waist, neck, hip, weight },
    (d) => {
      if (d.unit === "metric" || d.unit === "imperial") setUnit(d.unit);
      if (d.sex === "male" || d.sex === "female") setSex(d.sex);
      if (typeof d.height === "string") setHeight(d.height);
      if (typeof d.waist === "string") setWaist(d.waist);
      if (typeof d.neck === "string") setNeck(d.neck);
      if (typeof d.hip === "string") setHip(d.hip);
      if (typeof d.weight === "string") setWeight(d.weight);
    },
  );

  const switchUnit = (next: UnitSystem) => {
    if (next === unit) return;
    const len = next === "imperial" ? 1 / CM_PER_IN : CM_PER_IN;
    const wt = next === "imperial" ? 1 / KG_PER_LB : KG_PER_LB;
    setHeight((v) => convertField(v, len));
    setWaist((v) => convertField(v, len));
    setNeck((v) => convertField(v, len));
    setHip((v) => convertField(v, len));
    setWeight((v) => convertField(v, wt));
    setUnit(next);
  };

  const result = useMemo(() => {
    const toCm = unit === "metric" ? 1 : CM_PER_IN;
    const h = parseFloat(height) * toCm;
    const w = parseFloat(waist) * toCm;
    const n = parseFloat(neck) * toCm;
    const hp = parseFloat(hip) * toCm;
    const wtKg = parseFloat(weight) * (unit === "metric" ? 1 : KG_PER_LB);
    if (![h, w, n, wtKg].every(isFinite)) return null;
    if (sex === "female" && !isFinite(hp)) return null;
    const bf = navyBodyFat(sex, h, n, w, hp);
    if (!isFinite(bf) || bf <= 0 || bf >= 60) return null;
    const fatMassKg = (wtKg * bf) / 100;
    const leanMassKg = wtKg - fatMassKg;
    const toDisplay = unit === "metric" ? 1 : 1 / KG_PER_LB;
    return {
      bf,
      fatMass: fatMassKg * toDisplay,
      leanMass: leanMassKg * toDisplay,
      category: bfCategory(sex, bf),
    };
  }, [unit, sex, height, waist, neck, hip, weight]);

  const fmt = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }), [locale]);
  const lenUnit = unit === "metric" ? "cm" : "in";
  const massUnit = unit === "metric" ? "kg" : "lb";

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2">
        <div className="inline-flex rounded-md border border-slate-300 dark:border-slate-700">
          <button onClick={() => switchUnit("metric")} className={`px-3 py-1.5 text-sm ${unit === "metric" ? "bg-brand-600 text-white" : ""}`}>{t("unit.metric")}</button>
          <button onClick={() => switchUnit("imperial")} className={`px-3 py-1.5 text-sm ${unit === "imperial" ? "bg-brand-600 text-white" : ""}`}>{t("unit.imperial")}</button>
        </div>
        <div className="inline-flex gap-2">
          <button onClick={() => setSex("male")} className={`rounded px-3 py-1 text-sm ${sex === "male" ? "bg-brand-600 text-white" : "border border-slate-300 dark:border-slate-700"}`}>{t("sex.male")}</button>
          <button onClick={() => setSex("female")} className={`rounded px-3 py-1 text-sm ${sex === "female" ? "bg-brand-600 text-white" : "border border-slate-300 dark:border-slate-700"}`}>{t("sex.female")}</button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">{t("input.height")} ({lenUnit})</span>
          <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 tabular-nums dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.weight")} ({massUnit})</span>
          <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 tabular-nums dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.waist")} ({lenUnit})</span>
          <input type="number" value={waist} onChange={(e) => setWaist(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 tabular-nums dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.neck")} ({lenUnit})</span>
          <input type="number" value={neck} onChange={(e) => setNeck(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 tabular-nums dark:border-slate-700 dark:bg-slate-900" />
        </label>
        {sex === "female" && (
          <label className="block">
            <span className="text-sm font-medium">{t("input.hip")} ({lenUnit})</span>
            <input type="number" value={hip} onChange={(e) => setHip(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 tabular-nums dark:border-slate-700 dark:bg-slate-900" />
          </label>
        )}
      </div>

      <div aria-live="polite" className="mt-6 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
        {result ? (
          <div>
            <div className="flex items-baseline gap-3">
              <div className="text-4xl font-bold tabular-nums">{fmt.format(result.bf)}%</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">{t(`category.${result.category}`)}</div>
            </div>
            <dl className="mt-4 grid gap-2 text-sm">
              <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800"><dt>{t("result.fatMass")}</dt><dd className="tabular-nums">{fmt.format(result.fatMass)} {massUnit}</dd></div>
              <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800"><dt>{t("result.leanMass")}</dt><dd className="tabular-nums">{fmt.format(result.leanMass)} {massUnit}</dd></div>
            </dl>
          </div>
        ) : (
          <div className="text-sm text-slate-600 dark:text-slate-400">{t("empty")}</div>
        )}
      </div>

      <DraftNotice
        draft={draft}
        privacyNote={t("draft.privacyNote")}
        restoredLabel={t("draft.restored")}
        clearLabel={t("draft.clear")}
      />
    </div>
  );
}
