"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

type Sex = "male" | "female";
type Unit = "metric" | "imperial";

function inchesOver5ft(heightCm: number): number {
  const inches = heightCm / 2.54;
  return Math.max(0, inches - 60);
}

function devine(sex: Sex, h: number): number {
  // h is cm
  const i = inchesOver5ft(h);
  return sex === "male" ? 50 + 2.3 * i : 45.5 + 2.3 * i;
}
function robinson(sex: Sex, h: number): number {
  const i = inchesOver5ft(h);
  return sex === "male" ? 52 + 1.9 * i : 49 + 1.7 * i;
}
function miller(sex: Sex, h: number): number {
  const i = inchesOver5ft(h);
  return sex === "male" ? 56.2 + 1.41 * i : 53.1 + 1.36 * i;
}
function hamwi(sex: Sex, h: number): number {
  const i = inchesOver5ft(h);
  return sex === "male" ? 48 + 2.7 * i : 45.5 + 2.2 * i;
}
function bmiHealthyRange(h: number): [number, number] {
  const m = h / 100;
  return [18.5 * m * m, 24.9 * m * m];
}

export default function IdealWeightCalculator() {
  const t = useTranslations("tools.ideal-weight-calculator");
  const locale = useLocale();
  const [unit, setUnit] = useState<Unit>(locale === "en" ? "imperial" : "metric");
  const [sex, setSex] = useState<Sex>("male");
  const [height, setHeight] = useState("");

  const results = useMemo(() => {
    const h = parseFloat(height);
    if (!isFinite(h) || h <= 0) return null;
    const heightCm = unit === "metric" ? h : h * 2.54;
    if (heightCm < 100 || heightCm > 250) return null;
    return {
      devine: devine(sex, heightCm),
      robinson: robinson(sex, heightCm),
      miller: miller(sex, heightCm),
      hamwi: hamwi(sex, heightCm),
      bmiRange: bmiHealthyRange(heightCm),
    };
  }, [unit, sex, height]);

  const fmt = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }), [locale]);
  const display = (kg: number) => unit === "metric" ? `${fmt.format(kg)} kg` : `${fmt.format(kg / 0.45359237)} lb`;

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        <div className="inline-flex rounded-md border border-slate-300 dark:border-slate-700">
          <button onClick={() => setUnit("metric")} className={`px-3 py-1.5 text-sm ${unit === "metric" ? "bg-brand-600 text-white" : ""}`}>
            {t("unit.metric")}
          </button>
          <button onClick={() => setUnit("imperial")} className={`px-3 py-1.5 text-sm ${unit === "imperial" ? "bg-brand-600 text-white" : ""}`}>
            {t("unit.imperial")}
          </button>
        </div>
        <div className="inline-flex rounded-md border border-slate-300 dark:border-slate-700">
          <button onClick={() => setSex("male")} className={`px-3 py-1.5 text-sm ${sex === "male" ? "bg-brand-600 text-white" : ""}`}>
            {t("sex.male")}
          </button>
          <button onClick={() => setSex("female")} className={`px-3 py-1.5 text-sm ${sex === "female" ? "bg-brand-600 text-white" : ""}`}>
            {t("sex.female")}
          </button>
        </div>
      </div>

      <label className="block">
        <span className="text-sm font-medium">{t("input.height")} ({unit === "metric" ? "cm" : "in"})</span>
        <input inputMode="decimal" value={height} onChange={(e) => setHeight(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" placeholder={unit === "metric" ? "170" : "67"} />
      </label>

      <div aria-live="polite" className={`mt-6 rounded-lg border p-4 ${results ? "border-brand-200 bg-brand-50 dark:border-brand-900 dark:bg-brand-900/20" : "border-slate-200 dark:border-slate-800"}`}>
        {results ? (
          <>
            <div className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">{t("result.healthyBmiRange")}</div>
            <div className="mt-1 text-2xl font-bold tabular-nums">{display(results.bmiRange[0])} – {display(results.bmiRange[1])}</div>
            <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
              {(["devine", "robinson", "miller", "hamwi"] as const).map((k) => (
                <div key={k} className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800">
                  <dt>{t(`formula.${k}`)}</dt>
                  <dd className="tabular-nums">{display(results[k])}</dd>
                </div>
              ))}
            </dl>
          </>
        ) : (
          <div className="text-sm text-slate-600 dark:text-slate-400">{t("empty")}</div>
        )}
      </div>
    </div>
  );
}
