"use client";

import { useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";

type Unit = "metric" | "imperial";

function categoryFromBmi(bmi: number, key: (k: string) => string) {
  if (bmi < 16) return { key: "severeUnderweight", label: key("cat.severeUnderweight") };
  if (bmi < 17) return { key: "moderateUnderweight", label: key("cat.moderateUnderweight") };
  if (bmi < 18.5) return { key: "mildUnderweight", label: key("cat.mildUnderweight") };
  if (bmi < 25) return { key: "normal", label: key("cat.normal") };
  if (bmi < 30) return { key: "overweight", label: key("cat.overweight") };
  if (bmi < 35) return { key: "obese1", label: key("cat.obese1") };
  if (bmi < 40) return { key: "obese2", label: key("cat.obese2") };
  return { key: "obese3", label: key("cat.obese3") };
}

export default function BmiCalculator() {
  const t = useTranslations("tools.bmi-calculator");
  const locale = useLocale();
  const [unit, setUnit] = useState<Unit>(locale === "en" ? "imperial" : "metric");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");

  const result = useMemo(() => {
    const h = parseFloat(height);
    const w = parseFloat(weight);
    if (!isFinite(h) || !isFinite(w) || h <= 0 || w <= 0) return null;
    let bmi: number;
    if (unit === "metric") {
      bmi = w / Math.pow(h / 100, 2);
    } else {
      // imperial: in / lb. BMI = 703 * lb / in^2
      bmi = (703 * w) / (h * h);
    }
    if (!isFinite(bmi)) return null;
    return Math.round(bmi * 10) / 10;
  }, [height, weight, unit]);

  const cat = result !== null ? categoryFromBmi(result, t) : null;
  const fmt = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }), [locale]);

  return (
    <div>
      <div className="mb-4 inline-flex rounded-md border border-slate-300 dark:border-slate-700">
        <button
          onClick={() => setUnit("metric")}
          className={`px-3 py-1.5 text-sm ${unit === "metric" ? "bg-brand-600 text-white" : ""}`}
        >
          {t("unit.metric")}
        </button>
        <button
          onClick={() => setUnit("imperial")}
          className={`px-3 py-1.5 text-sm ${unit === "imperial" ? "bg-brand-600 text-white" : ""}`}
        >
          {t("unit.imperial")}
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">
            {t("input.height")} ({unit === "metric" ? "cm" : "in"})
          </span>
          <input
            inputMode="decimal"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
            placeholder={unit === "metric" ? "170" : "67"}
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">
            {t("input.weight")} ({unit === "metric" ? "kg" : "lb"})
          </span>
          <input
            inputMode="decimal"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
            placeholder={unit === "metric" ? "65" : "143"}
          />
        </label>
      </div>

      <div
        aria-live="polite"
        className={`mt-6 rounded-lg border p-4 ${
          result !== null ? "border-brand-200 bg-brand-50 dark:border-brand-900 dark:bg-brand-900/20" : "border-slate-200 dark:border-slate-800"
        }`}
      >
        {result !== null && cat ? (
          <>
            <div className="text-sm uppercase tracking-wider text-slate-600 dark:text-slate-400">{t("result.label")}</div>
            <div className="mt-1 text-4xl font-bold tabular-nums">{fmt.format(result)}</div>
            <div className="mt-2 text-lg">{cat.label}</div>
          </>
        ) : (
          <div className="text-sm text-slate-600 dark:text-slate-400">{t("result.empty")}</div>
        )}
      </div>
    </div>
  );
}
