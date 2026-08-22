"use client";

import { useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";

export default function A1cCalculator() {
  const t = useTranslations("tools.a1c-calculator");
  const locale = useLocale();
  // 空欄で着地すると結果カードが何も描かれず、道具が動くことが伝わらないまま離脱する。
  // 代表値を初期表示し、最初の描画から結果を見せる(2026-08-22)。
  const [a1c, setA1c] = useState(() => "6.5");

  const result = useMemo(() => {
    const v = parseFloat(a1c);
    if (!isFinite(v) || v <= 0) return null;
    const mgdl = 28.7 * v - 46.7;
    return { mgdl, mmol: mgdl / 18 };
  }, [a1c]);

  const fmt = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }), [locale]);

  return (
    <div>
      <label className="block max-w-xs">
        <span className="text-sm font-medium">{t("input.a1c")}</span>
        <input inputMode="decimal" value={a1c} onChange={(e) => setA1c(e.target.value)} placeholder="6.5"
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
      </label>
      <div className="mt-6 rounded-lg bg-brand-50 p-4 dark:bg-slate-800">
        {result === null ? (
          <p className="text-slate-600 dark:text-slate-400">{t("result.empty")}</p>
        ) : (
          <>
            <p className="text-sm text-slate-600 dark:text-slate-400">{t("result.label")}</p>
            <p className="text-3xl font-bold">
              {fmt.format(result.mgdl)} <span className="text-xl font-medium">mg/dL</span>
              <span className="ml-2 text-base font-normal text-slate-500">≈ {fmt.format(result.mmol)} mmol/L</span>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
