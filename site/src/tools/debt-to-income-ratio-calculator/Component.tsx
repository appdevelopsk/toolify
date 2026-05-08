"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

export default function DtiCalculator() {
  const t = useTranslations("tools.debt-to-income-ratio-calculator");
  const locale = useLocale();
  const [grossIncome, setGrossIncome] = useState("6000");
  const [housing, setHousing] = useState("1500");
  const [carLoan, setCarLoan] = useState("400");
  const [creditCards, setCreditCards] = useState("200");
  const [studentLoans, setStudentLoans] = useState("250");
  const [otherDebt, setOtherDebt] = useState("0");

  const result = useMemo(() => {
    const income = parseFloat(grossIncome);
    if (!isFinite(income) || income <= 0) return null;
    const h = parseFloat(housing) || 0;
    const c = parseFloat(carLoan) || 0;
    const cc = parseFloat(creditCards) || 0;
    const s = parseFloat(studentLoans) || 0;
    const o = parseFloat(otherDebt) || 0;
    const totalDebt = h + c + cc + s + o;
    const frontEnd = (h / income) * 100; // Housing-only DTI
    const backEnd = (totalDebt / income) * 100; // Total DTI
    let category: "excellent" | "good" | "fair" | "poor";
    if (backEnd <= 20) category = "excellent";
    else if (backEnd <= 36) category = "good";
    else if (backEnd <= 43) category = "fair";
    else category = "poor";
    return { totalDebt, frontEnd, backEnd, category };
  }, [grossIncome, housing, carLoan, creditCards, studentLoans, otherDebt]);

  const fmt = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }), [locale]);

  return (
    <div>
      <label className="block">
        <span className="text-sm font-medium">{t("input.grossIncome")}</span>
        <input type="number" inputMode="decimal" value={grossIncome} onChange={(e) => setGrossIncome(e.target.value)}
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-mono text-lg tabular-nums dark:border-slate-700 dark:bg-slate-900" />
      </label>

      <h2 className="mt-6 text-sm font-semibold">{t("input.debtsHeading")}</h2>
      <div className="mt-2 grid gap-3 sm:grid-cols-2">
        {[
          { id: "housing", value: housing, set: setHousing },
          { id: "carLoan", value: carLoan, set: setCarLoan },
          { id: "creditCards", value: creditCards, set: setCreditCards },
          { id: "studentLoans", value: studentLoans, set: setStudentLoans },
          { id: "otherDebt", value: otherDebt, set: setOtherDebt },
        ].map((row) => (
          <label key={row.id} className="block">
            <span className="text-sm">{t(`input.${row.id}`)}</span>
            <input type="number" inputMode="decimal" value={row.value} onChange={(e) => row.set(e.target.value)}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-mono tabular-nums dark:border-slate-700 dark:bg-slate-900" />
          </label>
        ))}
      </div>

      <div aria-live="polite" className={`mt-6 rounded-lg border p-4 ${
        result ? (
          result.category === "excellent" ? "border-emerald-300 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-900/20" :
          result.category === "good" ? "border-lime-300 bg-lime-50 dark:border-lime-900 dark:bg-lime-900/20" :
          result.category === "fair" ? "border-amber-300 bg-amber-50 dark:border-amber-900 dark:bg-amber-900/20" :
          "border-rose-300 bg-rose-50 dark:border-rose-900 dark:bg-rose-900/20"
        ) : "border-slate-200 dark:border-slate-800"
      }`}>
        {result ? (
          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            <div className="flex justify-between border-b border-slate-200/60 py-1 sm:col-span-2">
              <dt className="font-medium">{t("result.backEnd")}</dt>
              <dd className="tabular-nums text-2xl font-bold">{fmt.format(result.backEnd)}%</dd>
            </div>
            <div className="flex justify-between border-b border-slate-200/60 py-1">
              <dt>{t("result.frontEnd")}</dt>
              <dd className="tabular-nums">{fmt.format(result.frontEnd)}%</dd>
            </div>
            <div className="flex justify-between border-b border-slate-200/60 py-1">
              <dt>{t("result.totalDebt")}</dt>
              <dd className="tabular-nums">{fmt.format(result.totalDebt)}</dd>
            </div>
            <div className="sm:col-span-2 mt-2">
              <div className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">{t("result.categoryLabel")}</div>
              <div className="text-lg font-bold">{t(`category.${result.category}`)}</div>
              <p className="mt-1 text-sm">{t(`categoryNote.${result.category}`)}</p>
            </div>
          </dl>
        ) : <div className="text-sm text-slate-500">{t("empty")}</div>}
      </div>
    </div>
  );
}
