"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

function localDateTime(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

export default function HcgCalculator() {
  const t = useTranslations("tools.hcg-calculator");
  const [v1, setV1] = useState("50");
  const [v2, setV2] = useState("110");
  const [t1, setT1] = useState(() => localDateTime(new Date(Date.now() - 2 * 86400000)));
  const [t2, setT2] = useState(() => localDateTime(new Date()));

  const result = useMemo(() => {
    const a = parseFloat(v1);
    const b = parseFloat(v2);
    const d1 = new Date(t1);
    const d2 = new Date(t2);
    if (!isFinite(a) || !isFinite(b) || a <= 0 || b <= 0) return null;
    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return null;
    const hours = (d2.getTime() - d1.getTime()) / 3600000;
    if (hours <= 0) return null;

    const ratio = b / a;
    const trend: "rising" | "falling" | "same" = ratio > 1.0001 ? "rising" : ratio < 0.9999 ? "falling" : "same";

    let doublingTime: number | null = null;
    let halfLife: number | null = null;
    if (trend === "rising") doublingTime = (hours * Math.LN2) / Math.log(ratio);
    else if (trend === "falling") halfLife = (hours * Math.LN2) / Math.log(a / b);

    const rise48 = (Math.pow(ratio, 48 / hours) - 1) * 100;
    const riseDaily = (Math.pow(ratio, 24 / hours) - 1) * 100;

    return { hours, ratio, trend, doublingTime, halfLife, rise48, riseDaily };
  }, [v1, v2, t1, t2]);

  const num = (n: number, digits = 1) => n.toLocaleString(undefined, { maximumFractionDigits: digits });
  const inputBox = "mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900";

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">{t("input.value1")} (mIU/mL)</span>
          <input type="number" min={0} value={v1} onChange={(e) => setV1(e.target.value)} className={`${inputBox} tabular-nums`} />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.time1")}</span>
          <input type="datetime-local" value={t1} onChange={(e) => setT1(e.target.value)} className={inputBox} />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.value2")} (mIU/mL)</span>
          <input type="number" min={0} value={v2} onChange={(e) => setV2(e.target.value)} className={`${inputBox} tabular-nums`} />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.time2")}</span>
          <input type="datetime-local" value={t2} onChange={(e) => setT2(e.target.value)} className={inputBox} />
        </label>
      </div>

      <div aria-live="polite" className="mt-6 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
        {result ? (
          <>
            <div className="flex items-baseline gap-2">
              <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-sm font-medium text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">
                {t(`trend.${result.trend}`)}
              </span>
            </div>
            <dl className="mt-4 grid gap-2 text-sm">
              {result.doublingTime !== null && (
                <div className="flex justify-between rounded bg-emerald-50 px-3 py-2 dark:bg-emerald-900/20">
                  <dt className="font-medium">{t("result.doublingTime")}</dt>
                  <dd className="tabular-nums">{num(result.doublingTime)} {t("result.hoursUnit")}</dd>
                </div>
              )}
              {result.halfLife !== null && (
                <div className="flex justify-between rounded bg-amber-50 px-3 py-2 dark:bg-amber-900/20">
                  <dt className="font-medium">{t("result.halfLife")}</dt>
                  <dd className="tabular-nums">{num(result.halfLife)} {t("result.hoursUnit")}</dd>
                </div>
              )}
              <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800">
                <dt>{t("result.rise48")}</dt>
                <dd className="tabular-nums">{result.rise48 >= 0 ? "+" : ""}{num(result.rise48)}%</dd>
              </div>
              <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800">
                <dt>{t("result.riseDaily")}</dt>
                <dd className="tabular-nums">{result.riseDaily >= 0 ? "+" : ""}{num(result.riseDaily)}%</dd>
              </div>
              <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800">
                <dt>{t("result.hours")}</dt>
                <dd className="tabular-nums">{num(result.hours)} {t("result.hoursUnit")}</dd>
              </div>
            </dl>

            <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-200">
              {t("note")}
            </p>
          </>
        ) : (
          <div className="text-sm text-slate-600 dark:text-slate-400">{t("empty")}</div>
        )}
      </div>
    </div>
  );
}
