"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

interface Assignment {
  id: number;
  name: string;
  score: string;
  maxScore: string;
  weight: string;
}

interface GradeInfo {
  letter: string;
  gpa: number;
}

function getGradeInfo(pct: number): GradeInfo {
  if (pct >= 97) return { letter: "A+", gpa: 4.0 };
  if (pct >= 93) return { letter: "A", gpa: 4.0 };
  if (pct >= 90) return { letter: "A-", gpa: 3.7 };
  if (pct >= 87) return { letter: "B+", gpa: 3.3 };
  if (pct >= 83) return { letter: "B", gpa: 3.0 };
  if (pct >= 80) return { letter: "B-", gpa: 2.7 };
  if (pct >= 77) return { letter: "C+", gpa: 2.3 };
  if (pct >= 73) return { letter: "C", gpa: 2.0 };
  if (pct >= 70) return { letter: "C-", gpa: 1.7 };
  if (pct >= 67) return { letter: "D+", gpa: 1.3 };
  if (pct >= 63) return { letter: "D", gpa: 1.0 };
  if (pct >= 60) return { letter: "D-", gpa: 0.7 };
  return { letter: "F", gpa: 0.0 };
}

function gradeColorClass(pct: number): string {
  if (pct >= 90) return "text-emerald-600 dark:text-emerald-400";
  if (pct >= 70) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

function gradeBgClass(pct: number): string {
  if (pct >= 90) return "bg-emerald-50 dark:bg-emerald-900/20";
  if (pct >= 70) return "bg-amber-50 dark:bg-amber-900/20";
  return "bg-red-50 dark:bg-red-900/20";
}

let nextId = 1;

function makeRow(): Assignment {
  return { id: nextId++, name: "", score: "", maxScore: "100", weight: "1" };
}

export default function GradeCalculator() {
  const t = useTranslations("tools.grade-calculator");
  const locale = useLocale();

  const [rows, setRows] = useState<Assignment[]>([makeRow(), makeRow(), makeRow()]);

  const fmt = useMemo(
    () => new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }),
    [locale]
  );
  const fmtGpa = useMemo(
    () => new Intl.NumberFormat(locale, { minimumFractionDigits: 1, maximumFractionDigits: 2 }),
    [locale]
  );

  function updateRow(id: number, field: keyof Omit<Assignment, "id">, value: string) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  }

  function addRow() {
    if (rows.length >= 20) return;
    setRows((prev) => [...prev, makeRow()]);
  }

  function removeRow(id: number) {
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  const result = useMemo(() => {
    const valid = rows.filter((r) => {
      const s = parseFloat(r.score);
      const m = parseFloat(r.maxScore);
      const w = parseFloat(r.weight);
      return isFinite(s) && isFinite(m) && m > 0 && isFinite(w) && w > 0;
    });

    if (valid.length === 0) return null;

    let weightedSum = 0;
    let totalWeight = 0;
    let totalEarned = 0;
    let totalPossible = 0;

    for (const r of valid) {
      const s = parseFloat(r.score);
      const m = parseFloat(r.maxScore);
      const w = parseFloat(r.weight);
      weightedSum += (s / m) * w;
      totalWeight += w;
      totalEarned += s;
      totalPossible += m;
    }

    const weightedPct = (weightedSum / totalWeight) * 100;
    const simplePct = (totalEarned / totalPossible) * 100;

    return {
      weightedPct,
      simplePct,
      totalEarned,
      totalPossible,
      weightedGrade: getGradeInfo(weightedPct),
    };
  }, [rows]);

  return (
    <div>
      {/* Assignment table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700">
              <th className="pb-2 text-left font-medium text-slate-600 dark:text-slate-400">
                {t("input.name")}
              </th>
              <th className="pb-2 pl-2 text-left font-medium text-slate-600 dark:text-slate-400">
                {t("input.score")}
              </th>
              <th className="pb-2 pl-2 text-left font-medium text-slate-600 dark:text-slate-400">
                {t("input.maxScore")}
              </th>
              <th className="pb-2 pl-2 text-left font-medium text-slate-600 dark:text-slate-400">
                {t("input.weight")}
              </th>
              <th className="pb-2 pl-2 w-8" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-1.5 pr-2">
                  <input
                    type="text"
                    value={row.name}
                    onChange={(e) => updateRow(row.id, "name", e.target.value)}
                    placeholder={t("input.namePlaceholder")}
                    className="w-full min-w-[100px] rounded border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900"
                  />
                </td>
                <td className="py-1.5 pl-2 pr-2">
                  <input
                    type="number"
                    value={row.score}
                    onChange={(e) => updateRow(row.id, "score", e.target.value)}
                    placeholder="85"
                    min="0"
                    className="w-20 rounded border border-slate-300 px-2 py-1.5 tabular-nums text-sm dark:border-slate-700 dark:bg-slate-900"
                  />
                </td>
                <td className="py-1.5 pl-2 pr-2">
                  <input
                    type="number"
                    value={row.maxScore}
                    onChange={(e) => updateRow(row.id, "maxScore", e.target.value)}
                    placeholder="100"
                    min="0.01"
                    step="any"
                    className="w-20 rounded border border-slate-300 px-2 py-1.5 tabular-nums text-sm dark:border-slate-700 dark:bg-slate-900"
                  />
                </td>
                <td className="py-1.5 pl-2 pr-2">
                  <input
                    type="number"
                    value={row.weight}
                    onChange={(e) => updateRow(row.id, "weight", e.target.value)}
                    placeholder="1"
                    min="0.01"
                    step="any"
                    className="w-16 rounded border border-slate-300 px-2 py-1.5 tabular-nums text-sm dark:border-slate-700 dark:bg-slate-900"
                  />
                </td>
                <td className="py-1.5 pl-2">
                  <button
                    type="button"
                    onClick={() => removeRow(row.id)}
                    disabled={rows.length === 1}
                    aria-label={t("input.removeButton")}
                    className="rounded p-1 text-slate-400 hover:text-red-500 disabled:pointer-events-none disabled:opacity-30 dark:text-slate-500"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                      <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add row button */}
      <button
        type="button"
        onClick={addRow}
        disabled={rows.length >= 20}
        className="mt-3 flex items-center gap-1.5 rounded border border-dashed border-slate-300 px-3 py-1.5 text-sm text-slate-500 hover:border-brand-400 hover:text-brand-600 disabled:pointer-events-none disabled:opacity-40 dark:border-slate-700 dark:text-slate-400"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
          <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
        </svg>
        {t("input.addButton")}
      </button>

      {/* Results */}
      <div aria-live="polite" className="mt-6">
        {!result ? (
          <p className="rounded-lg border border-slate-200 p-4 text-center text-slate-400 dark:border-slate-800">
            {t("empty")}
          </p>
        ) : (
          <div className="space-y-4">
            {/* Primary result: weighted grade */}
            <div className={`rounded-lg p-5 ${gradeBgClass(result.weightedPct)}`}>
              <div className="flex flex-wrap items-end gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    {t("result.letterGrade")}
                  </p>
                  <p className={`text-6xl font-bold tabular-nums leading-none mt-1 ${gradeColorClass(result.weightedPct)}`}>
                    {result.weightedGrade.letter}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    {t("result.weightedAverage")}
                  </p>
                  <p className={`text-4xl font-bold tabular-nums leading-none mt-1 ${gradeColorClass(result.weightedPct)}`}>
                    {fmt.format(result.weightedPct)}%
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    {t("result.gpaEquivalent")}
                  </p>
                  <p className={`text-4xl font-bold tabular-nums leading-none mt-1 ${gradeColorClass(result.weightedPct)}`}>
                    {fmtGpa.format(result.weightedGrade.gpa)}
                  </p>
                </div>
              </div>
            </div>

            {/* Secondary stats */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-slate-200 px-4 py-3 dark:border-slate-700">
                <p className="text-xs text-slate-500 dark:text-slate-400">{t("result.simpleAverage")}</p>
                <p className="mt-0.5 text-xl font-semibold tabular-nums">
                  {fmt.format(result.simplePct)}%
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 px-4 py-3 dark:border-slate-700">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t("result.pointsEarned")} / {t("result.pointsPossible")}
                </p>
                <p className="mt-0.5 text-xl font-semibold tabular-nums">
                  {fmt.format(result.totalEarned)} / {fmt.format(result.totalPossible)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
