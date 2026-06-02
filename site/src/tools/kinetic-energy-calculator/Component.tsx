"use client";

import { useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";

export default function KineticEnergyCalculator() {
  const t = useTranslations("tools.kinetic-energy-calculator");
  const locale = useLocale();
  const [mass, setMass] = useState("");
  const [velocity, setVelocity] = useState("");

  const result = useMemo(() => {
    const m = parseFloat(mass), v = parseFloat(velocity);
    if (![m, v].every(isFinite) || m < 0) return null;
    return 0.5 * m * v * v;
  }, [mass, velocity]);

  const fmt = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }), [locale]);

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">{t("input.mass")}</span>
          <input inputMode="decimal" value={mass} onChange={(e) => setMass(e.target.value)} placeholder="2"
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.velocity")}</span>
          <input inputMode="decimal" value={velocity} onChange={(e) => setVelocity(e.target.value)} placeholder="10"
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
        </label>
      </div>
      <div className="mt-6 rounded-lg bg-brand-50 p-4 dark:bg-slate-800">
        {result === null ? (
          <p className="text-slate-600 dark:text-slate-400">{t("result.empty")}</p>
        ) : (
          <>
            <p className="text-sm text-slate-600 dark:text-slate-400">{t("result.label")}</p>
            <p className="text-3xl font-bold">{fmt.format(result)} <span className="text-xl font-medium">J</span></p>
          </>
        )}
      </div>
    </div>
  );
}
