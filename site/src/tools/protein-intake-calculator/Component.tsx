"use client";

import { useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";

const FACTORS = { sedentary: 0.8, light: 1.2, active: 1.6, athlete: 2.0 } as const;
type Level = keyof typeof FACTORS;

export default function ProteinIntakeCalculator() {
  const t = useTranslations("tools.protein-intake-calculator");
  const locale = useLocale();
  const [weight, setWeight] = useState("");
  const [activity, setActivity] = useState<Level>("light");

  const result = useMemo(() => {
    const w = parseFloat(weight);
    if (!isFinite(w) || w <= 0) return null;
    return Math.round(w * FACTORS[activity]);
  }, [weight, activity]);

  const fmt = useMemo(() => new Intl.NumberFormat(locale), [locale]);

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">{t("input.weight")}</span>
          <input
            inputMode="decimal"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="70"
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.activity")}</span>
          <select
            value={activity}
            onChange={(e) => setActivity(e.target.value as Level)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          >
            {(Object.keys(FACTORS) as Level[]).map((lvl) => (
              <option key={lvl} value={lvl}>
                {t(`activity.${lvl}`)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-6 rounded-lg bg-brand-50 p-4 dark:bg-slate-800">
        {result === null ? (
          <p className="text-slate-600 dark:text-slate-400">{t("result.empty")}</p>
        ) : (
          <>
            <p className="text-sm text-slate-600 dark:text-slate-400">{t("result.label")}</p>
            <p className="text-3xl font-bold">
              {fmt.format(result)} <span className="text-xl font-medium">g/day</span>
            </p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              {t("result.note", { factor: FACTORS[activity] })}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
