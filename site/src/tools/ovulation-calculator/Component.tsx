"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

function addDays(d: Date, days: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + days);
  return r;
}

export default function OvulationCalculator() {
  const t = useTranslations("tools.ovulation-calculator");
  const locale = useLocale();
  const [lmp, setLmp] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 14);
    return d.toISOString().slice(0, 10);
  });
  const [cycleLength, setCycleLength] = useState("28");

  const result = useMemo(() => {
    if (!lmp) return null;
    const cl = parseInt(cycleLength, 10);
    if (!isFinite(cl) || cl < 21 || cl > 45) return null;
    const start = new Date(lmp + "T00:00:00");
    if (isNaN(start.getTime())) return null;
    // Ovulation typically occurs 14 days before next period (luteal phase ~14d).
    const ovulation = addDays(start, cl - 14);
    const fertileStart = addDays(ovulation, -5);
    const fertileEnd = addDays(ovulation, 1);
    const nextPeriod = addDays(start, cl);
    const dueDate = addDays(start, 280);
    return { ovulation, fertileStart, fertileEnd, nextPeriod, dueDate };
  }, [lmp, cycleLength]);

  const fmt = useMemo(
    () => new Intl.DateTimeFormat(locale, { year: "numeric", month: "long", day: "numeric", weekday: "short" }),
    [locale],
  );

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">{t("input.lmp")}</span>
          <input
            type="date"
            value={lmp}
            onChange={(e) => setLmp(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.cycleLength")}</span>
          <input
            type="number"
            min={21}
            max={45}
            value={cycleLength}
            onChange={(e) => setCycleLength(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 tabular-nums dark:border-slate-700 dark:bg-slate-900"
          />
        </label>
      </div>

      <div aria-live="polite" className="mt-6 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
        {result ? (
          <dl className="grid gap-2 text-sm">
            <div className="flex justify-between rounded bg-rose-50 px-3 py-2 dark:bg-rose-900/20">
              <dt className="font-medium">{t("result.ovulation")}</dt>
              <dd className="tabular-nums">{fmt.format(result.ovulation)}</dd>
            </div>
            <div className="flex justify-between rounded bg-emerald-50 px-3 py-2 dark:bg-emerald-900/20">
              <dt className="font-medium">{t("result.fertileWindow")}</dt>
              <dd className="tabular-nums">{fmt.format(result.fertileStart)} – {fmt.format(result.fertileEnd)}</dd>
            </div>
            <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800">
              <dt>{t("result.nextPeriod")}</dt>
              <dd className="tabular-nums">{fmt.format(result.nextPeriod)}</dd>
            </div>
            <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800">
              <dt>{t("result.dueDateIfPregnant")}</dt>
              <dd className="tabular-nums">{fmt.format(result.dueDate)}</dd>
            </div>
          </dl>
        ) : (
          <div className="text-sm text-slate-500">{t("empty")}</div>
        )}
      </div>
    </div>
  );
}
