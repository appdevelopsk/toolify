"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

// DIME formula: Debt + Income (years × annual) + Mortgage + Education
export default function LifeInsuranceNeedsCalculator() {
  const t = useTranslations("tools.life-insurance-needs-calculator");
  const locale = useLocale();
  const [debt, setDebt] = useState("30000");
  const [annualIncome, setAnnualIncome] = useState("60000");
  const [yearsOfIncome, setYearsOfIncome] = useState("10");
  const [mortgage, setMortgage] = useState("250000");
  const [educationPerChild, setEducationPerChild] = useState("100000");
  const [children, setChildren] = useState("2");
  const [existingCoverage, setExistingCoverage] = useState("0");
  const [savings, setSavings] = useState("20000");

  const result = useMemo(() => {
    const D = parseFloat(debt) || 0;
    const I = (parseFloat(annualIncome) || 0) * (parseFloat(yearsOfIncome) || 0);
    const M = parseFloat(mortgage) || 0;
    const E = (parseFloat(educationPerChild) || 0) * (parseFloat(children) || 0);
    const totalNeed = D + I + M + E;
    const offsets = (parseFloat(existingCoverage) || 0) + (parseFloat(savings) || 0);
    const additional = Math.max(0, totalNeed - offsets);
    return { D, I, M, E, totalNeed, offsets, additional };
  }, [debt, annualIncome, yearsOfIncome, mortgage, educationPerChild, children, existingCoverage, savings]);

  const fmt = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }), [locale]);

  const inputs: { id: string; value: string; set: (v: string) => void }[] = [
    { id: "debt", value: debt, set: setDebt },
    { id: "annualIncome", value: annualIncome, set: setAnnualIncome },
    { id: "yearsOfIncome", value: yearsOfIncome, set: setYearsOfIncome },
    { id: "mortgage", value: mortgage, set: setMortgage },
    { id: "educationPerChild", value: educationPerChild, set: setEducationPerChild },
    { id: "children", value: children, set: setChildren },
    { id: "existingCoverage", value: existingCoverage, set: setExistingCoverage },
    { id: "savings", value: savings, set: setSavings },
  ];

  return (
    <div>
      <h2 className="text-sm font-semibold">{t("dimeHeading")}</h2>
      <div className="mt-2 grid gap-3 sm:grid-cols-2">
        {inputs.map((row) => (
          <label key={row.id} className="block">
            <span className="text-sm">{t(`input.${row.id}`)}</span>
            <input type="number" inputMode="decimal" value={row.value} onChange={(e) => row.set(e.target.value)}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-mono tabular-nums dark:border-slate-700 dark:bg-slate-900" />
          </label>
        ))}
      </div>

      <div aria-live="polite" className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          <div className="flex justify-between border-b border-slate-200/60 py-1"><dt>D — {t("result.debt")}</dt><dd className="tabular-nums">{fmt.format(result.D)}</dd></div>
          <div className="flex justify-between border-b border-slate-200/60 py-1"><dt>I — {t("result.income")}</dt><dd className="tabular-nums">{fmt.format(result.I)}</dd></div>
          <div className="flex justify-between border-b border-slate-200/60 py-1"><dt>M — {t("result.mortgage")}</dt><dd className="tabular-nums">{fmt.format(result.M)}</dd></div>
          <div className="flex justify-between border-b border-slate-200/60 py-1"><dt>E — {t("result.education")}</dt><dd className="tabular-nums">{fmt.format(result.E)}</dd></div>
          <div className="flex justify-between border-b border-slate-200/60 py-1 sm:col-span-2 mt-1">
            <dt className="font-medium">{t("result.totalNeed")}</dt>
            <dd className="tabular-nums text-lg">{fmt.format(result.totalNeed)}</dd>
          </div>
          <div className="flex justify-between border-b border-slate-200/60 py-1 sm:col-span-2">
            <dt>{t("result.offsets")}</dt>
            <dd className="tabular-nums">−{fmt.format(result.offsets)}</dd>
          </div>
          <div className="flex justify-between border-b border-emerald-300 py-2 sm:col-span-2 bg-emerald-50 dark:bg-emerald-900/20 -mx-2 px-2 rounded">
            <dt className="font-bold">{t("result.additional")}</dt>
            <dd className="tabular-nums text-2xl font-bold text-emerald-700 dark:text-emerald-300">{fmt.format(result.additional)}</dd>
          </div>
        </dl>
        <p className="mt-3 text-xs text-slate-600 dark:text-slate-400">{t("note")}</p>
      </div>
    </div>
  );
}
