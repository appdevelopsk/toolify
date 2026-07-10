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

type Mode = "lmp" | "ultrasound";

// Prenatal milestones by gestational week (typical windows; vary by country/provider),
// including trimester boundaries (ACOG: 2nd = 14w0d, 3rd = 28w0d) and the 40w due date.
const MILESTONES: { key: string; week: number }[] = [
  { key: "datingScan", week: 8 },
  { key: "nipt", week: 10 },
  { key: "ntScan", week: 12 },
  { key: "t2Start", week: 14 },
  { key: "anatomyScan", week: 20 },
  { key: "glucose", week: 26 },
  { key: "t3Start", week: 28 },
  { key: "tdap", week: 32 },
  { key: "gbs", week: 36 },
  { key: "fullTerm", week: 37 },
  { key: "edd", week: 40 },
];

export default function PregnancyWeekCalculator() {
  const t = useTranslations("tools.pregnancy-week-calculator");
  const locale = useLocale();
  const [mode, setMode] = useState<Mode>("lmp");
  const [lmp, setLmp] = useState(() => isoDate(addDays(new Date(), -70)));
  const [cycleLength, setCycleLength] = useState("28");
  const [scanDate, setScanDate] = useState(() => isoDate(new Date()));
  const [gaWeeks, setGaWeeks] = useState("12");
  const [gaDays, setGaDays] = useState("0");

  const result = useMemo(() => {
    // Resolve to an anchor LMP (the day a 280-day EDD counts from).
    let anchor: Date | null = null;
    if (mode === "lmp") {
      if (!lmp) return null;
      const start = new Date(lmp + "T00:00:00");
      const cyc = parseInt(cycleLength, 10);
      if (isNaN(start.getTime()) || !isFinite(cyc) || cyc < 21 || cyc > 45) return null;
      anchor = addDays(start, cyc - 28);
    } else {
      if (!scanDate) return null;
      const s = new Date(scanDate + "T00:00:00");
      const w = parseInt(gaWeeks, 10);
      const dd = parseInt(gaDays, 10);
      if (isNaN(s.getTime()) || !isFinite(w) || w < 4 || w > 42 || !isFinite(dd) || dd < 0 || dd > 6) return null;
      anchor = addDays(s, -(w * 7 + dd));
    }

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const gaDaysTotal = Math.floor((now.getTime() - anchor.getTime()) / 86400000);
    if (gaDaysTotal < 0 || gaDaysTotal > 320) return null;
    const weeks = Math.floor(gaDaysTotal / 7);
    const days = gaDaysTotal % 7;
    const fetalTotal = Math.max(0, gaDaysTotal - 14);
    const fetalW = Math.floor(fetalTotal / 7);
    const fetalD = fetalTotal % 7;
    // ACOG boundaries: 1st = 0–13w6d, 2nd = 14w0d–27w6d, 3rd = 28w0d+
    const trimester = weeks <= 13 ? 1 : weeks <= 27 ? 2 : 3;
    const dueDate = addDays(anchor, 280);
    const daysToDue = Math.floor((dueDate.getTime() - now.getTime()) / 86400000);
    const progressPct = Math.min(100, (gaDaysTotal / 280) * 100);

    const schedule = MILESTONES.map((m) => {
      const date = addDays(anchor!, m.week * 7);
      return { key: m.key, week: m.week, date, past: date.getTime() < now.getTime() };
    });

    return { weeks, days, fetalW, fetalD, trimester, gaDaysTotal, dueDate, daysToDue, progressPct, schedule };
  }, [mode, lmp, cycleLength, scanDate, gaWeeks, gaDays]);

  const fmt = useMemo(
    () => new Intl.DateTimeFormat(locale, { year: "numeric", month: "long", day: "numeric" }),
    [locale],
  );
  const medFmt = useMemo(() => new Intl.DateTimeFormat(locale, { dateStyle: "medium" }), [locale]);
  const inputBox = "mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900";

  return (
    <div>
      <div className="mb-4 inline-flex rounded-md border border-slate-300 p-1 dark:border-slate-700">
        {(["lmp", "ultrasound"] as Mode[]).map((m) => (
          <button key={m} onClick={() => setMode(m)} className={`rounded px-3 py-1.5 text-sm ${mode === m ? "bg-brand-600 text-white" : ""}`}>
            {t(`mode.${m}`)}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {mode === "lmp" ? (
          <>
            <label className="block">
              <span className="text-sm font-medium">{t("input.lmp")}</span>
              <input type="date" value={lmp} onChange={(e) => setLmp(e.target.value)} className={inputBox} />
            </label>
            <label className="block">
              <span className="text-sm font-medium">{t("input.cycleLength")}</span>
              <input type="number" min={21} max={45} value={cycleLength} onChange={(e) => setCycleLength(e.target.value)} className={`${inputBox} tabular-nums`} />
            </label>
          </>
        ) : (
          <>
            <label className="block">
              <span className="text-sm font-medium">{t("input.ultrasound")}</span>
              <input type="date" value={scanDate} onChange={(e) => setScanDate(e.target.value)} className={inputBox} />
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label className="block">
                <span className="text-sm font-medium">{t("input.gaWeeks")}</span>
                <input type="number" min={4} max={42} value={gaWeeks} onChange={(e) => setGaWeeks(e.target.value)} className={`${inputBox} tabular-nums`} />
              </label>
              <label className="block">
                <span className="text-sm font-medium">{t("input.gaDays")}</span>
                <input type="number" min={0} max={6} value={gaDays} onChange={(e) => setGaDays(e.target.value)} className={`${inputBox} tabular-nums`} />
              </label>
            </div>
          </>
        )}
      </div>

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
              <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800"><dt>{t("result.fetalAge")}</dt><dd className="tabular-nums">{result.fetalW}w {result.fetalD}d</dd></div>
              <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800"><dt>{t("result.trimester")}</dt><dd>{t(`trimester.${result.trimester}`)}</dd></div>
              <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800"><dt>{t("result.dueDate")}</dt><dd className="tabular-nums">{fmt.format(result.dueDate)}</dd></div>
              <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800"><dt>{t("result.daysToDue")}</dt><dd className="tabular-nums">{result.daysToDue}</dd></div>
              <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800"><dt>{t("result.totalDays")}</dt><dd className="tabular-nums">{result.gaDaysTotal}</dd></div>
            </dl>

            <h3 className="mt-5 text-sm font-semibold">{t("schedule.heading")}</h3>
            <ul className="mt-2 space-y-1 text-sm">
              {result.schedule.map((m) => (
                <li key={m.key} className={`flex justify-between gap-3 border-b border-slate-100 py-1 dark:border-slate-800 ${m.past ? "text-slate-400 line-through dark:text-slate-600" : ""}`}>
                  <span>{t(`milestone.${m.key}`)} <span className="text-xs text-slate-400">({m.week}w)</span></span>
                  <span className="tabular-nums whitespace-nowrap">{medFmt.format(m.date)}</span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">{t("schedule.note")}</p>
          </div>
        ) : (
          <div className="text-sm text-slate-600 dark:text-slate-400">{t("empty")}</div>
        )}
      </div>
    </div>
  );
}
