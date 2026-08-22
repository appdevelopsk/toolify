"use client";

import { useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";

export default function ModuloCalculator() {
  const t = useTranslations("tools.modulo-calculator");
  const locale = useLocale();
  // 空欄で着地すると結果カードが何も描かれず、道具が動くことが伝わらないまま離脱する。
  // 代表値を初期表示し、最初の描画から結果を見せる(2026-08-22)。
  const [a, setA] = useState("17");
  const [b, setB] = useState("5");

  const result = useMemo(() => {
    const av = parseFloat(a), bv = parseFloat(b);
    if (![av, bv].every(isFinite) || bv === 0) return null;
    return av % bv;
  }, [a, b]);

  const fmt = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 6 }), [locale]);

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">{t("input.a")}</span>
          <input inputMode="decimal" value={a} onChange={(e) => setA(e.target.value)} placeholder="17"
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.b")}</span>
          <input inputMode="decimal" value={b} onChange={(e) => setB(e.target.value)} placeholder="5"
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
