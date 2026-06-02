"use client";

import { useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";

export default function ZScoreCalculator() {
  const t = useTranslations("tools.z-score-calculator");
  const locale = useLocale();
  const [value, setValue] = useState("");
  const [mean, setMean] = useState("");
  const [sd, setSd] = useState("");

  const result = useMemo(() => {
    const x = parseFloat(value), m = parseFloat(mean), s = parseFloat(sd);
    if (![x, m, s].every(isFinite) || s <= 0) return null;
    return (x - m) / s;
  }, [value, mean, sd]);

  const fmt = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 4 }), [locale]);

  const field = (label: string, val: string, set: (v: string) => void, ph: string) => (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <input
        inputMode="decimal"
        value={val}
        onChange={(e) => set(e.target.value)}
        placeholder={ph}
        className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
      />
    </label>
  );

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-3">
        {field(t("input.value"), value, setValue, "85")}
        {field(t("input.mean"), mean, setMean, "70")}
        {field(t("input.sd"), sd, setSd, "10")}
      </div>

      <div className="mt-6 rounded-lg bg-brand-50 p-4 dark:bg-slate-800">
        {result === null ? (
          <p className="text-slate-600 dark:text-slate-400">{t("result.empty")}</p>
        ) : (
          <>
            <p className="text-sm text-slate-600 dark:text-slate-400">{t("result.label")}</p>
            <p className="text-3xl font-bold">z = {fmt.format(result)}</p>
          </>
        )}
      </div>
    </div>
  );
}
