"use client";

import { useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";

export default function MolarityCalculator() {
  const t = useTranslations("tools.molarity-calculator");
  const locale = useLocale();
  const [molarity, setMolarity] = useState("");
  const [volume, setVolume] = useState("");

  const result = useMemo(() => {
    const m = parseFloat(molarity), v = parseFloat(volume);
    if (![m, v].every(isFinite) || m < 0 || v < 0) return null;
    return m * v;
  }, [molarity, volume]);

  const fmt = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 4 }), [locale]);

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">{t("input.molarity")}</span>
          <input inputMode="decimal" value={molarity} onChange={(e) => setMolarity(e.target.value)} placeholder="0.5"
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.volume")}</span>
          <input inputMode="decimal" value={volume} onChange={(e) => setVolume(e.target.value)} placeholder="2"
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
        </label>
      </div>
      <div className="mt-6 rounded-lg bg-brand-50 p-4 dark:bg-slate-800">
        {result === null ? (
          <p className="text-slate-600 dark:text-slate-400">{t("result.empty")}</p>
        ) : (
          <>
            <p className="text-sm text-slate-600 dark:text-slate-400">{t("result.label")}</p>
            <p className="text-3xl font-bold">{fmt.format(result)} <span className="text-xl font-medium">mol</span></p>
          </>
        )}
      </div>
    </div>
  );
}
