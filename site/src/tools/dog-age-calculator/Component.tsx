"use client";

import { useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";

export default function DogAgeCalculator() {
  const t = useTranslations("tools.dog-age-calculator");
  const locale = useLocale();
  const [dogAge, setDogAge] = useState("");

  const result = useMemo(() => {
    const d = parseFloat(dogAge);
    if (!isFinite(d) || d <= 0 || d > 30) return null;
    return Math.round(d <= 2 ? d * 10.5 : 21 + (d - 2) * 4);
  }, [dogAge]);

  const fmt = useMemo(() => new Intl.NumberFormat(locale), [locale]);

  return (
    <div>
      <label className="block max-w-xs">
        <span className="text-sm font-medium">{t("input.dogAge")}</span>
        <input inputMode="decimal" value={dogAge} onChange={(e) => setDogAge(e.target.value)} placeholder="5"
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
      </label>
      <div className="mt-6 rounded-lg bg-brand-50 p-4 dark:bg-slate-800">
        {result === null ? (
          <p className="text-slate-600 dark:text-slate-400">{t("result.empty")}</p>
        ) : (
          <>
            <p className="text-sm text-slate-600 dark:text-slate-400">{t("result.label")}</p>
            <p className="text-3xl font-bold">{fmt.format(result)}</p>
          </>
        )}
      </div>
    </div>
  );
}
