"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

type Tab = "pct_change" | "new_value" | "original_value";
type Direction = "increase" | "decrease" | "noChange";
type CalcError = { error: "divisionByZero" };
type PctChangeResult = { change: number; absoluteChange: number; direction: Direction; a: number; b: number };
type NewValueResult = { newValue: number; absoluteChange: number; direction: Direction; a: number; b: number };
type OriginalValueResult = { originalValue: number; absoluteChange: number; direction: Direction; a: number; b: number };
type CalcResult = PctChangeResult | NewValueResult | OriginalValueResult | CalcError | null;

export default function PercentageChangeCalculator() {
  const t = useTranslations("tools.percentage-change-calculator");
  const locale = useLocale();
  const [tab, setTab] = useState<Tab>("pct_change");
  const [inputA, setInputA] = useState("");
  const [inputB, setInputB] = useState("");

  const fmt = useMemo(
    () => new Intl.NumberFormat(locale, { maximumFractionDigits: 4 }),
    [locale]
  );
  const fmtSigned = useMemo(
    () => new Intl.NumberFormat(locale, { maximumFractionDigits: 4, signDisplay: "always" }),
    [locale]
  );

  const result = useMemo((): CalcResult => {
    const a = parseFloat(inputA);
    const b = parseFloat(inputB);

    if (tab === "pct_change") {
      if (!isFinite(a) || !isFinite(b)) return null;
      if (a === 0) return { error: "divisionByZero" };
      const change = ((b - a) / Math.abs(a)) * 100;
      const absoluteChange = b - a;
      const direction: Direction =
        change > 0 ? "increase" : change < 0 ? "decrease" : "noChange";
      return { change, absoluteChange, direction, a, b };
    }

    if (tab === "new_value") {
      if (!isFinite(a) || !isFinite(b)) return null;
      const newValue = a * (1 + b / 100);
      const absoluteChange = newValue - a;
      const direction: Direction =
        absoluteChange > 0 ? "increase" : absoluteChange < 0 ? "decrease" : "noChange";
      return { newValue, absoluteChange, direction, a, b };
    }

    if (tab === "original_value") {
      if (!isFinite(a) || !isFinite(b)) return null;
      if (b === -100) return { error: "divisionByZero" };
      const originalValue = a / (1 + b / 100);
      const absoluteChange = a - originalValue;
      const direction: Direction =
        absoluteChange > 0 ? "increase" : absoluteChange < 0 ? "decrease" : "noChange";
      return { originalValue, absoluteChange, direction, a, b };
    }

    return null;
  }, [tab, inputA, inputB]);

  function directionColor(direction: Direction) {
    if (direction === "increase") return "text-emerald-600 dark:text-emerald-400";
    if (direction === "decrease") return "text-red-600 dark:text-red-400";
    return "text-slate-500 dark:text-slate-400";
  }

  function directionBg(direction: Direction) {
    if (direction === "increase") return "bg-emerald-50 dark:bg-emerald-900/20";
    if (direction === "decrease") return "bg-red-50 dark:bg-red-900/20";
    return "bg-slate-50 dark:bg-slate-800/50";
  }

  const tabs: Tab[] = ["pct_change", "new_value", "original_value"];

  return (
    <div>
      {/* Tab bar */}
      <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
        {tabs.map((tabKey) => (
          <button
            key={tabKey}
            onClick={() => {
              setTab(tabKey);
              setInputA("");
              setInputB("");
            }}
            className={`rounded border px-3 py-2 text-sm ${
              tab === tabKey
                ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20"
                : "border-slate-300 dark:border-slate-700"
            }`}
          >
            {t(`tab.${tabKey}.title`)}
          </button>
        ))}
      </div>

      {/* Inputs */}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">{t(`tab.${tab}.labelA`)}</span>
          <input
            type="number"
            inputMode="decimal"
            value={inputA}
            onChange={(e) => setInputA(e.target.value)}
            placeholder={t(`tab.${tab}.placeholderA`)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 tabular-nums dark:border-slate-700 dark:bg-slate-900"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t(`tab.${tab}.labelB`)}</span>
          <input
            type="number"
            inputMode="decimal"
            value={inputB}
            onChange={(e) => setInputB(e.target.value)}
            placeholder={t(`tab.${tab}.placeholderB`)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 tabular-nums dark:border-slate-700 dark:bg-slate-900"
          />
        </label>
      </div>

      {/* Result area */}
      <div aria-live="polite" className="mt-6 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
        {!result ? (
          <p className="text-center text-slate-400">{t("empty")}</p>
        ) : "error" in result ? (
          <p className="text-center text-red-500">{t(`error.${result.error}`)}</p>
        ) : tab === "pct_change" && "change" in result ? (
          <dl className="grid gap-3 text-sm">
            <div className={`rounded-lg p-4 ${directionBg(result.direction)}`}>
              <dt className="font-medium text-slate-700 dark:text-slate-300">
                {t("result.change")}
              </dt>
              <dd className={`mt-1 text-3xl font-bold tabular-nums ${directionColor(result.direction)}`}>
                {fmtSigned.format(result.change)}%
              </dd>
              <dd className={`mt-1 text-sm font-medium ${directionColor(result.direction)}`}>
                {t(`result.direction.${result.direction}`)}
              </dd>
            </div>
            <div className="rounded border border-slate-200 px-3 py-2 dark:border-slate-700">
              <dt className="text-xs text-slate-500">{t("result.absoluteChange")}</dt>
              <dd className="mt-0.5 font-semibold tabular-nums">
                {fmtSigned.format(result.absoluteChange)}
              </dd>
            </div>
            <div className="rounded bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-800/50 dark:text-slate-400">
              <p>{t("result.formula")}: ({fmt.format(result.b)} − {fmt.format(result.a)}) / |{fmt.format(result.a)}| × 100</p>
            </div>
          </dl>
        ) : tab === "new_value" && "newValue" in result ? (
          <dl className="grid gap-3 text-sm">
            <div className={`rounded-lg p-4 ${directionBg(result.direction)}`}>
              <dt className="font-medium text-slate-700 dark:text-slate-300">
                {t("result.newValue")}
              </dt>
              <dd className={`mt-1 text-3xl font-bold tabular-nums ${directionColor(result.direction)}`}>
                {fmt.format(result.newValue)}
              </dd>
              <dd className={`mt-1 text-sm font-medium ${directionColor(result.direction)}`}>
                {t(`result.direction.${result.direction}`)}
              </dd>
            </div>
            <div className="rounded border border-slate-200 px-3 py-2 dark:border-slate-700">
              <dt className="text-xs text-slate-500">{t("result.absoluteChange")}</dt>
              <dd className="mt-0.5 font-semibold tabular-nums">
                {fmtSigned.format(result.absoluteChange)}
              </dd>
            </div>
            <div className="rounded bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-800/50 dark:text-slate-400">
              <p>{t("result.formula")}: {fmt.format(result.a)} × (1 + {fmt.format(result.b)} / 100)</p>
            </div>
          </dl>
        ) : tab === "original_value" && "originalValue" in result ? (
          <dl className="grid gap-3 text-sm">
            <div className={`rounded-lg p-4 ${directionBg(result.direction)}`}>
              <dt className="font-medium text-slate-700 dark:text-slate-300">
                {t("result.originalValue")}
              </dt>
              <dd className={`mt-1 text-3xl font-bold tabular-nums ${directionColor(result.direction)}`}>
                {fmt.format(result.originalValue)}
              </dd>
              <dd className={`mt-1 text-sm font-medium ${directionColor(result.direction)}`}>
                {t(`result.direction.${result.direction}`)}
              </dd>
            </div>
            <div className="rounded border border-slate-200 px-3 py-2 dark:border-slate-700">
              <dt className="text-xs text-slate-500">{t("result.absoluteChange")}</dt>
              <dd className="mt-0.5 font-semibold tabular-nums">
                {fmtSigned.format(result.absoluteChange)}
              </dd>
            </div>
            <div className="rounded bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-800/50 dark:text-slate-400">
              <p>{t("result.formula")}: {fmt.format(result.a)} / (1 + {fmt.format(result.b)} / 100)</p>
            </div>
          </dl>
        ) : null}
      </div>
    </div>
  );
}
