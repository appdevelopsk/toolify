"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { buildAmortizationRows } from "@/components/tools/amortization";
import { AmortizationTable } from "@/components/tools/AmortizationTable";

export default function LoanAmortizationSchedule() {
  const t = useTranslations("tools.loan-amortization-schedule");
  const locale = useLocale();
  const [principal, setPrincipal] = useState("200000");
  const [ratePct, setRatePct] = useState("6.0");
  const [years, setYears] = useState("30");

  const schedule = useMemo(() => {
    const p = parseFloat(principal);
    const r = parseFloat(ratePct);
    const y = parseFloat(years);
    if (!isFinite(p) || !isFinite(r) || !isFinite(y) || p <= 0 || y <= 0 || r < 0) return null;
    const rows = buildAmortizationRows(p, r, Math.round(y * 12));
    return rows.length > 0 ? rows : null;
  }, [principal, ratePct, years]);

  const summary = useMemo(() => {
    if (!schedule || schedule.length === 0) return null;
    const totalInterest = schedule.reduce((s, r) => s + r.interest, 0);
    const totalPayments = schedule.reduce((s, r) => s + r.payment, 0);
    return {
      monthly: schedule[0]!.payment,
      totalInterest,
      totalPayments,
      months: schedule.length,
    };
  }, [schedule]);

  const fmt = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }), [locale]);

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block">
          <span className="text-sm font-medium">{t("input.principal")}</span>
          <input type="number" inputMode="decimal" value={principal} onChange={(e) => setPrincipal(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-mono tabular-nums dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.ratePct")}</span>
          <input type="number" inputMode="decimal" step="0.01" value={ratePct} onChange={(e) => setRatePct(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-mono tabular-nums dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.years")}</span>
          <input type="number" inputMode="decimal" value={years} onChange={(e) => setYears(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-mono tabular-nums dark:border-slate-700 dark:bg-slate-900" />
        </label>
      </div>

      {summary && (
        <dl className="mt-6 grid gap-2 text-sm sm:grid-cols-2">
          <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800">
            <dt className="font-medium">{t("result.monthly")}</dt>
            <dd className="tabular-nums text-lg font-bold">{fmt.format(summary.monthly)}</dd>
          </div>
          <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800">
            <dt>{t("result.totalInterest")}</dt>
            <dd className="tabular-nums">{fmt.format(summary.totalInterest)}</dd>
          </div>
          <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800">
            <dt>{t("result.totalPayments")}</dt>
            <dd className="tabular-nums">{fmt.format(summary.totalPayments)}</dd>
          </div>
          <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800">
            <dt>{t("result.months")}</dt>
            <dd className="tabular-nums">{summary.months}</dd>
          </div>
        </dl>
      )}

      {schedule && (
        <AmortizationTable
          rows={schedule}
          format={fmt}
          csvFilename="amortization-schedule.csv"
          labels={{
            heading: t("schedule.heading"),
            downloadCsv: t("schedule.downloadCsv"),
            yearTemplate: t.raw("schedule.yearTemplate") as string,
            expandHint: t("schedule.expandHint"),
            month: t("schedule.col.month"),
            payment: t("schedule.col.payment"),
            principal: t("schedule.col.principal"),
            interest: t("schedule.col.interest"),
            balance: t("schedule.col.balance"),
          }}
        />
      )}
    </div>
  );
}
