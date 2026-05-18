"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

type SolveFor = "c" | "a" | "b" | null;

interface CalcResult {
  solveFor: SolveFor;
  a: number;
  b: number;
  c: number;
  perimeter: number;
  area: number;
  angleA: number;
  angleB: number;
  angleC: number;
}

interface CalcError {
  key: string;
}

function compute(
  aStr: string,
  bStr: string,
  cStr: string
): CalcResult | CalcError | null {
  const aVal = aStr.trim() === "" ? null : parseFloat(aStr);
  const bVal = bStr.trim() === "" ? null : parseFloat(bStr);
  const cVal = cStr.trim() === "" ? null : parseFloat(cStr);

  const filledCount = [aVal, bVal, cVal].filter((v) => v !== null).length;

  if (filledCount < 2) return null;
  if (filledCount === 3) {
    // All three filled — treat as override: recompute C from A,B and check consistency is fine,
    // but since user must leave one blank, just surface needTwoValues if all three have values.
    // Actually, if all three provided we can still compute — detect which one is "extra" by
    // checking if c² == a² + b². If not, show error. For simplicity, require exactly two.
    return { key: "needTwoValues" };
  }

  // Validate provided values are positive
  if (aVal !== null && (isNaN(aVal) || aVal <= 0)) return { key: "invalidInput" };
  if (bVal !== null && (isNaN(bVal) || bVal <= 0)) return { key: "invalidInput" };
  if (cVal !== null && (isNaN(cVal) || cVal <= 0)) return { key: "invalidInput" };

  let solveFor: SolveFor;
  let a: number, b: number, c: number;

  if (cVal === null) {
    // Solve for C (hypotenuse)
    solveFor = "c";
    a = aVal!;
    b = bVal!;
    c = Math.sqrt(a * a + b * b);
  } else if (aVal === null) {
    // Solve for A
    solveFor = "a";
    b = bVal!;
    c = cVal;
    if (c <= b) return { key: "hypotenuseTooSmall" };
    a = Math.sqrt(c * c - b * b);
  } else {
    // Solve for B
    solveFor = "b";
    a = aVal!;
    c = cVal;
    if (c <= a) return { key: "hypotenuseTooSmall" };
    b = Math.sqrt(c * c - a * a);
  }

  const perimeter = a + b + c;
  const area = (a * b) / 2;
  // Angles: A is opposite side a, B is opposite side b, C is always 90°
  const angleA = (Math.atan2(a, b) * 180) / Math.PI;
  const angleB = (Math.atan2(b, a) * 180) / Math.PI;
  const angleC = 90;

  return { solveFor, a, b, c, perimeter, area, angleA, angleB, angleC };
}

