"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

type Mode = "right" | "sss" | "sas";

export default function TriangleCalculator() {
  const t = useTranslations("tools.triangle-calculator");
  const locale = useLocale();
  const [mode, setMode] = useState<Mode>("right");
  const [a, setA] = useState("3");
  const [b, setB] = useState("4");
  const [c, setC] = useState("5");
  const [angleC, setAngleC] = useState("60");

  const result = useMemo(() => {
    const A = parseFloat(a);
    const B = parseFloat(b);
    const C = parseFloat(c);
    const aC = parseFloat(angleC) * (Math.PI / 180);
    if (mode === "right") {
      // a, b are legs; c is hypotenuse
      if (![A, B].every((x) => isFinite(x) && x > 0)) return null;
      const hypot = Math.sqrt(A * A + B * B);
      const area = (A * B) / 2;
      const perim = A + B + hypot;
      const angleA = Math.atan(A / B) * (180 / Math.PI);
      const angleB = Math.atan(B / A) * (180 / Math.PI);
      return { sides: { a: A, b: B, c: hypot }, angles: { a: angleA, b: angleB, c: 90 }, area, perim };
    }
    if (mode === "sss") {
      // three sides
      if (![A, B, C].every((x) => isFinite(x) && x > 0)) return null;
      // Triangle inequality
      if (A + B <= C || A + C <= B || B + C <= A) return { invalid: true as const };
      const angleA = Math.acos((B * B + C * C - A * A) / (2 * B * C)) * (180 / Math.PI);
      const angleB = Math.acos((A * A + C * C - B * B) / (2 * A * C)) * (180 / Math.PI);
      const angleC2 = 180 - angleA - angleB;
      const s = (A + B + C) / 2;
      const area = Math.sqrt(s * (s - A) * (s - B) * (s - C));
      return { sides: { a: A, b: B, c: C }, angles: { a: angleA, b: angleB, c: angleC2 }, area, perim: A + B + C };
    }
    // sas
    if (![A, B].every((x) => isFinite(x) && x > 0) || !isFinite(aC) || aC <= 0 || aC >= Math.PI) return null;
    const cSide = Math.sqrt(A * A + B * B - 2 * A * B * Math.cos(aC));
    const angleC2 = parseFloat(angleC);
    const angleA = (Math.asin((A * Math.sin(aC)) / cSide) * 180) / Math.PI;
    const angleB = 180 - angleC2 - angleA;
    const area = 0.5 * A * B * Math.sin(aC);
    return { sides: { a: A, b: B, c: cSide }, angles: { a: angleA, b: angleB, c: angleC2 }, area, perim: A + B + cSide };
  }, [mode, a, b, c, angleC]);

  const fmt = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 4 }), [locale]);

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2">
        {(["right", "sss", "sas"] as Mode[]).map((m) => (
          <button key={m} onClick={() => setMode(m)} className={`rounded px-3 py-1 text-sm ${mode === m ? "bg-brand-600 text-white" : "border border-slate-300 dark:border-slate-700"}`}>
            {t(`mode.${m}`)}
          </button>
        ))}
      </div>

      {mode === "right" && (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium">{t("input.legA")}</span>
            <input type="number" step="any" value={a} onChange={(e) => setA(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 tabular-nums dark:border-slate-700 dark:bg-slate-900" />
          </label>
          <label className="block">
            <span className="text-sm font-medium">{t("input.legB")}</span>
            <input type="number" step="any" value={b} onChange={(e) => setB(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 tabular-nums dark:border-slate-700 dark:bg-slate-900" />
          </label>
        </div>
      )}

      {mode === "sss" && (
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="block">
            <span className="text-sm font-medium">{t("input.sideA")}</span>
            <input type="number" step="any" value={a} onChange={(e) => setA(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 tabular-nums dark:border-slate-700 dark:bg-slate-900" />
          </label>
          <label className="block">
            <span className="text-sm font-medium">{t("input.sideB")}</span>
            <input type="number" step="any" value={b} onChange={(e) => setB(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 tabular-nums dark:border-slate-700 dark:bg-slate-900" />
          </label>
          <label className="block">
            <span className="text-sm font-medium">{t("input.sideC")}</span>
            <input type="number" step="any" value={c} onChange={(e) => setC(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 tabular-nums dark:border-slate-700 dark:bg-slate-900" />
          </label>
        </div>
      )}

      {mode === "sas" && (
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="block">
            <span className="text-sm font-medium">{t("input.sideA")}</span>
            <input type="number" step="any" value={a} onChange={(e) => setA(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 tabular-nums dark:border-slate-700 dark:bg-slate-900" />
          </label>
          <label className="block">
            <span className="text-sm font-medium">{t("input.sideB")}</span>
            <input type="number" step="any" value={b} onChange={(e) => setB(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 tabular-nums dark:border-slate-700 dark:bg-slate-900" />
          </label>
          <label className="block">
            <span className="text-sm font-medium">{t("input.angleC")}</span>
            <input type="number" step="any" value={angleC} onChange={(e) => setAngleC(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 tabular-nums dark:border-slate-700 dark:bg-slate-900" />
          </label>
        </div>
      )}

      <div aria-live="polite" className="mt-6 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
        {!result ? (
          <div className="text-sm text-slate-600 dark:text-slate-400">{t("empty")}</div>
        ) : "invalid" in result ? (
          <div className="text-sm text-rose-500">{t("invalid")}</div>
        ) : (
          <div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded bg-emerald-50 p-3 dark:bg-emerald-900/20">
                <div className="text-xs font-medium">{t("result.area")}</div>
                <div className="tabular-nums text-2xl font-bold">{fmt.format(result.area)}</div>
              </div>
              <div className="rounded bg-slate-100 p-3 dark:bg-slate-800">
                <div className="text-xs font-medium">{t("result.perim")}</div>
                <div className="tabular-nums text-2xl font-bold">{fmt.format(result.perim)}</div>
              </div>
            </div>
            <h3 className="mt-4 text-sm font-medium">{t("result.sides")}</h3>
            <dl className="mt-2 grid gap-1 text-sm sm:grid-cols-3">
              <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800"><dt>a</dt><dd className="tabular-nums">{fmt.format(result.sides.a)}</dd></div>
              <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800"><dt>b</dt><dd className="tabular-nums">{fmt.format(result.sides.b)}</dd></div>
              <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800"><dt>c</dt><dd className="tabular-nums">{fmt.format(result.sides.c)}</dd></div>
            </dl>
            <h3 className="mt-3 text-sm font-medium">{t("result.angles")}</h3>
            <dl className="mt-2 grid gap-1 text-sm sm:grid-cols-3">
              <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800"><dt>A</dt><dd className="tabular-nums">{fmt.format(result.angles.a)}°</dd></div>
              <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800"><dt>B</dt><dd className="tabular-nums">{fmt.format(result.angles.b)}°</dd></div>
              <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800"><dt>C</dt><dd className="tabular-nums">{fmt.format(result.angles.c)}°</dd></div>
            </dl>
          </div>
        )}
      </div>
    </div>
  );
}
