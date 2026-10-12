"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import {
  calcPaycheck,
  TAX_YEAR,
  type FilingStatus,
  type PayFrequency,
} from "./calc";

export default function PaycheckCalculator() {
  const t = useTranslations("tools.paycheck-calculator");
  const locale = useLocale();

  const [salary, setSalary] = useState("75000");
  const [filingStatus, setFilingStatus] = useState<FilingStatus>("single");
  const [payFrequency, setPayFrequency] = useState<PayFrequency>("biweekly");
  const [additionalWithholding, setAdditionalWithholding] = useState("");

  const result = useMemo(
    () =>
      calcPaycheck(
        parseFloat(salary),
        filingStatus,
        payFrequency,
        parseFloat(additionalWithholding) || 0,
      ),
    [salary, filingStatus, payFrequency, additionalWithholding],
  );

  const fmt = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2,
      }),
    [locale]
  );

  const inputClass =
    "mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900";
  const selectClass =
    "mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900";

  return (
    <div>
      <div
        role="note"
        className="mb-5 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-200"
      >
        <p className="font-semibold">{t("note.taxYearLabel", { year: String(TAX_YEAR) })}</p>
        <p className="mt-1">{t("note.taxYearWarning", { year: String(TAX_YEAR) })}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">{t("input.salary")}</span>
          <input
            inputMode="decimal"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            className={inputClass}
            placeholder="75000"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.filingStatus")}</span>
          <select
            value={filingStatus}
            onChange={(e) => setFilingStatus(e.target.value as FilingStatus)}
            className={selectClass}
          >
            <option value="single">{t("statuses.single")}</option>
            <option value="mfj">{t("statuses.mfj")}</option>
            <option value="hoh">{t("statuses.hoh")}</option>
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.payFrequency")}</span>
          <select
            value={payFrequency}
            onChange={(e) => setPayFrequency(e.target.value as PayFrequency)}
            className={selectClass}
          >
            <option value="weekly">{t("frequencies.weekly")}</option>
            <option value="biweekly">{t("frequencies.biweekly")}</option>
            <option value="semimonthly">{t("frequencies.semimonthly")}</option>
            <option value="monthly">{t("frequencies.monthly")}</option>
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.additionalWithholding")}</span>
          <input
            inputMode="decimal"
            value={additionalWithholding}
            onChange={(e) => setAdditionalWithholding(e.target.value)}
            className={inputClass}
            placeholder="0"
          />
        </label>
      </div>

      <div
        aria-live="polite"
        className={`mt-6 rounded-lg border p-4 ${
          result
            ? "border-brand-200 bg-brand-50 dark:border-brand-900 dark:bg-brand-900/20"
            : "border-slate-200 dark:border-slate-800"
        }`}
      >
        {result ? (
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Per Paycheck
            </h3>
            <dl className="grid gap-3 sm:grid-cols-3">
              <div>
                <dt className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  {t("result.gross")}
                </dt>
                <dd className="mt-1 text-xl font-bold tabular-nums">
                  {fmt.format(result.grossPerPaycheck)}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  {t("result.federalTax")}
                </dt>
                <dd className="mt-1 text-xl font-bold tabular-nums text-red-600 dark:text-red-400">
                  −{fmt.format(result.federalTaxPerPaycheck)}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  {t("result.stateTax")}
                </dt>
                <dd className="mt-1 text-xl font-bold tabular-nums text-red-600 dark:text-red-400">
                  −{fmt.format(result.stateTaxPerPaycheck)}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  {t("result.socialSecurity")}
                </dt>
                <dd className="mt-1 text-xl font-bold tabular-nums text-red-600 dark:text-red-400">
                  −{fmt.format(result.ssPerPaycheck)}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  {t("result.medicare")}
                </dt>
                <dd className="mt-1 text-xl font-bold tabular-nums text-red-600 dark:text-red-400">
                  −{fmt.format(result.medicarePerPaycheck)}
                </dd>
              </div>
              <div className="sm:col-span-3 border-t border-brand-200 pt-3 dark:border-brand-800">
                <dt className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  {t("result.net")}
                </dt>
                <dd className="mt-1 text-3xl font-bold tabular-nums text-green-700 dark:text-green-400">
                  {fmt.format(result.netPerPaycheck)}
                </dd>
              </div>
            </dl>
            <div className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-700">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Annual totals
              </p>
              <dl className="grid gap-2 text-sm sm:grid-cols-3">
                <div>
                  <dt className="text-xs text-slate-500">{t("result.federalTax")}</dt>
                  <dd className="font-medium">{fmt.format(result.annualFederalTax)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">{t("result.stateTax")}</dt>
                  <dd className="font-medium">{fmt.format(result.annualStateTax)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">{t("result.annualNet")}</dt>
                  <dd className="font-bold text-green-700 dark:text-green-400">
                    {fmt.format(result.annualNet)}
                  </dd>
                </div>
              </dl>
            </div>
            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
              {t("note.stateDisclaimer")}
            </p>
          </div>
        ) : (
          <p className="text-sm text-slate-600 dark:text-slate-400">{t("empty")}</p>
        )}
      </div>
    </div>
  );
}
