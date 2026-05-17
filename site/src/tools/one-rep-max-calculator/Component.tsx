"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

const PCT_TABLE: { reps: number; pct: number }[] = [
  { reps: 1, pct: 100 },
  { reps: 2, pct: 95 },
  { reps: 3, pct: 92 },
  { reps: 4, pct: 89 },
  { reps: 5, pct: 86 },
  { reps: 6, pct: 83 },
  { reps: 7, pct: 80 },
  { reps: 8, pct: 78 },
  { reps: 9, pct: 75 },
  { reps: 10, pct: 73 },
  { reps: 12, pct: 70 },
  { reps: 15, pct: 65 },
];

export default function OneRepMaxCalculator() {
  const t = useTranslations("tools.one-rep-max-calculator");
  const locale = useLocale();
  const [weight, setWeight] = useState("100");
  const [reps, setReps] = useState("5");

  const result = useMemo(() => {
    const w = parseFloat(weight);
    const r = parseInt(reps, 10);
    if (!isFinite(w) || !isFinite(r) || w <= 0 || r < 1 || r > 20) return null;
    const epley = w * (1 + r / 30);
    const brzycki = w * (36 / (37 - r));
    const lombardi = w * Math.pow(r, 0.10);
    const oconner = w * (1 + 0.025 * r);
    const lander = (100 * w) / (101.3 - 2.67123 * r);
    const avg = (epley + brzycki + lombardi + oconner + lander) / 5;
    const percentages = PCT_TABLE.map((p) => ({
      reps: p.reps,
      weight: (avg * p.pct) / 100,
      pct: p.pct,
    }));
    return { epley, brzycki, lombardi, oconner, lander, avg, percentages };
  }, [weight, reps]);

  const fmt = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }), [locale]);

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">{t("input.weight")}</span>
          <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 tabular-nums dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.reps")}</span>
          <input type="number" min={1} max={20} value={reps} onChange={(e) => setReps(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 tabular-nums dark:border-slate-700 dark:bg-slate-900" />
        </label>
      </div>

      <div aria-live="polite" className="mt-6 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
        {result ? (
          <div>
            <div className="rounded bg-emerald-50 px-3 py-2 dark:bg-emerald-900/20">
              <dt className="text-xs font-medium text-emerald-900 dark:text-emerald-200">{t("result.estimated1RM")}</dt>
              <dd className="tabular-nums text-3xl font-bold">{fmt.format(result.avg)}</dd>
              <dd className="text-xs text-slate-600 dark:text-slate-400">{t("result.avgNote")}</dd>
            </div>
            <h3 className="mt-4 text-sm font-medium">{t("result.formulasHeading")}</h3>
            <dl className="mt-2 grid gap-1 text-sm">
              <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800"><dt>Epley</dt><dd className="tabular-nums">{fmt.format(result.epley)}</dd></div>
              <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800"><dt>Brzycki</dt><dd className="tabular-nums">{fmt.format(result.brzycki)}</dd></div>
              <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800"><dt>Lombardi</dt><dd className="tabular-nums">{fmt.format(result.lombardi)}</dd></div>
              <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800"><dt>O&apos;Conner</dt><dd className="tabular-nums">{fmt.format(result.oconner)}</dd></div>
              <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800"><dt>Lander</dt><dd className="tabular-nums">{fmt.format(result.lander)}</dd></div>
            </dl>
            <h3 className="mt-4 text-sm font-medium">{t("result.percentTableHeading")}</h3>
            <table className="mt-2 w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="py-1 text-left">{t("result.repsCol")}</th>
                  <th className="py-1 text-right">%</th>
                  <th className="py-1 text-right">{t("result.weightCol")}</th>
                </tr>
              </thead>
              <tbody>
                {result.percentages.map((p) => (
                  <tr key={p.reps} className="border-b border-slate-100 dark:border-slate-800">
                    <td className="py-1 tabular-nums">{p.reps}</td>
                    <td className="py-1 text-right tabular-nums">{p.pct}%</td>
                    <td className="py-1 text-right tabular-nums">{fmt.format(p.weight)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-sm text-slate-600 dark:text-slate-400">{t("empty")}</div>
        )}
      </div>
    </div>
  );
}
