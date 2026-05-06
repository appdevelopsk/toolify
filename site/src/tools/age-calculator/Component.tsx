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

function diffYMD(birth: Date, now: Date) {
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  let days = now.getDate() - birth.getDate();
  if (days < 0) {
    months -= 1;
    const prev = new Date(now.getFullYear(), now.getMonth(), 0);
    days += prev.getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  return { years, months, days };
}

export default function AgeCalculator() {
  const t = useTranslations("tools.age-calculator");
  const locale = useLocale();
  const [birth, setBirth] = useState("");
  const [target, setTarget] = useState(todayIso());

  const result = useMemo(() => {
    if (!birth) return null;
    const b = new Date(birth);
    const n = new Date(target);
    if (isNaN(b.getTime()) || isNaN(n.getTime()) || b > n) return null;
    const ymd = diffYMD(b, n);
    const totalDays = Math.floor((n.getTime() - b.getTime()) / 86400000);
    const totalWeeks = Math.floor(totalDays / 7);
    const totalMonths = ymd.years * 12 + ymd.months;
    const totalHours = totalDays * 24;
    return { ...ymd, totalDays, totalWeeks, totalMonths, totalHours };
  }, [birth, target]);

  const fmt = useMemo(() => new Intl.NumberFormat(locale), [locale]);

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">{t("input.birth")}</span>
          <input
            type="date"
            value={birth}
            onChange={(e) => setBirth(e.target.value)}
            max={todayIso()}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.target")}</span>
          <input
            type="date"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          />
        </label>
      </div>

      <div
        aria-live="polite"
        className={`mt-6 rounded-lg border p-4 ${
          result
            ? "border-brand-200 bg-brand-50 dark:border-brand-900 dark:bg-brand-900/20"
            : "border-slate-200 dark:border-slate-800"
        }`}
      >
        {result ? (
          <>
            <div className="text-sm uppercase tracking-wider text-slate-500">{t("result.label")}</div>
            <div className="mt-1 text-3xl font-bold tabular-nums">
              {t("result.ymd", { years: result.years, months: result.months, days: result.days })}
            </div>
            <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
              <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800">
                <dt>{t("result.totalMonths")}</dt>
                <dd className="tabular-nums">{fmt.format(result.totalMonths)}</dd>
              </div>
              <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800">
                <dt>{t("result.totalWeeks")}</dt>
                <dd className="tabular-nums">{fmt.format(result.totalWeeks)}</dd>
              </div>
              <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800">
                <dt>{t("result.totalDays")}</dt>
                <dd className="tabular-nums">{fmt.format(result.totalDays)}</dd>
              </div>
              <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800">
                <dt>{t("result.totalHours")}</dt>
                <dd className="tabular-nums">{fmt.format(result.totalHours)}</dd>
              </div>
            </dl>
          </>
        ) : (
          <div className="text-sm text-slate-500">{t("result.empty")}</div>
        )}
      </div>
    </div>
  );
}
