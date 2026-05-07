"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

export default function RetirementCalculator() {
  const t = useTranslations("tools.retirement-calculator");
  const locale = useLocale();
  const [currentAge, setCurrentAge] = useState("30");
  const [retireAge, setRetireAge] = useState("65");
  const [currentSaved, setCurrentSaved] = useState("10000");
  const [monthly, setMonthly] = useState("500");
  const [returnPct, setReturnPct] = useState("7");
  const [inflationPct, setInflationPct] = useState("2.5");

  const result = useMemo(() => {
    const a = parseFloat(currentAge);
    const r = parseFloat(retireAge);
    const p = parseFloat(currentSaved);
    const m = parseFloat(monthly);
    const ret = parseFloat(returnPct);
    const inf = parseFloat(inflationPct);
    if (![a, r, p, m, ret, inf].every(isFinite) || r <= a || a < 0 || a > 100) return null;

    const years = r - a;
    const months = years * 12;
    const monthlyRate = ret / 100 / 12;
    const realRate = (1 + ret / 100) / (1 + inf / 100) - 1;
    const monthlyRealRate = (1 + realRate) ** (1 / 12) - 1;

    function project(mRate: number) {
      let bal = p;
      let contributed = p;
      for (let i = 0; i < months; i++) {
        bal = bal * (1 + mRate) + m;
        contributed += m;
      }
      return { balance: bal, contributed };
    }

    const nominal = project(monthlyRate);
    const real = project(monthlyRealRate);

    return {
      years,
      nominalBalance: nominal.balance,
      realBalance: real.balance,
      contributed: nominal.contributed,
      growth: nominal.balance - nominal.contributed,
      monthly4pct: (real.balance * 0.04) / 12,
    };
  }, [currentAge, retireAge, currentSaved, monthly, returnPct, inflationPct]);

  const fmt = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }), [locale]);

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">{t("input.currentAge")}</span>
          <input type="number" value={currentAge} onChange={(e) => setCurrentAge(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 tabular-nums dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.retireAge")}</span>
          <input type="number" value={retireAge} onChange={(e) => setRetireAge(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 tabular-nums dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.currentSaved")}</span>
          <input type="number" value={currentSaved} onChange={(e) => setCurrentSaved(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 tabular-nums dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.monthly")}</span>
          <input type="number" value={monthly} onChange={(e) => setMonthly(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 tabular-nums dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.returnPct")}</span>
          <input type="number" step="0.1" value={returnPct} onChange={(e) => setReturnPct(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 tabular-nums dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.inflationPct")}</span>
          <input type="number" step="0.1" value={inflationPct} onChange={(e) => setInflationPct(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 tabular-nums dark:border-slate-700 dark:bg-slate-900" />
        </label>
      </div>

      <div aria-live="polite" className="mt-6 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
        {result ? (
          <dl className="grid gap-2 text-sm">
            <div className="flex justify-between rounded bg-emerald-50 px-3 py-2 dark:bg-emerald-900/20">
              <dt className="font-medium">{t("result.nominalBalance")} ({result.years} {t("result.yearsLabel")})</dt>
              <dd className="tabular-nums text-lg font-bold">{fmt.format(result.nominalBalance)}</dd>
            </div>
            <div className="flex justify-between rounded bg-amber-50 px-3 py-2 dark:bg-amber-900/20">
              <dt className="font-medium">{t("result.realBalance")}</dt>
              <dd className="tabular-nums text-lg font-bold">{fmt.format(result.realBalance)}</dd>
            </div>
            <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800">
              <dt>{t("result.contributed")}</dt>
              <dd className="tabular-nums">{fmt.format(result.contributed)}</dd>
            </div>
            <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800">
              <dt>{t("result.growth")}</dt>
              <dd className="tabular-nums">{fmt.format(result.growth)}</dd>
            </div>
            <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800">
              <dt>{t("result.monthly4pct")}</dt>
              <dd className="tabular-nums">{fmt.format(result.monthly4pct)}</dd>
            </div>
          </dl>
        ) : (
          <div className="text-sm text-slate-500">{t("empty")}</div>
        )}
      </div>
    </div>
  );
}
