"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function isoWeek(d: Date): { year: number; week: number; weekday: number } {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7; // Sunday = 7
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return { year: date.getUTCFullYear(), week, weekday: dayNum };
}

function dayOfYear(d: Date): number {
  const start = new Date(d.getFullYear(), 0, 0);
  const diff = d.getTime() - start.getTime() + (start.getTimezoneOffset() - d.getTimezoneOffset()) * 60000;
  return Math.floor(diff / 86400000);
}

function weeksInYear(year: number): number {
  // Year has 53 weeks if Jan 1 is Thursday or Dec 31 is Thursday
  const jan1 = new Date(year, 0, 1).getDay();
  const dec31 = new Date(year, 11, 31).getDay();
  return jan1 === 4 || dec31 === 4 ? 53 : 52;
}

export default function IsoWeekCalculator() {
  const t = useTranslations("tools.iso-week-calculator");
  const locale = useLocale();
  const today = new Date();
  const [date, setDate] = useState(isoDate(today));

  const result = useMemo(() => {
    const d = new Date(date + "T12:00:00");
    if (isNaN(d.getTime())) return null;
    const w = isoWeek(d);
    const doy = dayOfYear(d);
    const wIY = weeksInYear(w.year);
    // Compute Monday of the ISO week
    const monday = new Date(d);
    monday.setDate(monday.getDate() - ((d.getDay() || 7) - 1));
    const sunday = new Date(monday);
    sunday.setDate(sunday.getDate() + 6);
    return { ...w, dayOfYear: doy, weeksInYear: wIY, monday, sunday };
  }, [date]);

  const fmtDate = useMemo(() => new Intl.DateTimeFormat(locale, { year: "numeric", month: "long", day: "numeric", weekday: "short" }), [locale]);
  const dayNames = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(locale, { weekday: "long" });
    return [1, 2, 3, 4, 5, 6, 7].map((n) => {
      const d = new Date(2026, 0, 4 + n); // Jan 5 2026 is Monday
      return fmt.format(d);
    });
  }, [locale]);

  return (
    <div>
      <label className="block">
        <span className="text-sm font-medium">{t("input.date")}</span>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
      </label>

      <div className="mt-3 flex flex-wrap gap-2">
        <button onClick={() => setDate(isoDate(new Date()))} className="rounded border border-slate-300 px-3 py-1 text-xs hover:border-brand-500 dark:border-slate-700">{t("today")}</button>
      </div>

      <div aria-live="polite" className="mt-6 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
        {result ? (
          <div>
            <div className="rounded bg-emerald-50 p-3 text-center dark:bg-emerald-900/20">
              <div className="text-xs font-medium">{t("result.iso")}</div>
              <div className="font-mono text-3xl font-bold tabular-nums">
                {result.year}-W{String(result.week).padStart(2, "0")}-{result.weekday}
              </div>
            </div>
            <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
              <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800">
                <dt>{t("result.weekNumber")}</dt>
                <dd className="tabular-nums font-bold">{result.week}</dd>
              </div>
              <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800">
                <dt>{t("result.weekday")}</dt>
                <dd>{dayNames[result.weekday - 1]}</dd>
              </div>
              <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800">
                <dt>{t("result.weekStart")}</dt>
                <dd className="tabular-nums">{fmtDate.format(result.monday)}</dd>
              </div>
              <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800">
                <dt>{t("result.weekEnd")}</dt>
                <dd className="tabular-nums">{fmtDate.format(result.sunday)}</dd>
              </div>
              <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800">
                <dt>{t("result.dayOfYear")}</dt>
                <dd className="tabular-nums">{result.dayOfYear}</dd>
              </div>
              <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800">
                <dt>{t("result.weeksInYear")}</dt>
                <dd className="tabular-nums">{result.weeksInYear}</dd>
              </div>
            </dl>
          </div>
        ) : (
          <div className="text-sm text-slate-600 dark:text-slate-400">{t("empty")}</div>
        )}
      </div>
    </div>
  );
}
