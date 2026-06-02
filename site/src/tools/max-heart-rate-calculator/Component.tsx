"use client";

import { useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";

export default function MaxHeartRateCalculator() {
  const t = useTranslations("tools.max-heart-rate-calculator");
  const locale = useLocale();
  const [age, setAge] = useState("");

  const result = useMemo(() => {
    const a = parseFloat(age);
    if (!isFinite(a) || a <= 0 || a > 120) return null;
    return { fox: Math.round(220 - a), tanaka: Math.round(208 - 0.7 * a) };
  }, [age]);

  const fmt = useMemo(() => new Intl.NumberFormat(locale), [locale]);

  return (
    <div>
      <label className="block max-w-xs">
        <span className="text-sm font-medium">{t("input.age")}</span>
        <input inputMode="numeric" value={age} onChange={(e) => setAge(e.target.value)} placeholder="30"
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
      </label>
      <div className="mt-6 rounded-lg bg-brand-50 p-4 dark:bg-slate-800">
        {result === null ? (
          <p className="text-slate-600 dark:text-slate-400">{t("result.empty")}</p>
        ) : (
          <>
            <p className="text-sm text-slate-600 dark:text-slate-400">{t("result.label")}</p>
            <p className="text-3xl font-bold">
              {fmt.format(result.fox)} <span className="text-xl font-medium">bpm</span>
              <span className="ml-2 text-base font-normal text-slate-500">(Tanaka: {fmt.format(result.tanaka)} bpm)</span>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
