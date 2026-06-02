"use client";

import { useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";

export default function ConeVolumeCalculator() {
  const t = useTranslations("tools.cone-volume-calculator");
  const locale = useLocale();
  const [radius, setRadius] = useState("");
  const [height, setHeight] = useState("");

  const result = useMemo(() => {
    const r = parseFloat(radius), h = parseFloat(height);
    if (![r, h].every(isFinite) || r <= 0 || h <= 0) return null;
    const cm3 = (1 / 3) * Math.PI * r * r * h;
    return { cm3, liters: cm3 / 1000 };
  }, [radius, height]);

  const fmt = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }), [locale]);

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">{t("input.radius")}</span>
          <input inputMode="decimal" value={radius} onChange={(e) => setRadius(e.target.value)} placeholder="5"
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.height")}</span>
          <input inputMode="decimal" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="12"
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
        </label>
      </div>
      <div className="mt-6 rounded-lg bg-brand-50 p-4 dark:bg-slate-800">
        {result === null ? (
          <p className="text-slate-600 dark:text-slate-400">{t("result.empty")}</p>
        ) : (
          <>
            <p className="text-sm text-slate-600 dark:text-slate-400">{t("result.label")}</p>
            <p className="text-3xl font-bold">
              {fmt.format(result.cm3)} <span className="text-xl font-medium">cm³</span>
              <span className="ml-2 text-base font-normal text-slate-500">≈ {fmt.format(result.liters)} L</span>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
