"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

const ZONES = [
  { id: "z1", lo: 0.5, hi: 0.6 },
  { id: "z2", lo: 0.6, hi: 0.7 },
  { id: "z3", lo: 0.7, hi: 0.8 },
  { id: "z4", lo: 0.8, hi: 0.9 },
  { id: "z5", lo: 0.9, hi: 1.0 },
];

export default function TargetHeartRateCalculator() {
  const t = useTranslations("tools.target-heart-rate-calculator");
  const locale = useLocale();
  const [age, setAge] = useState("30");
  const [restingHr, setRestingHr] = useState("60");
  const [useKarvonen, setUseKarvonen] = useState(true);

  const result = useMemo(() => {
    const a = parseFloat(age);
    const rhr = parseFloat(restingHr);
    if (![a, rhr].every(isFinite) || a <= 0 || a > 110 || rhr < 30 || rhr > 120) return null;
    const mhr = 220 - a;
    const hrr = mhr - rhr;
    const zones = ZONES.map((z) => {
      const lo = useKarvonen ? rhr + z.lo * hrr : mhr * z.lo;
      const hi = useKarvonen ? rhr + z.hi * hrr : mhr * z.hi;
      return { id: z.id, lo: Math.round(lo), hi: Math.round(hi) };
    });
    return { mhr, hrr, zones };
  }, [age, restingHr, useKarvonen]);

  const fmt = useMemo(() => new Intl.NumberFormat(locale), [locale]);

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">{t("input.age")}</span>
          <input type="number" value={age} onChange={(e) => setAge(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 tabular-nums dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.restingHr")}</span>
          <input type="number" value={restingHr} onChange={(e) => setRestingHr(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 tabular-nums dark:border-slate-700 dark:bg-slate-900" />
        </label>
      </div>

      <label className="mt-3 inline-flex items-center gap-2 text-sm">
        <input type="checkbox" checked={useKarvonen} onChange={(e) => setUseKarvonen(e.target.checked)} />
        <span>{t("input.useKarvonen")}</span>
      </label>

      <div aria-live="polite" className="mt-6 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
        {result ? (
          <div>
            <dl className="grid gap-2 text-sm sm:grid-cols-2">
              <div className="flex justify-between rounded bg-emerald-50 px-3 py-2 dark:bg-emerald-900/20">
                <dt className="font-medium">{t("result.mhr")}</dt>
                <dd className="tabular-nums text-xl font-bold">{fmt.format(result.mhr)}</dd>
              </div>
              <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800">
                <dt>{t("result.hrr")}</dt>
                <dd className="tabular-nums">{fmt.format(result.hrr)}</dd>
              </div>
            </dl>
            <h3 className="mt-4 text-sm font-medium">{t("result.zones")}</h3>
            <ul className="mt-2 space-y-1">
              {result.zones.map((z) => (
                <li key={z.id} className="flex items-center justify-between rounded border border-slate-200 px-3 py-2 dark:border-slate-800">
                  <div>
                    <div className="text-sm font-medium">{t(`zone.${z.id}.name`)}</div>
                    <div className="text-xs text-slate-500">{t(`zone.${z.id}.purpose`)}</div>
                  </div>
                  <div className="tabular-nums text-base font-bold">{fmt.format(z.lo)}–{fmt.format(z.hi)} bpm</div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="text-sm text-slate-500">{t("empty")}</div>
        )}
      </div>
    </div>
  );
}
