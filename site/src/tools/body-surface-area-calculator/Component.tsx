"use client";

import { useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";

export default function BodySurfaceAreaCalculator() {
  const t = useTranslations("tools.body-surface-area-calculator");
  const locale = useLocale();
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");

  const result = useMemo(() => {
    const h = parseFloat(height), w = parseFloat(weight);
    if (![h, w].every(isFinite) || h <= 0 || w <= 0) return null;
    return Math.sqrt((h * w) / 3600); // Mosteller, m²
  }, [height, weight]);

  const fmt = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }), [locale]);

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">{t("input.height")}</span>
          <input inputMode="decimal" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="170"
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.weight")}</span>
          <input inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="65"
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
        </label>
      </div>
      <div className="mt-6 rounded-lg bg-brand-50 p-4 dark:bg-slate-800">
        {result === null ? (
          <p className="text-slate-600 dark:text-slate-400">{t("result.empty")}</p>
        ) : (
          <>
            <p className="text-sm text-slate-600 dark:text-slate-400">{t("result.label")}</p>
            <p className="text-3xl font-bold">{fmt.format(result)} <span className="text-xl font-medium">m²</span></p>
          </>
        )}
      </div>
    </div>
  );
}
