"use client";

import { useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";

export default function LogarithmCalculator() {
  const t = useTranslations("tools.logarithm-calculator");
  const locale = useLocale();
  const [value, setValue] = useState("");
  const [base, setBase] = useState("10");

  const result = useMemo(() => {
    const x = parseFloat(value), b = parseFloat(base);
    if (![x, b].every(isFinite) || x <= 0 || b <= 0 || b === 1) return null;
    return Math.log(x) / Math.log(b);
  }, [value, base]);

  const fmt = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 6 }), [locale]);

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">{t("input.value")}</span>
          <input inputMode="decimal" value={value} onChange={(e) => setValue(e.target.value)} placeholder="1000"
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.base")}</span>
          <input inputMode="decimal" value={base} onChange={(e) => setBase(e.target.value)} placeholder="10"
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
