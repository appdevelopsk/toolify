"use client";

import { useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";

export default function WaistToHeightRatioCalculator() {
  const t = useTranslations("tools.waist-to-height-ratio-calculator");
  const locale = useLocale();
  // 空欄で着地すると結果カードが何も描かれず、道具が動くことが伝わらないまま離脱する。
  // 代表値を初期表示し、最初の描画から結果を見せる(2026-08-22)。
  const [waist, setWaist] = useState("80");
  const [height, setHeight] = useState("170");

  const result = useMemo(() => {
    const w = parseFloat(waist), h = parseFloat(height);
    if (![w, h].every(isFinite) || w <= 0 || h <= 0) return null;
    return w / h;
  }, [waist, height]);

  const fmt = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }), [locale]);

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">{t("input.waist")}</span>
          <input inputMode="decimal" value={waist} onChange={(e) => setWaist(e.target.value)} placeholder="80"
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.height")}</span>
          <input inputMode="decimal" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="170"
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
        </label>
      </div>
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
