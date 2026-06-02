"use client";

import { useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";

export default function HalfLifeCalculator() {
  const t = useTranslations("tools.half-life-calculator");
  const locale = useLocale();
  const [initial, setInitial] = useState("");
  const [elapsed, setElapsed] = useState("");
  const [halfLife, setHalfLife] = useState("");

  const result = useMemo(() => {
    const i = parseFloat(initial), e = parseFloat(elapsed), h = parseFloat(halfLife);
    if (![i, e, h].every(isFinite) || i < 0 || e < 0 || h <= 0) return null;
    return i * Math.pow(0.5, e / h);
  }, [initial, elapsed, halfLife]);

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
      <div className="grid gap-4 sm:grid-cols-3">
        {field(t("input.initial"), initial, setInitial, "100")}
        {field(t("input.elapsed"), elapsed, setElapsed, "10")}
        {field(t("input.halfLife"), halfLife, setHalfLife, "5")}
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
