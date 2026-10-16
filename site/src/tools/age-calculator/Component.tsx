"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useShareableState } from "@/lib/hooks/useShareableState";

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

// 基準日以降で最初の誕生日(2/29 生まれの平年は 3/1 とみなす)。日付はローカル暦で扱う。
function nextBirthday(birthIso: string, targetIso: string): { date: Date; days: number } | null {
  const bm = birthIso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const tm = targetIso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!bm || !tm) return null;
  const bMonth = +bm[2]! - 1;
  const bDay = +bm[3]!;
  const target = new Date(+tm[1]!, +tm[2]! - 1, +tm[3]!);
  for (let y = target.getFullYear(); y <= target.getFullYear() + 1; y++) {
    let d = new Date(y, bMonth, bDay);
    if (d.getMonth() !== bMonth) d = new Date(y, 2, 1);
    if (d >= target) {
      return { date: d, days: Math.round((d.getTime() - target.getTime()) / 86400000) };
    }
  }
  return null;
}

export default function AgeCalculator() {
  const t = useTranslations("tools.age-calculator");
  const locale = useLocale();
  // 空欄で着地すると結果カードが何も描かれず、道具が動くことが伝わらないまま離脱する。
  // 代表値を初期表示し、最初の描画から結果を見せる(2026-08-22)。
  // 生年月日は固定日。todayIso() 由来にすると SSR/CSR で値がズレる。
  const [birth, setBirth] = useState(() => "1990-01-01");
  const [target, setTarget] = useState(todayIso());

  useShareableState("age-calculator", { birth, target }, (d) => {
    const iso = /^\d{4}-\d{2}-\d{2}$/;
    if (typeof d.birth === "string" && iso.test(d.birth)) setBirth(d.birth);
    if (typeof d.target === "string" && iso.test(d.target)) setTarget(d.target);
  });

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
  const dateFmt = useMemo(
    () => new Intl.DateTimeFormat(locale, { year: "numeric", month: "long", day: "numeric", weekday: "long" }),
    [locale],
  );
  const extra = useMemo(() => {
    if (!result) return null;
    const bm = birth.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!bm) return null;
    const birthDate = new Date(+bm[1]!, +bm[2]! - 1, +bm[3]!);
    return { birthDate, next: nextBirthday(birth, target) };
  }, [result, birth, target]);

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
            <div className="text-sm uppercase tracking-wider text-slate-600 dark:text-slate-400">{t("result.label")}</div>
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
            {extra && (
              <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800">
                  <dt>{t("result.birthWeekday")}</dt>
                  <dd>{dateFmt.format(extra.birthDate)}</dd>
                </div>
                {extra.next && (
                  <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800">
                    <dt>{t("result.nextBirthday")}</dt>
                    <dd>{dateFmt.format(extra.next.date)} · {fmt.format(extra.next.days)} {t("result.daysLeftUnit")}</dd>
                  </div>
                )}
              </dl>
            )}
          </>
        ) : (
          <div className="text-sm text-slate-600 dark:text-slate-400">{t("result.empty")}</div>
        )}
      </div>
    </div>
  );
}
