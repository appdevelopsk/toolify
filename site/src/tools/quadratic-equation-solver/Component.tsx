"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

export default function QuadraticEquationSolver() {
  const t = useTranslations("tools.quadratic-equation-solver");
  const locale = useLocale();
  const [a, setA] = useState("1");
  const [b, setB] = useState("-3");
  const [c, setC] = useState("2");

  const result = useMemo(() => {
    const A = parseFloat(a);
    const B = parseFloat(b);
    const C = parseFloat(c);
    if (![A, B, C].every(isFinite)) return null;
    if (A === 0) {
      if (B === 0) {
        return C === 0 ? { kind: "all" as const } : { kind: "none" as const };
      }
      return { kind: "linear" as const, x: -C / B };
    }
    const D = B * B - 4 * A * C;
    const vertex = { x: -B / (2 * A), y: -D / (4 * A) };
    if (D > 0) {
      const sqD = Math.sqrt(D);
      return { kind: "two-real" as const, x1: (-B + sqD) / (2 * A), x2: (-B - sqD) / (2 * A), D, vertex };
    }
    if (D === 0) {
      return { kind: "one-real" as const, x: -B / (2 * A), D, vertex };
    }
    const sqD = Math.sqrt(-D);
    const re = -B / (2 * A);
    const im = sqD / (2 * A);
    return { kind: "complex" as const, re, im, D, vertex };
  }, [a, b, c]);

  const fmt = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 6 }), [locale]);

  return (
    <div>
      <div className="text-center font-mono text-2xl">
        <span className="font-mono text-base">{a}</span>
        <span className="mx-1">x²</span>
        <span className="text-base"> + </span>
        <span className="text-base">{b}</span>
        <span className="mx-1">x</span>
        <span className="text-base"> + </span>
        <span className="text-base">{c}</span>
        <span className="mx-1">= 0</span>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="text-sm font-medium">a</span>
          <input type="number" step="any" value={a} onChange={(e) => setA(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-mono text-lg tabular-nums dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">b</span>
          <input type="number" step="any" value={b} onChange={(e) => setB(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-mono text-lg tabular-nums dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">c</span>
          <input type="number" step="any" value={c} onChange={(e) => setC(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-mono text-lg tabular-nums dark:border-slate-700 dark:bg-slate-900" />
        </label>
      </div>

      <div aria-live="polite" className="mt-6 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
        {!result ? (
          <div className="text-sm text-slate-500">{t("empty")}</div>
        ) : result.kind === "all" ? (
          <div className="text-sm">{t("result.all")}</div>
        ) : result.kind === "none" ? (
          <div className="text-sm">{t("result.none")}</div>
        ) : result.kind === "linear" ? (
          <div>
            <div className="text-sm text-slate-500">{t("result.linearLabel")}</div>
            <div className="font-mono text-2xl">x = {fmt.format(result.x)}</div>
          </div>
        ) : (
          <div>
            <div className="rounded bg-emerald-50 p-3 dark:bg-emerald-900/20">
              <div className="text-xs font-medium text-emerald-900 dark:text-emerald-200">{t(`result.${result.kind.replace(/-(.)/g, (_, c) => c.toUpperCase())}`)}</div>
              {result.kind === "two-real" && (
                <div className="mt-1 grid gap-1 font-mono text-lg">
                  <div>x₁ = {fmt.format(result.x1)}</div>
                  <div>x₂ = {fmt.format(result.x2)}</div>
                </div>
              )}
              {result.kind === "one-real" && (
                <div className="mt-1 font-mono text-lg">x = {fmt.format(result.x)}</div>
              )}
              {result.kind === "complex" && (
                <div className="mt-1 font-mono text-lg">
                  x = {fmt.format(result.re)} ± {fmt.format(result.im)}i
                </div>
              )}
            </div>
            <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
              <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800"><dt>{t("result.discriminant")}</dt><dd className="tabular-nums">{fmt.format(result.D)}</dd></div>
              <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800"><dt>{t("result.vertex")}</dt><dd className="tabular-nums">({fmt.format(result.vertex.x)}, {fmt.format(result.vertex.y)})</dd></div>
            </dl>
          </div>
        )}
      </div>
    </div>
  );
}
