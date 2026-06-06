"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

function addDays(d: Date, days: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + days);
  return r;
}

function icsDate(d: Date): string {
  // all-day VALUE=DATE format YYYYMMDD
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
}

type Cycle = {
  fertileStart: Date;
  fertileEnd: Date;
  ovulation: Date;
  periodDue: Date;
  test: Date;
};

export default function OvulationCalculator() {
  const t = useTranslations("tools.ovulation-calculator");
  const locale = useLocale();
  const [lmp, setLmp] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 14);
    return d.toISOString().slice(0, 10);
  });
  const [cycleLength, setCycleLength] = useState("28");
  const [irregular, setIrregular] = useState(false);
  const [cycleMin, setCycleMin] = useState("26");
  const [cycleMax, setCycleMax] = useState("32");

  const result = useMemo(() => {
    if (!lmp) return null;
    const start = new Date(lmp + "T00:00:00");
    if (isNaN(start.getTime())) return null;

    let clMin: number, clMax: number;
    if (irregular) {
      clMin = parseInt(cycleMin, 10);
      clMax = parseInt(cycleMax, 10);
      if (!isFinite(clMin) || !isFinite(clMax) || clMin < 21 || clMax > 45 || clMin > clMax) return null;
    } else {
      const cl = parseInt(cycleLength, 10);
      if (!isFinite(cl) || cl < 21 || cl > 45) return null;
      clMin = clMax = cl;
    }
    const avg = Math.round((clMin + clMax) / 2);

    // Ovulation ≈ luteal phase (14d) before next period.
    const ovEarly = addDays(start, clMin - 14);
    const ovLate = addDays(start, clMax - 14);
    const fertileStart = addDays(ovEarly, -5);
    const fertileEnd = addDays(ovLate, 1);
    const testDate = addDays(ovLate, 12); // earliest reliable hCG detection
    const implantStart = addDays(ovEarly, 6);
    const implantEnd = addDays(ovLate, 12);
    const nextPeriodEarly = addDays(start, clMin);
    const nextPeriodLate = addDays(start, clMax);
    const dueDate = addDays(start, 280);

    // Next 6 fertile windows using the average cycle length.
    const cycles: Cycle[] = [];
    for (let i = 0; i < 6; i++) {
      const cycleStart = addDays(start, i * avg);
      const ov = addDays(cycleStart, avg - 14);
      cycles.push({
        fertileStart: addDays(ov, -5),
        fertileEnd: addDays(ov, 1),
        ovulation: ov,
        periodDue: addDays(cycleStart, avg),
        test: addDays(ov, 12),
      });
    }

    return {
      irregular,
      ovEarly,
      ovLate,
      fertileStart,
      fertileEnd,
      testDate,
      implantStart,
      implantEnd,
      nextPeriodEarly,
      nextPeriodLate,
      dueDate,
      cycles,
    };
  }, [lmp, cycleLength, irregular, cycleMin, cycleMax]);

  const fmt = useMemo(
    () => new Intl.DateTimeFormat(locale, { year: "numeric", month: "long", day: "numeric", weekday: "short" }),
    [locale],
  );
  const fmtShort = useMemo(
    () => new Intl.DateTimeFormat(locale, { month: "short", day: "numeric" }),
    [locale],
  );
  const range = (a: Date, b: Date) =>
    icsDate(a) === icsDate(b) ? fmt.format(a) : `${fmt.format(a)} – ${fmt.format(b)}`;

  function downloadIcs() {
    if (!result) return;
    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Toolify365//Ovulation//EN",
    ];
    result.cycles.forEach((c, i) => {
      lines.push(
        "BEGIN:VEVENT",
        `UID:ovulation-${icsDate(c.fertileStart)}-${i}@toolify365.com`,
        `DTSTART;VALUE=DATE:${icsDate(c.fertileStart)}`,
        `DTEND;VALUE=DATE:${icsDate(addDays(c.fertileEnd, 1))}`,
        `SUMMARY:${t("ics.event")}`,
        "END:VEVENT",
      );
    });
    lines.push("END:VCALENDAR");
    const blob = new Blob([lines.join("\r\n")], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "fertile-windows.ics";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">{t("input.lmp")}</span>
          <input
            type="date"
            value={lmp}
            onChange={(e) => setLmp(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          />
        </label>
        {!irregular ? (
          <label className="block">
            <span className="text-sm font-medium">{t("input.cycleLength")}</span>
            <input
              type="number"
              min={21}
              max={45}
              value={cycleLength}
              onChange={(e) => setCycleLength(e.target.value)}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 tabular-nums dark:border-slate-700 dark:bg-slate-900"
            />
          </label>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className="text-sm font-medium">{t("input.cycleMin")}</span>
              <input
                type="number"
                min={21}
                max={45}
                value={cycleMin}
                onChange={(e) => setCycleMin(e.target.value)}
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2 tabular-nums dark:border-slate-700 dark:bg-slate-900"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium">{t("input.cycleMax")}</span>
              <input
                type="number"
                min={21}
                max={45}
                value={cycleMax}
                onChange={(e) => setCycleMax(e.target.value)}
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2 tabular-nums dark:border-slate-700 dark:bg-slate-900"
              />
            </label>
          </div>
        )}
      </div>

      <label className="mt-3 flex items-center gap-2 text-sm">
        <input type="checkbox" checked={irregular} onChange={(e) => setIrregular(e.target.checked)} />
        <span>{t("input.irregularToggle")}</span>
      </label>

      <div aria-live="polite" className="mt-6 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
        {result ? (
          <>
            <dl className="grid gap-2 text-sm">
              <div className="flex justify-between rounded bg-rose-50 px-3 py-2 dark:bg-rose-900/20">
                <dt className="font-medium">{t("result.ovulation")}</dt>
                <dd className="tabular-nums">{range(result.ovEarly, result.ovLate)}</dd>
              </div>
              <div className="flex justify-between rounded bg-emerald-50 px-3 py-2 dark:bg-emerald-900/20">
                <dt className="font-medium">{t("result.fertileWindow")}</dt>
                <dd className="tabular-nums">{fmt.format(result.fertileStart)} – {fmt.format(result.fertileEnd)}</dd>
              </div>
              <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800">
                <dt>{t("result.implantation")}</dt>
                <dd className="tabular-nums">{fmtShort.format(result.implantStart)} – {fmtShort.format(result.implantEnd)}</dd>
              </div>
              <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800">
                <dt>{t("result.testDate")}</dt>
                <dd className="tabular-nums">{fmt.format(result.testDate)}</dd>
              </div>
              <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800">
                <dt>{t("result.nextPeriod")}</dt>
                <dd className="tabular-nums">{range(result.nextPeriodEarly, result.nextPeriodLate)}</dd>
              </div>
              <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800">
                <dt>{t("result.dueDateIfPregnant")}</dt>
                <dd className="tabular-nums">{fmt.format(result.dueDate)}</dd>
              </div>
            </dl>

            {result.irregular && (
              <p className="mt-3 text-xs text-slate-600 dark:text-slate-400">{t("note.irregular")}</p>
            )}

            <h3 className="mt-5 text-sm font-semibold">{t("cycles.heading")}</h3>
            <div className="mt-2 overflow-x-auto">
              <table className="w-full text-left text-xs tabular-nums">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 dark:border-slate-700">
                    <th className="py-1 pr-2 font-medium">{t("cycles.fertile")}</th>
                    <th className="py-1 pr-2 font-medium">{t("cycles.ovulation")}</th>
                    <th className="py-1 pr-2 font-medium">{t("cycles.period")}</th>
                    <th className="py-1 font-medium">{t("cycles.test")}</th>
                  </tr>
                </thead>
                <tbody>
                  {result.cycles.map((c, i) => (
                    <tr key={i} className="border-b border-slate-100 dark:border-slate-800">
                      <td className="py-1 pr-2">{fmtShort.format(c.fertileStart)} – {fmtShort.format(c.fertileEnd)}</td>
                      <td className="py-1 pr-2">{fmtShort.format(c.ovulation)}</td>
                      <td className="py-1 pr-2">{fmtShort.format(c.periodDue)}</td>
                      <td className="py-1">{fmtShort.format(c.test)}</td>
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
          </>
        ) : (
          <div className="text-sm text-slate-600 dark:text-slate-400">{t("empty")}</div>
        )}
      </div>
    </div>
  );
}
