"use client";

import { useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";

export default function DensityCalculator() {
  const t = useTranslations("tools.density-calculator");
  const locale = useLocale();
  // 空欄で着地すると結果が何も描かれず、道具が動くことが伝わらないまま離脱する。
  // 代表値を初期表示し、最初の描画から結果を見せる(2026-08-22)。
  const [mass, setMass] = useState(() => "100");
  const [volume, setVolume] = useState(() => "50");

  const result = useMemo(() => {
    const m = parseFloat(mass), v = parseFloat(volume);
    if (![m, v].every(isFinite) || v <= 0 || m < 0) return null;
    return m / v;
  }, [mass, volume]);

  const fmt = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 4 }), [locale]);

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">{t("input.mass")}</span>
          <input inputMode="decimal" value={mass} onChange={(e) => setMass(e.target.value)} placeholder="100"
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.volume")}</span>
          <input inputMode="decimal" value={volume} onChange={(e) => setVolume(e.target.value)} placeholder="50"
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
        </label>
      </div>
      <div className="mt-6 rounded-lg bg-brand-50 p-4 dark:bg-slate-800">
        {result === null ? (
          <p className="text-slate-600 dark:text-slate-400">{t("result.empty")}</p>
        ) : (
          <>
            <p className="text-sm text-slate-600 dark:text-slate-400">{t("result.label")}</p>
            <p className="text-3xl font-bold">{fmt.format(result)} <span className="text-xl font-medium">g/cm³</span></p>
          </>
        )}
      </div>
    </div>
  );
}