export default function PythagoreanTheoremCalculator() {
  const t = useTranslations("tools.pythagorean-theorem-calculator");
  const locale = useLocale();

  const [sideA, setSideA] = useState("3");
  const [sideB, setSideB] = useState("4");
  const [hypotenuse, setHypotenuse] = useState("");

  const fmt = useMemo(
    () => new Intl.NumberFormat(locale, { maximumFractionDigits: 6 }),
    [locale]
  );

  const result = useMemo(
    () => compute(sideA, sideB, hypotenuse),
    [sideA, sideB, hypotenuse]
  );

  const isError = result !== null && "key" in result;
  const isResult = result !== null && !("key" in result);

  const inputClass =
    "mt-1 w-full rounded border border-slate-300 px-3 py-2 tabular-nums dark:border-slate-700 dark:bg-slate-900";
  const inputClassHighlight =
    "mt-1 w-full rounded border-2 border-brand-500 bg-brand-50 px-3 py-2 tabular-nums dark:border-brand-400 dark:bg-brand-900/20";

  return (
    <div>
      {/* Triangle diagram */}
      <div className="mb-4 flex justify-center">
        <pre className="select-none font-mono text-xs leading-tight text-slate-500 dark:text-slate-400">
          {`C (90°)\n|\\
|  \\\n|    \\  c (hypotenuse)\nb |      \\\n|        \\\nA----------B\n     a`}
        </pre>
      </div>

      <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
        {t("hint")}
      </p>

      <div className="grid gap-3 sm:grid-cols-3">
        {/* Side A */}
        <label className="block">
          <span className="text-sm font-medium">
            {t("input.sideA")}
            <span className="ml-1 text-xs font-normal text-slate-500">
              {t("input.sideAHint")}
            </span>
          </span>
          <input
            type="number"
            step="any"
            min="0"
            value={sideA}
            onChange={(e) => setSideA(e.target.value)}
            placeholder={t("input.placeholder")}
            className={
              isResult && (result as CalcResult).solveFor === "a"
                ? inputClassHighlight
                : inputClass
            }
          />
        </label>

        {/* Side B */}
        <label className="block">
          <span className="text-sm font-medium">
            {t("input.sideB")}
            <span className="ml-1 text-xs font-normal text-slate-500">
              {t("input.sideBHint")}
            </span>
          </span>
          <input
            type="number"
            step="any"
            min="0"
            value={sideB}
            onChange={(e) => setSideB(e.target.value)}
            placeholder={t("input.placeholder")}
            className={
              isResult && (result as CalcResult).solveFor === "b"
                ? inputClassHighlight
                : inputClass
            }
          />
        </label>

        {/* Hypotenuse C */}
        <label className="block">
          <span className="text-sm font-medium">
            {t("input.hypotenuse")}
            <span className="ml-1 text-xs font-normal text-slate-500">
              {t("input.hypotenuseHint")}
            </span>
          </span>
          <input
            type="number"
            step="any"
            min="0"
            value={hypotenuse}
            onChange={(e) => setHypotenuse(e.target.value)}
            placeholder={t("input.placeholder")}
            className={
              isResult && (result as CalcResult).solveFor === "c"
                ? inputClassHighlight
                : inputClass
            }
          />
        </label>
      </div>

      <div
        aria-live="polite"
        className="mt-6 rounded-lg border border-slate-200 p-4 dark:border-slate-800"
      >
        {result === null ? (
          <div className="text-sm text-slate-500 dark:text-slate-400">
            {t("empty")}
          </div>
        ) : isError ? (
          <div className="text-sm text-rose-500">
            {t(`error.${(result as CalcError).key}`)}
          </div>
        ) : (
          (() => {
            const r = result as CalcResult;
            return (
              <div>
                {/* Missing value highlight */}
                <div className="mb-4 rounded-lg bg-brand-50 p-3 dark:bg-brand-900/20">
                  <div className="text-xs font-medium text-brand-700 dark:text-brand-300">
                    {t("result.missingValue")}
                  </div>
                  <div className="tabular-nums text-3xl font-bold text-brand-700 dark:text-brand-300">
                    {r.solveFor === "c" && (
                      <>
                        {t("input.hypotenuse")} (c) = {fmt.format(r.c)}
                      </>
                    )}
                    {r.solveFor === "a" && (
                      <>
                        {t("input.sideA")} (a) = {fmt.format(r.a)}
                      </>
                    )}
                    {r.solveFor === "b" && (
                      <>
                        {t("input.sideB")} (b) = {fmt.format(r.b)}
                      </>
                    )}
                  </div>
                </div>

                {/* Summary grid */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded bg-emerald-50 p-3 dark:bg-emerald-900/20">
                    <div className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                      {t("result.area")}
                    </div>
                    <div className="tabular-nums text-2xl font-bold">
                      {fmt.format(r.area)}
                    </div>
                  </div>
                  <div className="rounded bg-slate-100 p-3 dark:bg-slate-800">
                    <div className="text-xs font-medium">
                      {t("result.perimeter")}
                    </div>
                    <div className="tabular-nums text-2xl font-bold">
                      {fmt.format(r.perimeter)}
                    </div>
                  </div>
                </div>

                {/* Sides */}
                <h3 className="mt-4 text-sm font-semibold">
                  {t("result.sides")}
                </h3>
                <dl className="mt-2 grid gap-1 text-sm sm:grid-cols-3">
                  <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-700">
                    <dt>a</dt>
                    <dd className="tabular-nums">{fmt.format(r.a)}</dd>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-700">
                    <dt>b</dt>
                    <dd className="tabular-nums">{fmt.format(r.b)}</dd>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-700">
                    <dt>c</dt>
                    <dd className="tabular-nums">{fmt.format(r.c)}</dd>
                  </div>
                </dl>

                {/* Angles */}
                <h3 className="mt-3 text-sm font-semibold">
                  {t("result.angles")}
                </h3>
                <dl className="mt-2 grid gap-1 text-sm sm:grid-cols-3">
                  <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-700">
                    <dt>{t("result.angleA")}</dt>
                    <dd className="tabular-nums">{fmt.format(r.angleA)}°</dd>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-700">
                    <dt>{t("result.angleB")}</dt>
                    <dd className="tabular-nums">{fmt.format(r.angleB)}°</dd>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-700">
                    <dt>{t("result.angleC")}</dt>
                    <dd className="tabular-nums font-semibold">
                      {fmt.format(r.angleC)}° ✓
                    </dd>
                  </div>
                </dl>
              </div>
            );
          })()
        )}
      </div>
    </div>
  );
}
