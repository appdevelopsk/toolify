"use client";

import { useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";

export default function AverageSpeedCalculator() {
  const t = useTranslations("tools.average-speed-calculator");
  const locale = useLocale();
  // 空欄で着地すると結果カードが何も描かれず、道具が動くことが伝わらないまま離脱する。
  // 代表値を初期表示し、最初の描画から結果を見せる(2026-08-22)。
  const [distance, setDistance] = useState(() => "150");
  const [time, setTime] = useState(() => "2.5");

  const result = useMemo(() => {
    const d = parseFloat(distance), h = parseFloat(time);
    if (![d, h].every(isFinite) || d < 0 || h <= 0) return null;
    return d / h;
  }, [distance, time]);

  const fmt = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }), [locale]);

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">{t("input.distance")}</span>
          <input inputMode="decimal" value={distance} onChange={(e) => setDistance(e.target.value)} placeholder="150"
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.time")}</span>
          <input inputMode="decimal" value={time} onChange={(e) => setTime(e.target.value)} placeholder="2.5"
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
        </label>
      </div>
      <div className="mt-6 rounded-lg bg-brand-50 p-4 dark:bg-slate-800">
        {result === null ? (
          <p className="text-slate-600 dark:text-slate-400">{t("result.empty")}</p>
        ) : (
          <>
            <p className="text-sm text-slate-600 dark:text-slate-400">{t("result.label")}</p>
            <p className="text-3xl font-bold">{fmt.format(result)} <span className="text-xl font-medium">km/h</span></p>
          </>
        )}
      </div>
    </div>
  );
}
