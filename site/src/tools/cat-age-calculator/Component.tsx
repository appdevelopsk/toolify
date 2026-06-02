"use client";

import { useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";

export default function CatAgeCalculator() {
  const t = useTranslations("tools.cat-age-calculator");
  const locale = useLocale();
  const [catAge, setCatAge] = useState("");

  const result = useMemo(() => {
    const c = parseFloat(catAge);
    if (!isFinite(c) || c <= 0 || c > 30) return null;
    let human: number;
    if (c <= 1) human = c * 15;
    else if (c <= 2) human = 15 + (c - 1) * 9;
    else human = 24 + (c - 2) * 4;
    return Math.round(human);
  }, [catAge]);

  const fmt = useMemo(() => new Intl.NumberFormat(locale), [locale]);

  return (
    <div>
      <label className="block max-w-xs">
        <span className="text-sm font-medium">{t("input.catAge")}</span>
        <input inputMode="decimal" value={catAge} onChange={(e) => setCatAge(e.target.value)} placeholder="3"
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
