"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

function diffYMD(a: Date, b: Date): { y: number; m: number; d: number } {
  let earlier = a < b ? a : b;
  let later = a < b ? b : a;
  let y = later.getFullYear() - earlier.getFullYear();
  let m = later.getMonth() - earlier.getMonth();
  let d = later.getDate() - earlier.getDate();
  if (d < 0) {
    m--;
    const prev = new Date(later.getFullYear(), later.getMonth(), 0);
    d += prev.getDate();
  }
  if (m < 0) {
    y--;
    m += 12;
  }
  return { y, m, d };
}

export default function AgeDifferenceCalculator() {
  const t = useTranslations("tools.age-difference-calculator");
  const locale = useLocale();
  const [d1, setD1] = useState("1990-05-15");
  const [d2, setD2] = useState("1992-08-23");
  const [n1, setN1] = useState("Person A");
  const [n2, setN2] = useState("Person B");

  const result = useMemo(() => {
    const a = new Date(d1 + "T00:00:00");
    const b = new Date(d2 + "T00:00:00");
    if (isNaN(a.getTime()) || isNaN(b.getTime())) return null;
    const ymd = diffYMD(a, b);
    const totalDays = Math.abs(Math.round((b.getTime() - a.getTime()) / 86400000));
    const totalMonths = ymd.y * 12 + ymd.m;
    const totalWeeks = Math.floor(totalDays / 7);
    const elder = a < b ? n1 || "A" : n2 || "B";
    const younger = a < b ? n2 || "B" : n1 || "A";
    return { ymd, totalDays, totalMonths, totalWeeks, elder, younger };
  }, [d1, d2, n1, n2]);

  const fmt = useMemo(() => new Intl.NumberFormat(locale), [locale]);

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded border border-slate-200 p-3 dark:border-slate-800">
          <label className="block">
            <span className="text-sm font-medium">{t("input.name1")}</span>
            <input value={n1} onChange={(e) => setN1(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
          </label>
          <label className="mt-2 block">
            <span className="text-sm font-medium">{t("input.birth1")}</span>
            <input type="date" value={d1} onChange={(e) => setD1(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
          </label>
        </div>
        <div className="rounded border border-slate-200 p-3 dark:border-slate-800">
          <label className="block">
            <span className="text-sm font-medium">{t("input.name2")}</span>
            <input value={n2} onChange={(e) => setN2(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
          </label>
          <label className="mt-2 block">
            <span className="text-sm font-medium">{t("input.birth2")}</span>
            <input type="date" value={d2} onChange={(e) => setD2(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
          </label>
        </div>
      </div>

      <div aria-live="polite" className="mt-6 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
        {result ? (
          <div>
            <div className="rounded bg-emerald-50 p-3 text-center dark:bg-emerald-900/20">
              <div className="text-xs">{t("result.elderYounger", { elder: result.elder, younger: result.younger })}</div>
              <div className="mt-1 font-mono text-3xl font-bold tabular-nums">
                {result.ymd.y > 0 && <span>{result.ymd.y}{t("result.y")} </span>}
                {result.ymd.m > 0 && <span>{result.ymd.m}{t("result.m")} </span>}
                {result.ymd.d}{t("result.d")}
              </div>
            </div>
            <dl className="mt-4 grid gap-1 text-sm sm:grid-cols-2">
              <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800"><dt>{t("result.totalDays")}</dt><dd className="tabular-nums">{fmt.format(result.totalDays)}</dd></div>
              <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800"><dt>{t("result.totalWeeks")}</dt><dd className="tabular-nums">{fmt.format(result.totalWeeks)}</dd></div>
              <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800"><dt>{t("result.totalMonths")}</dt><dd className="tabular-nums">{fmt.format(result.totalMonths)}</dd></div>
              <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800"><dt>{t("result.totalHours")}</dt><dd className="tabular-nums">{fmt.format(result.totalDays * 24)}</dd></div>
            </dl>
          </div>
        ) : (
          <div className="text-sm text-slate-500">{t("empty")}</div>
        )}
      </div>
    </div>
  );
}
