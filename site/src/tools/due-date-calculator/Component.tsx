"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

function pad(n: number) {
  return String(n).padStart(2, "0");
}
function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}
function diffDays(a: Date, b: Date) {
  return Math.floor((b.getTime() - a.getTime()) / 86400000);
}

type Mode = "lmp" | "conception";

export default function DueDateCalculator() {
  const t = useTranslations("tools.due-date-calculator");
  const locale = useLocale();
  const [mode, setMode] = useState<Mode>("lmp");
  const [refDate, setRefDate] = useState("");

  const result = useMemo(() => {
    if (!refDate) return null;
    const d = new Date(refDate);
    if (isNaN(d.getTime())) return null;
    // LMP: due date = LMP + 280 days. Conception: + 266 days.
    const dueDate = addDays(d, mode === "lmp" ? 280 : 266);
    const today = new Date(todayIso());
    const conception = mode === "lmp" ? addDays(d, 14) : d;
    const totalDaysFromConception = diffDays(conception, today);
    const weeksFrom = mode === "lmp" ? Math.floor(diffDays(d, today) / 7) : Math.floor(diffDays(addDays(d, -14), today) / 7);
    const daysToDue = diffDays(today, dueDate);
    const trimester = weeksFrom <= 13 ? 1 : weeksFrom <= 26 ? 2 : 3;
    return { dueDate, conception, weeksFrom: Math.max(0, weeksFrom), daysToDue, trimester, totalDaysFromConception };
  }, [mode, refDate]);

  const dateFmt = useMemo(() => new Intl.DateTimeFormat(locale, { dateStyle: "full" }), [locale]);

  return (
    <div>
      <div className="mb-4 inline-flex rounded-md border border-slate-300 dark:border-slate-700">
        <button onClick={() => setMode("lmp")} className={`px-3 py-1.5 text-sm ${mode === "lmp" ? "bg-brand-600 text-white" : ""}`}>
          {t("mode.lmp")}
        </button>
        <button onClick={() => setMode("conception")} className={`px-3 py-1.5 text-sm ${mode === "conception" ? "bg-brand-600 text-white" : ""}`}>
          {t("mode.conception")}
        </button>
      </div>

      <label className="block">
        <span className="text-sm font-medium">{t(`input.${mode}`)}</span>
        <input type="date" value={refDate} onChange={(e) => setRefDate(e.target.value)} max={todayIso()} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
      </label>

      <div aria-live="polite" className={`mt-6 rounded-lg border p-4 ${result ? "border-brand-200 bg-brand-50 dark:border-brand-900 dark:bg-brand-900/20" : "border-slate-200 dark:border-slate-800"}`}>
        {result ? (
          <>
            <div className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">{t("result.dueDate")}</div>
            <div className="mt-1 text-2xl font-bold">{dateFmt.format(result.dueDate)}</div>
            <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
              <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800">
                <dt>{t("result.gestationalWeeks")}</dt>
                <dd className="tabular-nums">{result.weeksFrom}</dd>
              </div>
              <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800">
                <dt>{t("result.daysToDue")}</dt>
                <dd className="tabular-nums">{result.daysToDue}</dd>
              </div>
              <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800">
                <dt>{t("result.trimester")}</dt>
                <dd>{t(`result.t${result.trimester}`)}</dd>
              </div>
              <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800">
                <dt>{t("result.estimatedConception")}</dt>
                <dd>{dateFmt.format(result.conception)}</dd>
              </div>
            </dl>
          </>
        ) : (
          <div className="text-sm text-slate-600 dark:text-slate-400">{t("empty")}</div>
        )}
      </div>
    </div>
  );
}
