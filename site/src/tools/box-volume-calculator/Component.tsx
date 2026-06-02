"use client";

import { useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";

export default function BoxVolumeCalculator() {
  const t = useTranslations("tools.box-volume-calculator");
  const locale = useLocale();
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");

  const result = useMemo(() => {
    const l = parseFloat(length), w = parseFloat(width), h = parseFloat(height);
    if (![l, w, h].every(isFinite) || l <= 0 || w <= 0 || h <= 0) return null;
    const cm3 = l * w * h;
    return { cm3, liters: cm3 / 1000 };
  }, [length, width, height]);

  const fmt = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }), [locale]);

  const field = (label: string, val: string, set: (v: string) => void, ph: string) => (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <input inputMode="decimal" value={val} onChange={(e) => set(e.target.value)} placeholder={ph}
        className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
    </label>
  );

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-3">
        {field(t("input.length"), length, setLength, "20")}
        {field(t("input.width"), width, setWidth, "15")}
        {field(t("input.height"), height, setHeight, "10")}
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
