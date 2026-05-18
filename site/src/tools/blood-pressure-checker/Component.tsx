"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

type Category = "normal" | "elevated" | "stage1" | "stage2" | "crisis" | null;

function classify(sys: number, dia: number): Category {
  if (sys > 180 || dia > 120) return "crisis";
  if (sys >= 140 || dia >= 90) return "stage2";
  if (sys >= 130 || dia >= 80) return "stage1";
  if (sys >= 120 && dia < 80) return "elevated";
  if (sys < 120 && dia < 80) return "normal";
  return null;
}

const categoryStyle: Record<NonNullable<Category>, string> = {
  normal: "border-green-300 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300",
  elevated: "border-yellow-300 bg-yellow-50 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300",
  stage1: "border-orange-300 bg-orange-50 text-orange-800 dark:border-orange-800 dark:bg-orange-900/20 dark:text-orange-300",
  stage2: "border-red-300 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300",
  crisis: "border-red-500 bg-red-100 text-red-900 ring-2 ring-red-500 dark:border-red-600 dark:bg-red-900/40 dark:text-red-200",
};

export default function BloodPressureChecker() {
  const t = useTranslations("tools.blood-pressure-checker");
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");

  const result = useMemo(() => {
    const sys = parseInt(systolic, 10);
    const dia = parseInt(diastolic, 10);
    if (!isFinite(sys) || !isFinite(dia) || sys <= 0 || dia <= 0) return null;
    const category = classify(sys, dia);
    const pulsePressure = sys - dia;
    return { sys, dia, category, pulsePressure };
  }, [systolic, diastolic]);

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">{t("input.systolic")}</span>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={300}
            value={systolic}
            onChange={(e) => setSystolic(e.target.value)}
            placeholder="120"
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.diastolic")}</span>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={200}
            value={diastolic}
            onChange={(e) => setDiastolic(e.target.value)}
            placeholder="80"
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          />
        </label>
      </div>

      <div aria-live="polite" className="mt-6">
        {result && result.category ? (
          <div className={`rounded-lg border p-4 ${categoryStyle[result.category]}`}>
            <div className="text-xs uppercase tracking-wider opacity-70">{t("result.label")}</div>
            <div className="mt-1 text-2xl font-bold">
              {result.sys} / {result.dia} <span className="text-sm font-normal">mmHg</span>
            </div>
            <div className="mt-2 text-lg font-semibold">{t(`category.${result.category}`)}</div>
            <div className="mt-1 text-sm">{t(`result.advice.${result.category}`)}</div>
            <div className="mt-3 text-sm opacity-80">
              {t("result.pulsePressure", { value: result.pulsePressure })}
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-slate-200 p-4 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-400">
            {t("result.empty")}
          </div>
        )}
      </div>

      <p className="mt-4 text-xs text-slate-500 dark:text-slate-500">{t("disclaimer")}</p>
    </div>
  );
}
