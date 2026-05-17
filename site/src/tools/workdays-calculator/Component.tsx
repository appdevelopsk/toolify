"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

function parseHolidays(input: string): Set<string> {
  return new Set(
    input
      .split(/[\s,;\n]+/)
      .map((s) => s.trim())
      .filter(Boolean),
  );
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function countWorkdays(
  start: Date,
  end: Date,
  weekend: Set<number>,
  holidays: Set<string>,
): { workdays: number; weekendDays: number; holidayDays: number; total: number } {
  if (start > end) return { workdays: 0, weekendDays: 0, holidayDays: 0, total: 0 };
  let workdays = 0;
  let weekendDays = 0;
  let holidayDays = 0;
  let total = 0;
  const cur = new Date(start);
  while (cur <= end) {
    total++;
    const dow = cur.getDay();
    const dStr = isoDate(cur);
    if (weekend.has(dow)) {
      weekendDays++;
    } else if (holidays.has(dStr)) {
      holidayDays++;
    } else {
      workdays++;
    }
    cur.setDate(cur.getDate() + 1);
  }
  return { workdays, weekendDays, holidayDays, total };
}

export default function WorkdaysCalculator() {
  const t = useTranslations("tools.workdays-calculator");
  const locale = useLocale();
  const today = new Date();
  const todayStr = isoDate(today);
  const futureStr = isoDate(new Date(today.getTime() + 30 * 86400000));
  const [start, setStart] = useState(todayStr);
  const [end, setEnd] = useState(futureStr);
  const [includeSat, setIncludeSat] = useState(false);
  const [includeSun, setIncludeSun] = useState(false);
  const [holidays, setHolidays] = useState("");

  const result = useMemo(() => {
    const sd = new Date(start + "T00:00:00");
    const ed = new Date(end + "T00:00:00");
    if (isNaN(sd.getTime()) || isNaN(ed.getTime())) return null;
    const weekend = new Set<number>();
    if (!includeSat) weekend.add(6);
    if (!includeSun) weekend.add(0);
    const hSet = parseHolidays(holidays);
    return countWorkdays(sd, ed, weekend, hSet);
  }, [start, end, includeSat, includeSun, holidays]);

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">{t("input.start")}</span>
          <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.end")}</span>
          <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
        </label>
      </div>

      <div className="mt-3 flex flex-wrap gap-3 text-sm">
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" checked={includeSat} onChange={(e) => setIncludeSat(e.target.checked)} />
          <span>{t("input.includeSat")}</span>
        </label>
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" checked={includeSun} onChange={(e) => setIncludeSun(e.target.checked)} />
          <span>{t("input.includeSun")}</span>
        </label>
      </div>

      <label className="mt-3 block">
        <span className="text-sm font-medium">{t("input.holidays")}</span>
        <textarea
          value={holidays}
          onChange={(e) => setHolidays(e.target.value)}
          rows={3}
          placeholder="2026-01-01, 2026-12-25"
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-mono text-sm dark:border-slate-700 dark:bg-slate-900"
        />
        <span className="text-xs text-slate-600 dark:text-slate-400">{t("input.holidaysHint")}</span>
      </label>

      <div aria-live="polite" className="mt-6 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
        {result && result.total > 0 ? (
          <dl className="grid gap-2 text-sm">
            <div className="flex justify-between rounded bg-emerald-50 px-3 py-2 dark:bg-emerald-900/20">
              <dt className="font-medium">{t("result.workdays")}</dt>
              <dd className="tabular-nums text-2xl font-bold">{result.workdays}</dd>
            </div>
            <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800"><dt>{t("result.weekendDays")}</dt><dd className="tabular-nums">{result.weekendDays}</dd></div>
            <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800"><dt>{t("result.holidayDays")}</dt><dd className="tabular-nums">{result.holidayDays}</dd></div>
            <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800"><dt>{t("result.total")}</dt><dd className="tabular-nums">{result.total}</dd></div>
          </dl>
        ) : (
          <div className="text-sm text-slate-600 dark:text-slate-400">{t("empty")}</div>
        )}
      </div>
    </div>
  );
}
