"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

type Mode = "addSubtract" | "between";
type Op = "add" | "subtract";

function pad(n: number) { return String(n).padStart(2, "0"); }
function todayIso() { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }

function addToDate(d: Date, years: number, months: number, days: number): Date {
  const out = new Date(d);
  out.setFullYear(out.getFullYear() + years);
  out.setMonth(out.getMonth() + months);
  out.setDate(out.getDate() + days);
  return out;
}

function diffYMD(a: Date, b: Date) {
  // assume a <= b
  let years = b.getFullYear() - a.getFullYear();
  let months = b.getMonth() - a.getMonth();
  let days = b.getDate() - a.getDate();
  if (days < 0) {
    months -= 1;
    const prev = new Date(b.getFullYear(), b.getMonth(), 0);
    days += prev.getDate();
  }
  if (months < 0) { years -= 1; months += 12; }
  return { years, months, days };
}

export default function DateCalculator() {
  const t = useTranslations("tools.date-calculator");
  const locale = useLocale();
  const [mode, setMode] = useState<Mode>("addSubtract");
  const [op, setOp] = useState<Op>("add");
  const [start, setStart] = useState(todayIso());
  const [years, setYears] = useState("0");
  const [months, setMonths] = useState("0");
  const [days, setDays] = useState("0");
  const [endDate, setEndDate] = useState(todayIso());
  const [businessMode, setBusinessMode] = useState(false);

  const result = useMemo(() => {
    if (mode === "addSubtract") {
      const d = new Date(start);
      if (isNaN(d.getTime())) return null;
      const sign = op === "add" ? 1 : -1;
      if (businessMode) {
        // Add/subtract whole business days (Mon–Fri), ignoring years/months.
        let remaining = Math.abs(parseInt(days, 10) || 0);
        const out = new Date(d);
        while (remaining > 0) {
          out.setDate(out.getDate() + sign);
          const dow = out.getDay();
          if (dow !== 0 && dow !== 6) remaining--;
        }
        return { type: "date" as const, date: out };
      }
      const y = (parseInt(years, 10) || 0) * sign;
      const m = (parseInt(months, 10) || 0) * sign;
      const dd = (parseInt(days, 10) || 0) * sign;
      const out = addToDate(d, y, m, dd);
      return { type: "date" as const, date: out };
    } else {
      const a = new Date(start);
      const b = new Date(endDate);
      if (isNaN(a.getTime()) || isNaN(b.getTime())) return null;
      const [from, to] = a <= b ? [a, b] : [b, a];
      const ymd = diffYMD(from, to);
      const totalDays = Math.floor((to.getTime() - from.getTime()) / 86400000);
      const totalMonths = ymd.years * 12 + ymd.months;
      const totalWeeks = Math.floor(totalDays / 7);
      // Business days (Mon-Fri only, no holidays)
      let business = 0;
      const cursor = new Date(from);
      while (cursor < to) {
        const dow = cursor.getDay();
        if (dow !== 0 && dow !== 6) business++;
        cursor.setDate(cursor.getDate() + 1);
      }
      return { type: "diff" as const, ymd, totalDays, totalMonths, totalWeeks, business };
    }
  }, [mode, op, start, years, months, days, endDate, businessMode]);

  const dateFmt = useMemo(() => new Intl.DateTimeFormat(locale, { dateStyle: "full" }), [locale]);
  const fmt = useMemo(() => new Intl.NumberFormat(locale), [locale]);

  return (
    <div>
      <div className="mb-4 inline-flex rounded-md border border-slate-300 dark:border-slate-700">
        <button onClick={() => setMode("addSubtract")} className={`px-3 py-1.5 text-sm ${mode === "addSubtract" ? "bg-brand-600 text-white" : ""}`}>{t("mode.addSubtract")}</button>
        <button onClick={() => setMode("between")} className={`px-3 py-1.5 text-sm ${mode === "between" ? "bg-brand-600 text-white" : ""}`}>{t("mode.between")}</button>
      </div>

      <label className="block">
        <span className="text-sm font-medium">{t("input.start")}</span>
        <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
      </label>

      {mode === "addSubtract" ? (
        <>
          <div className="mt-3 inline-flex rounded-md border border-slate-300 dark:border-slate-700">
            <button onClick={() => setOp("add")} className={`px-3 py-1.5 text-sm ${op === "add" ? "bg-brand-600 text-white" : ""}`}>{t("op.add")}</button>
            <button onClick={() => setOp("subtract")} className={`px-3 py-1.5 text-sm ${op === "subtract" ? "bg-brand-600 text-white" : ""}`}>{t("op.subtract")}</button>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <label className="block">
              <span className="text-xs uppercase text-slate-600 dark:text-slate-400">{t("input.years")}</span>
              <input inputMode="numeric" value={years} onChange={(e) => setYears(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-center dark:border-slate-700 dark:bg-slate-900" />
            </label>
            <label className="block">
              <span className="text-xs uppercase text-slate-600 dark:text-slate-400">{t("input.months")}</span>
              <input inputMode="numeric" value={months} onChange={(e) => setMonths(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-center dark:border-slate-700 dark:bg-slate-900" />
            </label>
            <label className="block">
              <span className="text-xs uppercase text-slate-600 dark:text-slate-400">{t("input.days")}</span>
              <input inputMode="numeric" value={days} onChange={(e) => setDays(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-center dark:border-slate-700 dark:bg-slate-900" />
            </label>
          </div>
          <label className="mt-3 flex items-center gap-2 text-sm">
            <input type="checkbox" checked={businessMode} onChange={(e) => setBusinessMode(e.target.checked)} />
            <span>{t("input.businessDayMode")}</span>
          </label>
        </>
      ) : (
        <label className="mt-3 block">
          <span className="text-sm font-medium">{t("input.end")}</span>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
        </label>
      )}

      <div aria-live="polite" className={`mt-6 rounded-lg border p-4 ${result ? "border-brand-200 bg-brand-50 dark:border-brand-900 dark:bg-brand-900/20" : "border-slate-200 dark:border-slate-800"}`}>
        {result && result.type === "date" ? (
          <>
            <div className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">{t("result.resultDate")}</div>
            <div className="mt-1 text-3xl font-bold">{dateFmt.format(result.date)}</div>
          </>
        ) : result && result.type === "diff" ? (
          <>
            <div className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">{t("result.difference")}</div>
            <div className="mt-1 text-2xl font-bold tabular-nums">
              {t("result.ymd", { y: result.ymd.years, m: result.ymd.months, d: result.ymd.days })}
            </div>
            <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
              <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800"><dt>{t("result.totalDays")}</dt><dd className="tabular-nums">{fmt.format(result.totalDays)}</dd></div>
              <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800"><dt>{t("result.totalWeeks")}</dt><dd className="tabular-nums">{fmt.format(result.totalWeeks)}</dd></div>
              <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800"><dt>{t("result.totalMonths")}</dt><dd className="tabular-nums">{fmt.format(result.totalMonths)}</dd></div>
              <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800"><dt>{t("result.businessDays")}</dt><dd className="tabular-nums">{fmt.format(result.business)}</dd></div>
            </dl>
          </>
        ) : (
          <div className="text-sm text-slate-600 dark:text-slate-400">{t("empty")}</div>
        )}
      </div>
    </div>
  );
}
