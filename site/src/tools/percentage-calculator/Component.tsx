"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

type Mode = "pct_of" | "what_pct" | "pct_change";

export default function PercentageCalculator() {
  const t = useTranslations("tools.percentage-calculator");
  const locale = useLocale();
  const [mode, setMode] = useState<Mode>("pct_of");
  const [a, setA] = useState("");
  const [b, setB] = useState("");

  const result = useMemo(() => {
    const x = parseFloat(a);
    const y = parseFloat(b);
    if (!isFinite(x) || !isFinite(y)) return null;
    switch (mode) {
      case "pct_of":
        return (x / 100) * y;
      case "what_pct":
        return y === 0 ? null : (x / y) * 100;
      case "pct_change":
        return x === 0 ? null : ((y - x) / x) * 100;
    }
  }, [mode, a, b]);

  const fmt = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 4 }), [locale]);
  const labelA = t(`mode.${mode}.labelA`);
  const labelB = t(`mode.${mode}.labelB`);
  const resultLabel = t(`mode.${mode}.resultLabel`);
  const resultUnit = t(`mode.${mode}.resultUnit`);

  return (
    <div>
      <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
        {(["pct_of", "what_pct", "pct_change"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`rounded border px-3 py-2 text-sm ${
              mode === m
                ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20"
                : "border-slate-300 dark:border-slate-700"
            }`}
          >
            {t(`mode.${m}.title`)}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">{labelA}</span>
          <input
            inputMode="decimal"
            value={a}
            onChange={(e) => setA(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{labelB}</span>
          <input
            inputMode="decimal"
            value={b}
            onChange={(e) => setB(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          />
        </label>
      </div>

      <div
        aria-live="polite"
        className={`mt-6 rounded-lg border p-4 ${
          result !== null ? "border-brand-200 bg-brand-50 dark:border-brand-900 dark:bg-brand-900/20" : "border-slate-200 dark:border-slate-800"
        }`}
      >
        {result !== null ? (
          <>
            <div className="text-sm uppercase tracking-wider text-slate-500">{resultLabel}</div>
            <div className="mt-1 text-4xl font-bold tabular-nums">
              {fmt.format(result)}
              <span className="ml-1 text-2xl text-slate-500">{resultUnit}</span>
            </div>
          </>
        ) : (
          <div className="text-sm text-slate-500">{t("empty")}</div>
        )}
      </div>
    </div>
  );
}
