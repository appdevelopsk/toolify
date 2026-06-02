"use client";

import { useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";

export default function SquareFootageCalculator() {
  const t = useTranslations("tools.square-footage-calculator");
  const locale = useLocale();
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");

  const result = useMemo(() => {
    const l = parseFloat(length);
    const w = parseFloat(width);
    if (!isFinite(l) || !isFinite(w) || l <= 0 || w <= 0) return null;
    const sqft = l * w;
    return { sqft, sqm: sqft * 0.092903 };
  }, [length, width]);

  const fmt = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }), [locale]);

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">{t("input.length")}</span>
          <input
            inputMode="decimal"
            value={length}
            onChange={(e) => setLength(e.target.value)}
            placeholder="12"
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.width")}</span>
          <input
            inputMode="decimal"
            value={width}
            onChange={(e) => setWidth(e.target.value)}
            placeholder="10"
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          />
        </label>
      </div>

      <div className="mt-6 rounded-lg bg-brand-50 p-4 dark:bg-slate-800">
        {result === null ? (
          <p className="text-slate-600 dark:text-slate-400">{t("result.empty")}</p>
        ) : (
          <>
            <p className="text-sm text-slate-600 dark:text-slate-400">{t("result.label")}</p>
            <p className="text-3xl font-bold">
              {fmt.format(result.sqft)} <span className="text-xl font-medium">ft²</span>
              <span className="ml-2 text-base font-normal text-slate-500">≈ {fmt.format(result.sqm)} m²</span>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
