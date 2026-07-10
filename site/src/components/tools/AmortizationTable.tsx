"use client";

import { useCallback } from "react";
import type { AmortizationRow } from "@/components/tools/amortization";
import { downloadCsv } from "@/components/tools/downloadCsv";

export interface AmortizationLabels {
  heading: string;
  downloadCsv: string;
  /** e.g. "Year {n}" — {n} is replaced with the 1-based year number */
  yearTemplate: string;
  expandHint: string;
  month: string;
  payment: string;
  principal: string;
  interest: string;
  balance: string;
}

interface YearGroup {
  year: number;
  months: AmortizationRow[];
  payment: number;
  principal: number;
  interest: number;
  endBalance: number;
}

function groupByYear(rows: AmortizationRow[]): YearGroup[] {
  const groups: YearGroup[] = [];
  for (let y = 0; y * 12 < rows.length; y++) {
    const months = rows.slice(y * 12, y * 12 + 12);
    groups.push({
      year: y + 1,
      months,
      payment: months.reduce((s, r) => s + r.payment, 0),
      principal: months.reduce((s, r) => s + r.principal, 0),
      interest: months.reduce((s, r) => s + r.interest, 0),
      endBalance: months[months.length - 1]!.balance,
    });
  }
  return groups;
}

interface Props {
  rows: AmortizationRow[];
  labels: AmortizationLabels;
  /** Locale-aware formatter supplied by the tool (keeps currency decisions in one place). */
  format: Intl.NumberFormat;
  csvFilename: string;
}

/**
 * Year-collapsible amortization schedule with client-side CSV export.
 * Shared by mortgage / loan / car-loan / loan-amortization-schedule tools.
 */
export function AmortizationTable({ rows, labels, format, csvFilename }: Props) {
  const handleCsv = useCallback(() => {
    downloadCsv(
      csvFilename,
      [labels.month, labels.payment, labels.principal, labels.interest, labels.balance],
      rows.map((r) => [r.month, r.payment.toFixed(2), r.principal.toFixed(2), r.interest.toFixed(2), r.balance.toFixed(2)]),
    );
  }, [rows, labels, csvFilename]);

  if (rows.length === 0) return null;
  const groups = groupByYear(rows);
  const gridCols = "grid grid-cols-[minmax(4.5rem,1.1fr)_repeat(4,minmax(5rem,1fr))] gap-x-2";

  return (
    <section className="mt-6">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-semibold">{labels.heading}</h2>
        <button
          type="button"
          onClick={handleCsv}
          className="rounded border border-slate-300 px-2.5 py-1 text-xs font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          {labels.downloadCsv}
        </button>
      </div>
      <p className="mb-2 text-xs text-slate-600 dark:text-slate-400">{labels.expandHint}</p>

      <div className="overflow-x-auto">
        <div className="min-w-[32rem] text-sm">
          <div className={`${gridCols} border-b border-slate-200 py-1 text-left font-medium dark:border-slate-800`}>
            <span />
            <span>{labels.payment}</span>
            <span>{labels.principal}</span>
            <span>{labels.interest}</span>
            <span>{labels.balance}</span>
          </div>
          {groups.map((g) => (
            <details key={g.year} open={g.year === 1} className="group border-b border-slate-100 dark:border-slate-800/50">
              <summary className={`${gridCols} cursor-pointer list-none py-1.5 font-medium tabular-nums hover:bg-slate-50 dark:hover:bg-slate-800/50`}>
                <span>
                  <span className="mr-1 inline-block text-slate-400 transition-transform group-open:rotate-90">›</span>
                  {labels.yearTemplate.replace("{n}", String(g.year))}
                </span>
                <span>{format.format(g.payment)}</span>
                <span className="text-emerald-700 dark:text-emerald-400">{format.format(g.principal)}</span>
                <span className="text-rose-700 dark:text-rose-400">{format.format(g.interest)}</span>
                <span>{format.format(g.endBalance)}</span>
              </summary>
              <div className="pb-1.5">
                {g.months.map((r) => (
                  <div key={r.month} className={`${gridCols} py-0.5 text-xs tabular-nums text-slate-600 dark:text-slate-400`}>
                    <span className="pl-4">
                      {labels.month} {r.month}
                    </span>
                    <span>{format.format(r.payment)}</span>
                    <span>{format.format(r.principal)}</span>
                    <span>{format.format(r.interest)}</span>
                    <span>{format.format(r.balance)}</span>
                  </div>
                ))}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
