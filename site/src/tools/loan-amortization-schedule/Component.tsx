"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

interface Row {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

function buildSchedule(principal: number, annualRatePct: number, months: number): Row[] {
  const r = annualRatePct / 100 / 12;
  const monthly = r === 0 ? principal / months : (principal * r) / (1 - Math.pow(1 + r, -months));
  const rows: Row[] = [];
  let balance = principal;
  for (let m = 1; m <= months; m++) {
    const interest = balance * r;
    const principalPaid = monthly - interest;
    balance = Math.max(0, balance - principalPaid);
    rows.push({ month: m, payment: monthly, principal: principalPaid, interest, balance });
  }
  return rows;
}

export default function LoanAmortizationSchedule() {
  const t = useTranslations("tools.loan-amortization-schedule");
  const locale = useLocale();
  const [principal, setPrincipal] = useState("200000");
  const [ratePct, setRatePct] = useState("6.0");
  const [years, setYears] = useState("30");
  const [showAll, setShowAll] = useState(false);

  const schedule = useMemo(() => {
    const p = parseFloat(principal);
    const r = parseFloat(ratePct);
    const y = parseFloat(years);
    if (!isFinite(p) || !isFinite(r) || !isFinite(y) || p <= 0 || y <= 0 || r < 0) return null;
    return buildSchedule(p, r, Math.round(y * 12));
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

  function downloadCsv() {
    if (!schedule) return;
    const headers = ["month", "payment", "principal", "interest", "balance"];
    const lines = [headers.join(",")];
    for (const r of schedule) {
      lines.push([r.month, r.payment.toFixed(2), r.principal.toFixed(2), r.interest.toFixed(2), r.balance.toFixed(2)].join(","));
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "amortization-schedule.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const visible = schedule ? (showAll ? schedule : schedule.filter((r) => r.month === 1 || r.month % 12 === 0 || r.month === schedule.length)) : [];

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
        <div className="mt-6">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <h2 className="font-semibold">{t("schedule.heading")}</h2>
            <button onClick={() => setShowAll((v) => !v)} className="rounded border border-slate-300 px-2 py-0.5 text-xs hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800">
              {showAll ? t("schedule.condense") : t("schedule.showAll")}
            </button>
            <button onClick={downloadCsv} className="rounded border border-slate-300 px-2 py-0.5 text-xs hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800">
              {t("schedule.downloadCsv")}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-left">
                  <th className="py-1 pr-3 font-medium">{t("schedule.col.month")}</th>
                  <th className="py-1 pr-3 font-medium">{t("schedule.col.payment")}</th>
                  <th className="py-1 pr-3 font-medium">{t("schedule.col.principal")}</th>
                  <th className="py-1 pr-3 font-medium">{t("schedule.col.interest")}</th>
                  <th className="py-1 pr-3 font-medium">{t("schedule.col.balance")}</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((r) => (
                  <tr key={r.month} className="border-b border-slate-100 dark:border-slate-800/50">
                    <td className="py-1 pr-3 tabular-nums">{r.month}</td>
                    <td className="py-1 pr-3 tabular-nums">{fmt.format(r.payment)}</td>
                    <td className="py-1 pr-3 tabular-nums text-emerald-700 dark:text-emerald-400">{fmt.format(r.principal)}</td>
                    <td className="py-1 pr-3 tabular-nums text-rose-700 dark:text-rose-400">{fmt.format(r.interest)}</td>
                    <td className="py-1 pr-3 tabular-nums">{fmt.format(r.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!showAll && <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">{t("schedule.condensedNote")}</p>}
        </div>
      )}
    </div>
  );
}
