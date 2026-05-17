"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

function decimalToScientific(s: string): { coef: string; exp: number; sign: string } | null {
  const trimmed = s.trim();
  if (!/^-?\d*\.?\d+(e-?\d+)?$/i.test(trimmed)) return null;
  const num = parseFloat(trimmed);
  if (!isFinite(num) || num === 0) {
    if (num === 0) return { coef: "0", exp: 0, sign: "" };
    return null;
  }
  const sign = num < 0 ? "-" : "";
  const abs = Math.abs(num);
  const exp = Math.floor(Math.log10(abs));
  const coef = abs / Math.pow(10, exp);
  return { coef: coef.toString(), exp, sign };
}

function scientificToDecimal(coef: string, exp: number): string {
  const num = parseFloat(coef) * Math.pow(10, exp);
  if (!isFinite(num)) return "Infinity";
  return num.toString();
}

export default function ScientificNotationConverter() {
  const t = useTranslations("tools.scientific-notation-converter");
  const locale = useLocale();
  const [decimal, setDecimal] = useState("0.0000123");
  const [coef, setCoef] = useState("1.23");
  const [exp, setExp] = useState("-5");
  const [direction, setDirection] = useState<"toSci" | "toDec">("toSci");

  const toSciResult = useMemo(() => decimalToScientific(decimal), [decimal]);
  const toDecResult = useMemo(() => {
    const e = parseInt(exp, 10);
    if (!isFinite(parseFloat(coef)) || !isFinite(e)) return null;
    return scientificToDecimal(coef, e);
  }, [coef, exp]);

  const fmt = useMemo(() => new Intl.NumberFormat(locale), [locale]);

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2">
        <button onClick={() => setDirection("toSci")} className={`rounded px-3 py-1 text-sm ${direction === "toSci" ? "bg-brand-600 text-white" : "border border-slate-300 dark:border-slate-700"}`}>{t("dir.toSci")}</button>
        <button onClick={() => setDirection("toDec")} className={`rounded px-3 py-1 text-sm ${direction === "toDec" ? "bg-brand-600 text-white" : "border border-slate-300 dark:border-slate-700"}`}>{t("dir.toDec")}</button>
      </div>

      {direction === "toSci" ? (
        <div>
          <label className="block">
            <span className="text-sm font-medium">{t("input.decimal")}</span>
            <input value={decimal} onChange={(e) => setDecimal(e.target.value)} placeholder="0.0000123" className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-mono text-lg dark:border-slate-700 dark:bg-slate-900" />
          </label>
          <div className="mt-3 flex flex-wrap gap-2">
            {["123456789", "0.0000005", "299792458", "6.022e23", "1.6e-19"].map((v) => (
              <button key={v} onClick={() => setDecimal(v)} className="rounded border border-slate-300 px-3 py-1 text-xs font-mono hover:border-brand-500 dark:border-slate-700">{v}</button>
            ))}
          </div>
          <div aria-live="polite" className="mt-6 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
            {toSciResult ? (
              <div>
                <div className="rounded bg-emerald-50 p-3 dark:bg-emerald-900/20">
                  <div className="text-xs font-medium">{t("result.scientific")}</div>
                  <div className="mt-1 font-mono text-2xl font-bold">
                    {toSciResult.sign}{toSciResult.coef} × 10<sup>{toSciResult.exp}</sup>
                  </div>
                </div>
                <div className="mt-3 grid gap-2 text-sm">
                  <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800">
                    <dt>{t("result.eNotation")}</dt>
                    <dd className="font-mono tabular-nums">{toSciResult.sign}{toSciResult.coef}e{toSciResult.exp}</dd>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800">
                    <dt>{t("result.engineering")}</dt>
                    <dd className="font-mono tabular-nums">
                      {(() => {
                        const engExp = Math.floor(toSciResult.exp / 3) * 3;
                        const engCoef = parseFloat(toSciResult.coef) * Math.pow(10, toSciResult.exp - engExp);
                        return `${toSciResult.sign}${fmt.format(engCoef)}e${engExp}`;
                      })()}
                    </dd>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-slate-600 dark:text-slate-400">{t("empty")}</div>
            )}
          </div>
        </div>
      ) : (
        <div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium">{t("input.coefficient")}</span>
              <input value={coef} onChange={(e) => setCoef(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-mono tabular-nums dark:border-slate-700 dark:bg-slate-900" />
            </label>
            <label className="block">
              <span className="text-sm font-medium">{t("input.exponent")}</span>
              <input value={exp} onChange={(e) => setExp(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-mono tabular-nums dark:border-slate-700 dark:bg-slate-900" />
            </label>
          </div>
          <div aria-live="polite" className="mt-6 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
            {toDecResult ? (
              <div>
                <div className="rounded bg-emerald-50 p-3 dark:bg-emerald-900/20">
                  <div className="text-xs font-medium">{t("result.decimal")}</div>
                  <div className="mt-1 break-all font-mono text-2xl font-bold tabular-nums">{toDecResult}</div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-slate-600 dark:text-slate-400">{t("empty")}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
