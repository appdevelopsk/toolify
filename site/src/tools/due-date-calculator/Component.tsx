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

type Mode = "lmp" | "conception" | "ivf" | "ultrasound";
const MODES: Mode[] = ["lmp", "conception", "ivf", "ultrasound"];

// Week-by-week milestones from the current pregnancy to the due date:
// trimester boundaries (ACOG: 2nd = 14w0d, 3rd = 28w0d) + typical prenatal
// checkup windows. Static data; exact timing varies by country and provider.
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

export default function DueDateCalculator() {
  const t = useTranslations("tools.due-date-calculator");
  const locale = useLocale();
  const [mode, setMode] = useState<Mode>("lmp");
  const [refDate, setRefDate] = useState("");
  const [cycleLength, setCycleLength] = useState("28");
  const [embryoAge, setEmbryoAge] = useState("5");
  const [gaWeeks, setGaWeeks] = useState("12");
  const [gaDays, setGaDays] = useState("0");

  const result = useMemo(() => {
    if (!refDate) return null;
    const d = new Date(refDate + "T00:00:00");
    if (isNaN(d.getTime())) return null;

    // Resolve every mode to an "anchor LMP": the day a standard 280-day (40w) EDD counts from.
    let anchorLmp: Date;
    if (mode === "lmp") {
      const cyc = parseInt(cycleLength, 10);
      if (!isFinite(cyc) || cyc < 21 || cyc > 45) return null;
      anchorLmp = addDays(d, cyc - 28); // cycle-length correction to Naegele's rule
    } else if (mode === "conception") {
      anchorLmp = addDays(d, -14);
    } else if (mode === "ivf") {
      const age = parseInt(embryoAge, 10); // 3 or 5 day transfer
      // conception (fertilisation) = transfer − embryo age; anchor LMP = conception − 14
      anchorLmp = addDays(d, -age - 14);
    } else {
      const w = parseInt(gaWeeks, 10);
      const dd = parseInt(gaDays, 10);
      if (!isFinite(w) || w < 4 || w > 42 || !isFinite(dd) || dd < 0 || dd > 6) return null;
      anchorLmp = addDays(d, -(w * 7 + dd)); // scan date − gestational age at scan
    }

    const dueDate = addDays(anchorLmp, 280);
    const conception = addDays(anchorLmp, 14);
    const today = new Date(todayIso());
    const gaTotal = Math.max(0, diffDays(anchorLmp, today));
    const gaW = Math.floor(gaTotal / 7);
    const gaD = gaTotal % 7;
    const daysToDue = diffDays(today, dueDate);
    const trimester = gaW <= 13 ? 1 : gaW <= 27 ? 2 : 3;
    const termStart = addDays(dueDate, -21); // 37w0d
    const termEnd = addDays(dueDate, 14); // 42w0d
    const schedule = MILESTONES.map((m) => {
      const date = addDays(anchorLmp, m.week * 7);
      return { key: m.key, week: m.week, date, past: date.getTime() < today.getTime() };
    });
    return { dueDate, conception, gaW, gaD, daysToDue, trimester, termStart, termEnd, schedule };
  }, [mode, refDate, cycleLength, embryoAge, gaWeeks, gaDays]);

  const dateFmt = useMemo(() => new Intl.DateTimeFormat(locale, { dateStyle: "full" }), [locale]);
  const medFmt = useMemo(() => new Intl.DateTimeFormat(locale, { dateStyle: "medium" }), [locale]);

  const inputBox = "mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900";

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-1 rounded-md border border-slate-300 p-1 dark:border-slate-700">
        {MODES.map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`rounded px-3 py-1.5 text-sm ${mode === m ? "bg-brand-600 text-white" : ""}`}
          >
            {t(`mode.${m}`)}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">{t(`input.${mode}`)}</span>
          <input type="date" value={refDate} onChange={(e) => setRefDate(e.target.value)} max={todayIso()} className={inputBox} />
        </label>

        {mode === "lmp" && (
          <label className="block">
            <span className="text-sm font-medium">{t("input.cycleLength")}</span>
            <input type="number" min={21} max={45} value={cycleLength} onChange={(e) => setCycleLength(e.target.value)} className={`${inputBox} tabular-nums`} />
          </label>
        )}

        {mode === "ivf" && (
          <label className="block">
            <span className="text-sm font-medium">{t("input.embryoAge")}</span>
            <select value={embryoAge} onChange={(e) => setEmbryoAge(e.target.value)} className={inputBox}>
              <option value="3">{t("input.day3")}</option>
              <option value="5">{t("input.day5")}</option>
            </select>
          </label>
        )}

        {mode === "ultrasound" && (
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
        )}
      </div>

      <div aria-live="polite" className={`mt-6 rounded-lg border p-4 ${result ? "border-brand-200 bg-brand-50 dark:border-brand-900 dark:bg-brand-900/20" : "border-slate-200 dark:border-slate-800"}`}>
        {result ? (
          <>
            <div className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">{t("result.dueDate")}</div>
            <div className="mt-1 text-2xl font-bold">{dateFmt.format(result.dueDate)}</div>

            <div className="mt-3 rounded bg-white/60 px-3 py-2 text-sm dark:bg-slate-900/40">
              <div className="font-medium">{t("result.fullTermWindow")}</div>
              <div className="tabular-nums">{medFmt.format(result.termStart)} – {medFmt.format(result.termEnd)}</div>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">{t("result.fullTermNote")}</p>
            </div>

            <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
              <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800">
                <dt>{t("result.gestationalWeeks")}</dt>
                <dd className="tabular-nums">{result.gaW}w {result.gaD}d</dd>
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
                <dd>{medFmt.format(result.conception)}</dd>
              </div>
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
          </>
        ) : (
          <div className="text-sm text-slate-600 dark:text-slate-400">{t("empty")}</div>
        )}
      </div>
    </div>
  );
}
