"use client";

import { useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";

export default function ExponentCalculator() {
  const t = useTranslations("tools.exponent-calculator");
  const locale = useLocale();
  const [base, setBase] = useState("");
  const [exponent, setExponent] = useState("");

  const result = useMemo(() => {
    const b = parseFloat(base), e = parseFloat(exponent);
    if (![b, e].every(isFinite)) return null;
    const v = Math.pow(b, e);
    if (!isFinite(v)) return null;
    return v;
  }, [base, exponent]);

  const fmt = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 6 }), [locale]);

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">{t("input.base")}</span>
          <input inputMode="decimal" value={base} onChange={(e) => setBase(e.target.value)} placeholder="2"
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.exponent")}</span>
          <input inputMode="decimal" value={exponent} onChange={(e) => setExponent(e.target.value)} placeholder="10"
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
