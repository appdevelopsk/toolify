"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function addDays(d: Date, days: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + days);
  return r;
}

export default function PregnancyWeekCalculator() {
  const t = useTranslations("tools.pregnancy-week-calculator");
  const locale = useLocale();
  const today = new Date();
  const [lmp, setLmp] = useState(() => isoDate(addDays(today, -70)));

  const result = useMemo(() => {
    if (!lmp) return null;
    const start = new Date(lmp + "T00:00:00");
    if (isNaN(start.getTime())) return null;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((now.getTime() - start.getTime()) / 86400000);
    if (diffDays < 0 || diffDays > 320) return null;
    const weeks = Math.floor(diffDays / 7);
    const days = diffDays % 7;
    const trimester = weeks < 13 ? 1 : weeks < 27 ? 2 : 3;
    const dueDate = addDays(start, 280);
    const daysToDue = Math.floor((dueDate.getTime() - now.getTime()) / 86400000);
    const progressPct = Math.min(100, (diffDays / 280) * 100);
    return { weeks, days, trimester, diffDays, dueDate, daysToDue, progressPct };
  }, [lmp]);

  const fmt = useMemo(
    () => new Intl.DateTimeFormat(locale, { year: "numeric", month: "long", day: "numeric" }),
    [locale],
  );

  return (
    <div>
      <label className="block">
        <span className="text-sm font-medium">{t("input.lmp")}</span>
        <input type="date" value={lmp} onChange={(e) => setLmp(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
      </label>

      <div aria-live="polite" className="mt-6 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
        {result ? (
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold tabular-nums">{result.weeks}</span>
              <span className="text-2xl font-medium">{t("result.weeksUnit")}</span>
              <span className="text-2xl tabular-nums">{result.days}</span>
              <span className="text-2xl font-medium">{t("result.daysUnit")}</span>
            </div>
            <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
              <div className="h-full bg-rose-500" style={{ width: `${result.progressPct}%` }} />
            </div>
            <dl className="mt-4 grid gap-2 text-sm">
              <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800"><dt>{t("result.trimester")}</dt><dd>{t(`trimester.${result.trimester}`)}</dd></div>
              <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800"><dt>{t("result.dueDate")}</dt><dd className="tabular-nums">{fmt.format(result.dueDate)}</dd></div>
              <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800"><dt>{t("result.daysToDue")}</dt><dd className="tabular-nums">{result.daysToDue}</dd></div>
              <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800"><dt>{t("result.totalDays")}</dt><dd className="tabular-nums">{result.diffDays}</dd></div>
            </dl>
          </div>
        ) : (
          <div className="text-sm text-slate-500">{t("empty")}</div>
        )}
      </div>
    </div>
  );
}
