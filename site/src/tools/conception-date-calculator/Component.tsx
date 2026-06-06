"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

function addDays(d: Date, days: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + days);
  return r;
}

type Mode = "dueDate" | "birthDate";

export default function ConceptionDateCalculator() {
  const t = useTranslations("tools.conception-date-calculator");
  const locale = useLocale();
  const [mode, setMode] = useState<Mode>("dueDate");
  const [refDate, setRefDate] = useState("");

  const result = useMemo(() => {
    if (!refDate) return null;
    const ref = new Date(refDate + "T00:00:00");
    if (isNaN(ref.getTime())) return null;

    // Delivery (due or actual birth) ≈ conception + 266 days ≈ LMP + 280 days.
    const conception = addDays(ref, -266);
    // Window: ±7 days for a due date; ±14 for an actual birth (gestation spans 37–42 weeks).
    const w = mode === "birthDate" ? 14 : 7;
    const windowStart = addDays(conception, -w);
    const windowEnd = addDays(conception, w);
    // Intercourse that can lead to this conception: sperm survive up to ~5 days.
    const intercourseStart = addDays(conception, -5);
    const intercourseEnd = addDays(conception, 1);
    const lmp = addDays(ref, -280);
    return { conception, windowStart, windowEnd, intercourseStart, intercourseEnd, lmp };
  }, [refDate, mode]);

  const fmt = useMemo(() => new Intl.DateTimeFormat(locale, { dateStyle: "full" }), [locale]);
  const medFmt = useMemo(() => new Intl.DateTimeFormat(locale, { dateStyle: "medium" }), [locale]);
  const inputBox = "mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900";

  return (
    <div>
      <div className="mb-4 inline-flex rounded-md border border-slate-300 p-1 dark:border-slate-700">
        {(["dueDate", "birthDate"] as Mode[]).map((m) => (
          <button key={m} onClick={() => setMode(m)} className={`rounded px-3 py-1.5 text-sm ${mode === m ? "bg-brand-600 text-white" : ""}`}>
            {t(`mode.${m}`)}
          </button>
        ))}
      </div>

      <label className="block">
        <span className="text-sm font-medium">{t(`input.${mode}`)}</span>
        <input type="date" value={refDate} onChange={(e) => setRefDate(e.target.value)} className={inputBox} />
      </label>

      <div aria-live="polite" className={`mt-6 rounded-lg border p-4 ${result ? "border-brand-200 bg-brand-50 dark:border-brand-900 dark:bg-brand-900/20" : "border-slate-200 dark:border-slate-800"}`}>
        {result ? (
          <>
            <div className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">{t("result.conception")}</div>
            <div className="mt-1 text-2xl font-bold">{fmt.format(result.conception)}</div>

            <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
              <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800">
                <dt>{t("result.window")}</dt>
                <dd className="tabular-nums">{medFmt.format(result.windowStart)} – {medFmt.format(result.windowEnd)}</dd>
              </div>
              <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800">
                <dt>{t("result.intercourse")}</dt>
                <dd className="tabular-nums">{medFmt.format(result.intercourseStart)} – {medFmt.format(result.intercourseEnd)}</dd>
              </div>
              <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800">
                <dt>{t("result.lmp")}</dt>
                <dd className="tabular-nums">{medFmt.format(result.lmp)}</dd>
              </div>
            </dl>

            {mode === "birthDate" && (
              <p className="mt-3 text-xs text-slate-600 dark:text-slate-400">{t("note.birthDate")}</p>
            )}
          </>
        ) : (
          <div className="text-sm text-slate-600 dark:text-slate-400">{t("empty")}</div>
        )}
      </div>
    </div>
  );
}
