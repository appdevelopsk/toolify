"use client";

import { useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";

export default function ProportionCalculator() {
  const t = useTranslations("tools.proportion-calculator");
  const locale = useLocale();
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [c, setC] = useState("");

  const result = useMemo(() => {
    const av = parseFloat(a), bv = parseFloat(b), cv = parseFloat(c);
    if (![av, bv, cv].every(isFinite) || av === 0) return null;
    return (bv * cv) / av; // a/b = c/x  =>  x = b*c/a
  }, [a, b, c]);

  const fmt = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 4 }), [locale]);

  const field = (label: string, val: string, set: (v: string) => void, ph: string) => (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <input inputMode="decimal" value={val} onChange={(e) => set(e.target.value)} placeholder={ph}
        className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
    </label>
  );

  return (
    <div>
      <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">a / b = c / x</p>
      <div className="grid gap-4 sm:grid-cols-3">
        {field(t("input.a"), a, setA, "2")}
        {field(t("input.b"), b, setB, "3")}
        {field(t("input.c"), c, setC, "8")}
      </div>
      <div className="mt-6 rounded-lg bg-brand-50 p-4 dark:bg-slate-800">
        {result === null ? (
          <p className="text-slate-600 dark:text-slate-400">{t("result.empty")}</p>
        ) : (
          <>
            <p className="text-sm text-slate-600 dark:text-slate-400">{t("result.label")}</p>
            <p className="text-3xl font-bold">x = {fmt.format(result)}</p>
          </>
        )}
      </div>
    </div>
  );
}
