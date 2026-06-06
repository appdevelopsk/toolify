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
function icsDate(d: Date): string {
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
}

export default function MenstrualCycleCalculator() {
  const t = useTranslations("tools.menstrual-cycle-calculator");
  const locale = useLocale();
  const [lastPeriod, setLastPeriod] = useState(() => isoDate(addDays(new Date(), -7)));
  const [cycleLength, setCycleLength] = useState("28");
  const [periodLength, setPeriodLength] = useState("5");

  const result = useMemo(() => {
    if (!lastPeriod) return null;
    const start = new Date(lastPeriod + "T00:00:00");
    const cl = parseInt(cycleLength, 10);
    const pl = parseInt(periodLength, 10);
    if (isNaN(start.getTime()) || !isFinite(cl) || cl < 21 || cl > 45 || !isFinite(pl) || pl < 1 || pl > 10) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sinceDays = Math.floor((today.getTime() - start.getTime()) / 86400000);
    const cyclesSince = sinceDays >= 0 ? Math.floor(sinceDays / cl) : 0;
    const currentStart = addDays(start, cyclesSince * cl);
    const cycleDay = Math.floor((today.getTime() - currentStart.getTime()) / 86400000) + 1;

    const ovDay = cl - 14; // ovulation ≈ 14 days before next period
    let phase: "menstrual" | "follicular" | "ovulation" | "luteal";
    if (cycleDay <= pl) phase = "menstrual";
    else if (cycleDay < ovDay - 1) phase = "follicular";
    else if (cycleDay <= ovDay + 1) phase = "ovulation";
    else phase = "luteal";

    // Next 6 upcoming periods (and the fertile window of each cycle).
    const cycles = [];
    for (let i = 1; i <= 6; i++) {
      const s = addDays(start, (cyclesSince + i) * cl);
      const ov = addDays(s, ovDay);
      cycles.push({
        periodStart: s,
        periodEnd: addDays(s, pl - 1),
        fertileStart: addDays(ov, -5),
        fertileEnd: addDays(ov, 1),
        ovulation: ov,
      });
    }
    const nextPeriod = cycles[0]!;
    return { cycleDay: Math.max(1, cycleDay), phase, nextPeriod, cycles };
  }, [lastPeriod, cycleLength, periodLength]);

  const fmt = useMemo(() => new Intl.DateTimeFormat(locale, { year: "numeric", month: "long", day: "numeric" }), [locale]);
  const medFmt = useMemo(() => new Intl.DateTimeFormat(locale, { month: "short", day: "numeric" }), [locale]);
  const inputBox = "mt-1 w-full rounded border border-slate-300 px-3 py-2 tabular-nums dark:border-slate-700 dark:bg-slate-900";

  function downloadIcs() {
    if (!result) return;
    const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Toolify365//Period//EN"];
    result.cycles.forEach((c, i) => {
      lines.push(
        "BEGIN:VEVENT",
        `UID:period-${icsDate(c.periodStart)}-${i}@toolify365.com`,
        `DTSTART;VALUE=DATE:${icsDate(c.periodStart)}`,
        `DTEND;VALUE=DATE:${icsDate(addDays(c.periodEnd, 1))}`,
        `SUMMARY:${t("ics.event")}`,
        "END:VEVENT",
      );
    });
    lines.push("END:VCALENDAR");
    const blob = new Blob([lines.join("\r\n")], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "periods.ics";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="text-sm font-medium">{t("input.lastPeriod")}</span>
          <input type="date" value={lastPeriod} onChange={(e) => setLastPeriod(e.target.value)} className={inputBox} />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.cycleLength")}</span>
          <input type="number" min={21} max={45} value={cycleLength} onChange={(e) => setCycleLength(e.target.value)} className={inputBox} />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.periodLength")}</span>
          <input type="number" min={1} max={10} value={periodLength} onChange={(e) => setPeriodLength(e.target.value)} className={inputBox} />
        </label>
      </div>

      <div aria-live="polite" className="mt-6 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
        {result ? (
          <>
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <div>
                <span className="text-xs uppercase tracking-wider text-slate-500">{t("result.cycleDay")}</span>{" "}
                <span className="text-2xl font-bold tabular-nums">{result.cycleDay}</span>
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider text-slate-500">{t("result.phase")}</span>{" "}
                <span className="rounded-full bg-rose-100 px-2 py-0.5 text-sm font-medium text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">
                  {t(`phase.${result.phase}`)}
                </span>
              </div>
            </div>

            <div className="mt-3 flex justify-between rounded bg-rose-50 px-3 py-2 text-sm dark:bg-rose-900/20">
              <span className="font-medium">{t("result.nextPeriod")}</span>
              <span className="tabular-nums">{fmt.format(result.nextPeriod.periodStart)}</span>
            </div>

            <h3 className="mt-5 text-sm font-semibold">{t("table.heading")}</h3>
            <div className="mt-2 overflow-x-auto">
              <table className="w-full text-left text-xs tabular-nums">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 dark:border-slate-700">
                    <th className="py-1 pr-2 font-medium">{t("table.period")}</th>
                    <th className="py-1 pr-2 font-medium">{t("table.fertile")}</th>
                    <th className="py-1 font-medium">{t("table.ovulation")}</th>
                  </tr>
                </thead>
                <tbody>
                  {result.cycles.map((c, i) => (
                    <tr key={i} className="border-b border-slate-100 dark:border-slate-800">
                      <td className="py-1 pr-2">{medFmt.format(c.periodStart)} – {medFmt.format(c.periodEnd)}</td>
                      <td className="py-1 pr-2">{medFmt.format(c.fertileStart)} – {medFmt.format(c.fertileEnd)}</td>
                      <td className="py-1">{medFmt.format(c.ovulation)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              type="button"
              onClick={downloadIcs}
              className="mt-4 rounded border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              {t("ics.button")}
            </button>
            <p className="mt-3 text-xs text-slate-600 dark:text-slate-400">{t("note")}</p>
          </>
        ) : (
          <div className="text-sm text-slate-600 dark:text-slate-400">{t("empty")}</div>
        )}
      </div>
    </div>
  );
}
