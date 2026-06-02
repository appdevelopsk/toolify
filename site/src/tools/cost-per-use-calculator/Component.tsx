"use client";

import { useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";

export default function CostPerUseCalculator() {
  const t = useTranslations("tools.cost-per-use-calculator");
  const locale = useLocale();
  const [price, setPrice] = useState("");
  const [uses, setUses] = useState("");

  const result = useMemo(() => {
    const p = parseFloat(price), u = parseFloat(uses);
    if (![p, u].every(isFinite) || p < 0 || u <= 0) return null;
    return p / u;
  }, [price, uses]);

  const fmt = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }), [locale]);

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">{t("input.price")}</span>
          <input inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="120"
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.uses")}</span>
          <input inputMode="numeric" value={uses} onChange={(e) => setUses(e.target.value)} placeholder="200"
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
