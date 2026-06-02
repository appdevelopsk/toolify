"use client";

import { useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";

const RATIOS = [15, 16, 17, 18] as const;

export default function CoffeeRatioCalculator() {
  const t = useTranslations("tools.coffee-ratio-calculator");
  const locale = useLocale();
  const [coffee, setCoffee] = useState("");
  const [ratio, setRatio] = useState<number>(16);

  const water = useMemo(() => {
    const c = parseFloat(coffee);
    if (!isFinite(c) || c <= 0) return null;
    return Math.round(c * ratio);
  }, [coffee, ratio]);

  const fmt = useMemo(() => new Intl.NumberFormat(locale), [locale]);

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">{t("input.coffee")}</span>
          <input
            inputMode="decimal"
            value={coffee}
            onChange={(e) => setCoffee(e.target.value)}
            placeholder="18"
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.ratio")}</span>
          <select
            value={ratio}
            onChange={(e) => setRatio(Number(e.target.value))}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          >
            {RATIOS.map((r) => (
              <option key={r} value={r}>
                {`1:${r}`}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-6 rounded-lg bg-brand-50 p-4 dark:bg-slate-800">
        {water === null ? (
          <p className="text-slate-600 dark:text-slate-400">{t("result.empty")}</p>
        ) : (
          <>
            <p className="text-sm text-slate-600 dark:text-slate-400">{t("result.label")}</p>
            <p className="text-3xl font-bold">
              {fmt.format(water)} <span className="text-xl font-medium">g</span>
              <span className="ml-2 text-base font-normal text-slate-500">≈ {fmt.format(water)} ml</span>
            </p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              {t("result.note", { coffee: fmt.format(parseFloat(coffee)), ratio: `1:${ratio}` })}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
