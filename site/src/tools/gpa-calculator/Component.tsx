"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

interface Course {
  id: number;
  name: string;
  grade: string;
  credits: string;
}

const GRADE_TO_POINTS: Record<string, number> = {
  "A+": 4.0, "A": 4.0, "A-": 3.7,
  "B+": 3.3, "B": 3.0, "B-": 2.7,
  "C+": 2.3, "C": 2.0, "C-": 1.7,
  "D+": 1.3, "D": 1.0, "D-": 0.7,
  "F": 0.0,
};

const GRADE_OPTIONS = ["A+","A","A-","B+","B","B-","C+","C","C-","D+","D","D-","F"];

let nextId = 1;

export default function GpaCalculator() {
  const t = useTranslations("tools.gpa-calculator");
  const locale = useLocale();
  const [courses, setCourses] = useState<Course[]>([
    { id: nextId++, name: "", grade: "A", credits: "3" },
    { id: nextId++, name: "", grade: "B", credits: "3" },
    { id: nextId++, name: "", grade: "A-", credits: "4" },
  ]);

  const result = useMemo(() => {
    let totalPoints = 0;
    let totalCredits = 0;
    for (const c of courses) {
      const credits = parseFloat(c.credits);
      const points = GRADE_TO_POINTS[c.grade];
      if (!isFinite(credits) || credits <= 0 || points === undefined) continue;
      totalPoints += points * credits;
      totalCredits += credits;
    }
    if (totalCredits === 0) return null;
    return { gpa: totalPoints / totalCredits, totalCredits, totalPoints };
  }, [courses]);

  const fmt = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }), [locale]);

  function update(id: number, patch: Partial<Course>) {
    setCourses((arr) => arr.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }
  function add() {
    setCourses((arr) => [...arr, { id: nextId++, name: "", grade: "A", credits: "3" }]);
  }
  function remove(id: number) {
    setCourses((arr) => (arr.length <= 1 ? arr : arr.filter((c) => c.id !== id)));
  }

  return (
    <div>
      <div className="space-y-2">
        {courses.map((c) => (
          <div key={c.id} className="grid grid-cols-[1fr_100px_80px_auto] items-center gap-2">
            <input
              value={c.name}
              onChange={(e) => update(c.id, { name: e.target.value })}
              placeholder={t("input.coursePlaceholder")}
              className="rounded border border-slate-300 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900"
            />
            <select value={c.grade} onChange={(e) => update(c.id, { grade: e.target.value })} className="rounded border border-slate-300 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900">
              {GRADE_OPTIONS.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
            <input
              inputMode="decimal"
              value={c.credits}
              onChange={(e) => update(c.id, { credits: e.target.value })}
              className="rounded border border-slate-300 px-2 py-1 text-sm tabular-nums dark:border-slate-700 dark:bg-slate-900"
            />
            <button onClick={() => remove(c.id)} aria-label={t("remove")} className="text-slate-400 hover:text-red-600 disabled:opacity-30" disabled={courses.length <= 1}>
              ×
            </button>
          </div>
        ))}
      </div>

      <button onClick={add} className="mt-3 rounded border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">
        + {t("addCourse")}
      </button>

      <div aria-live="polite" className={`mt-6 rounded-lg border p-4 ${result ? "border-brand-200 bg-brand-50 dark:border-brand-900 dark:bg-brand-900/20" : "border-slate-200 dark:border-slate-800"}`}>
        {result ? (
          <dl className="grid gap-3 sm:grid-cols-3">
            <div>
              <dt className="text-xs uppercase tracking-wider text-slate-500">{t("result.gpa")}</dt>
              <dd className="mt-1 text-4xl font-bold tabular-nums">{fmt.format(result.gpa)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-slate-500">{t("result.totalCredits")}</dt>
              <dd className="mt-1 text-2xl font-bold tabular-nums">{fmt.format(result.totalCredits)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-slate-500">{t("result.totalPoints")}</dt>
              <dd className="mt-1 text-2xl font-bold tabular-nums">{fmt.format(result.totalPoints)}</dd>
            </div>
          </dl>
        ) : (
          <div className="text-sm text-slate-500">{t("empty")}</div>
        )}
      </div>
    </div>
  );
}
