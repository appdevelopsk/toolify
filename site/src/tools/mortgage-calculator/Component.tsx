"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { buildAmortizationRows, monthlyPayment } from "@/components/tools/amortization";
import { AmortizationTable } from "@/components/tools/AmortizationTable";

export default function MortgageCalculator() {
  const t = useTranslations("tools.mortgage-calculator");
  const locale = useLocale();
  const [price, setPrice] = useState("400000");
  const [downPct, setDownPct] = useState("20");
  const [ratePct, setRatePct] = useState("6.5");
  const [years, setYears] = useState("30");
  const [taxAnnual, setTaxAnnual] = useState("4800");
  const [insuranceAnnual, setInsuranceAnnual] = useState("1200");
  const [hoaMonthly, setHoaMonthly] = useState("0");
  const [showCompare, setShowCompare] = useState(false);
  const [rateBPct, setRateBPct] = useState("6.0");
  const [yearsB, setYearsB] = useState("30");

  const result = useMemo(() => {
    const P = parseFloat(price);
    const dp = parseFloat(downPct);
    const r = parseFloat(ratePct) / 100 / 12;
    const n = parseFloat(years) * 12;
    const tax = parseFloat(taxAnnual);
    const ins = parseFloat(insuranceAnnual);
    const hoa = parseFloat(hoaMonthly);
    if (![P, dp, r, n, tax, ins, hoa].every(isFinite) || P <= 0 || n <= 0 || dp < 0 || dp > 100) return null;
    const downPayment = (P * dp) / 100;
    const principal = P - downPayment;
    const monthlyPI = r === 0 ? principal / n : (principal * r) / (1 - Math.pow(1 + r, -n));
    const monthlyTax = tax / 12;
    const monthlyIns = ins / 12;
    // PMI: if down payment < 20%, ~ 0.5%/year of principal
    const monthlyPmi = dp < 20 ? (principal * 0.005) / 12 : 0;
    const totalMonthly = monthlyPI + monthlyTax + monthlyIns + monthlyPmi + hoa;
    const totalPaid = monthlyPI * n;
    const totalInterest = totalPaid - principal;
    return { downPayment, principal, monthlyPI, monthlyTax, monthlyIns, monthlyPmi, hoa, totalMonthly, totalInterest };
  }, [price, downPct, ratePct, years, taxAnnual, insuranceAnnual, hoaMonthly]);

  const schedule = useMemo(() => {
    if (!result) return [];
    return buildAmortizationRows(result.principal, parseFloat(ratePct), Math.round(parseFloat(years) * 12));
  }, [result, ratePct, years]);

  const compare = useMemo(() => {
    if (!result || !showCompare) return null;
    const rB = parseFloat(rateBPct);
    const nB = Math.round(parseFloat(yearsB) * 12);
    const nA = Math.round(parseFloat(years) * 12);
    if (!isFinite(rB) || !isFinite(nB) || rB < 0 || nB <= 0 || nA <= 0) return null;
    const monthlyB = monthlyPayment(result.principal, rB, nB);
    const a = { monthly: result.monthlyPI, totalPaid: result.monthlyPI * nA, totalInterest: result.totalInterest };
    const b = { monthly: monthlyB, totalPaid: monthlyB * nB, totalInterest: monthlyB * nB - result.principal };
    return { a, b };
  }, [result, showCompare, rateBPct, yearsB, years]);

  const currency = useMemo(
    () => new Intl.NumberFormat(locale, { style: "currency", currency: locale === "ja" ? "JPY" : "USD", maximumFractionDigits: 0 }),
    [locale],
  );
  const cents = useMemo(
    () => new Intl.NumberFormat(locale, { style: "currency", currency: locale === "ja" ? "JPY" : "USD", maximumFractionDigits: locale === "ja" ? 0 : 2 }),
    [locale],
  );

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">{t("input.price")}</span>
          <input inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.downPct")}</span>
          <input inputMode="decimal" value={downPct} onChange={(e) => setDownPct(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.ratePct")}</span>
          <input inputMode="decimal" value={ratePct} onChange={(e) => setRatePct(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.years")}</span>
          <input inputMode="decimal" value={years} onChange={(e) => setYears(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.taxAnnual")}</span>
          <input inputMode="decimal" value={taxAnnual} onChange={(e) => setTaxAnnual(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.insuranceAnnual")}</span>
          <input inputMode="decimal" value={insuranceAnnual} onChange={(e) => setInsuranceAnnual(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-sm font-medium">{t("input.hoaMonthly")}</span>
          <input inputMode="decimal" value={hoaMonthly} onChange={(e) => setHoaMonthly(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
        </label>
      </div>

      <div aria-live="polite" className={`mt-6 rounded-lg border p-4 ${result ? "border-brand-200 bg-brand-50 dark:border-brand-900 dark:bg-brand-900/20" : "border-slate-200 dark:border-slate-800"}`}>
        {result ? (
          <>
            <div className="text-xs uppercase tracking-wider text-slate-600">{t("result.totalMonthly")}</div>
            <div className="mt-1 text-4xl font-bold tabular-nums">{cents.format(result.totalMonthly)}</div>
            <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
              <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800">
                <dt>{t("result.principalAndInterest")}</dt>
                <dd className="tabular-nums">{cents.format(result.monthlyPI)}</dd>
              </div>
              <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800">
                <dt>{t("result.tax")}</dt>
                <dd className="tabular-nums">{cents.format(result.monthlyTax)}</dd>
              </div>
              <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800">
                <dt>{t("result.insurance")}</dt>
                <dd className="tabular-nums">{cents.format(result.monthlyIns)}</dd>
              </div>
              {result.monthlyPmi > 0 && (
                <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800">
                  <dt>{t("result.pmi")}</dt>
                  <dd className="tabular-nums">{cents.format(result.monthlyPmi)}</dd>
                </div>
              )}
              <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800">
                <dt>{t("result.downPayment")}</dt>
                <dd className="tabular-nums">{currency.format(result.downPayment)}</dd>
              </div>
              <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800">
                <dt>{t("result.principal")}</dt>
                <dd className="tabular-nums">{currency.format(result.principal)}</dd>
              </div>
              <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800">
                <dt>{t("result.totalInterest")}</dt>
                <dd className="tabular-nums text-amber-700">{currency.format(result.totalInterest)}</dd>
              </div>
            </dl>
          </>
        ) : (
          <div className="text-sm text-slate-600">{t("empty")}</div>
        )}
      </div>

      {result && (
        <div className="mt-6">
          <button
            type="button"
            onClick={() => setShowCompare((v) => !v)}
            className="rounded border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
            aria-expanded={showCompare}
          >
            {showCompare ? t("compare.hide") : t("compare.toggle")}
          </button>

          {showCompare && (
            <div className="mt-3 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
              <h2 className="font-semibold">{t("compare.heading")}</h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium">{t("compare.rateB")}</span>
                  <input inputMode="decimal" value={rateBPct} onChange={(e) => setRateBPct(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
                </label>
                <label className="block">
                  <span className="text-sm font-medium">{t("compare.yearsB")}</span>
                  <input inputMode="decimal" value={yearsB} onChange={(e) => setYearsB(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
                </label>
              </div>
              {compare && (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-[28rem] text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-left dark:border-slate-800">
                        <th className="py-1 pr-3 font-medium" />
                        <th className="py-1 pr-3 font-medium">{t("compare.scenarioA")}</th>
                        <th className="py-1 pr-3 font-medium">{t("compare.scenarioB")}</th>
                        <th className="py-1 font-medium">{t("compare.difference")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(
                        [
                          { key: "monthlyPI", a: compare.a.monthly, b: compare.b.monthly, fmt: cents },
                          { key: "totalInterest", a: compare.a.totalInterest, b: compare.b.totalInterest, fmt: currency },
                          { key: "totalPaid", a: compare.a.totalPaid, b: compare.b.totalPaid, fmt: currency },
                        ] as const
                      ).map((row) => {
                        const diff = row.b - row.a;
                        return (
                          <tr key={row.key} className="border-b border-slate-100 dark:border-slate-800/50">
                            <td className="py-1.5 pr-3">{t(`compare.${row.key}`)}</td>
                            <td className="py-1.5 pr-3 tabular-nums">{row.fmt.format(row.a)}</td>
                            <td className="py-1.5 pr-3 tabular-nums">{row.fmt.format(row.b)}</td>
                            <td className={`py-1.5 tabular-nums font-medium ${diff < 0 ? "text-emerald-700 dark:text-emerald-400" : diff > 0 ? "text-rose-700 dark:text-rose-400" : ""}`}>
                              {diff > 0 ? "+" : ""}
                              {row.fmt.format(diff)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {schedule.length > 0 && (
        <AmortizationTable
          rows={schedule}
          format={cents}
          csvFilename="mortgage-amortization-schedule.csv"
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
