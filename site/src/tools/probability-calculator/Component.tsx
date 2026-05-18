"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

type Tab = "basic" | "permutation" | "combination" | "dice";

const MAX_N = 170;

/** factorial using floating-point (accurate for n <= 170) */
function factorial(n: number): number {
  if (n < 0) return NaN;
  if (n === 0 || n === 1) return 1;
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b !== 0) {
    [a, b] = [b, a % b];
  }
  return a;
}

/** Count ways to get exactly `target` from `numDice` dice each with `sides` faces (1..sides) */
function countDiceWays(numDice: number, sides: number, target: number): number {
  // dp[i] = number of ways to get sum i with current dice
  let dp: number[] = new Array(numDice * sides + 1).fill(0);
  dp[0] = 1;
  for (let d = 0; d < numDice; d++) {
    const next: number[] = new Array(dp.length).fill(0);
    for (let s = 1; s <= sides; s++) {
      for (let j = s; j < dp.length; j++) {
        next[j] = (next[j] ?? 0) + (dp[j - s] ?? 0);
      }
    }
    dp = next;
  }
  return dp[target] ?? 0;
}

interface BasicResult {
  kind: "basic";
  favorable: number;
  total: number;
  probNum: number;
  probDen: number;
  decimal: number;
  percent: number;
  oddsFor: string;
  oddsAgainst: string;
}

interface PermResult {
  kind: "perm";
  n: number;
  r: number;
  value: number;
}

interface CombResult {
  kind: "comb";
  n: number;
  r: number;
  value: number;
}

interface DiceResult {
  kind: "dice";
  ways: number;
  total: number;
  probNum: number;
  probDen: number;
  decimal: number;
  percent: number;
}

type CalcResult = BasicResult | PermResult | CombResult | DiceResult;

type ErrorKey = "invalid" | "overflow" | "noOutcomes" | "favorableExceedsTotal" | "diceRange";

export default function ProbabilityCalculator() {
  const t = useTranslations("tools.probability-calculator");
  const locale = useLocale();
  const [tab, setTab] = useState<Tab>("basic");

  // Basic probability
  const [favorable, setFavorable] = useState("3");
  const [total, setTotal] = useState("6");

  // Permutations / Combinations
  const [n, setN] = useState("10");
  const [r, setR] = useState("3");

  // Dice
  const [numDice, setNumDice] = useState("2");
  const [target, setTarget] = useState("7");
  const [sides, setSides] = useState("6");

  const fmt = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 8 }), [locale]);
  const pctFmt = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 4 }), [locale]);

  const computedResult = useMemo<CalcResult | ErrorKey | null>(() => {
    if (tab === "basic") {
      const f = parseInt(favorable, 10);
      const tot = parseInt(total, 10);
      if (!Number.isInteger(f) || !Number.isInteger(tot) || f < 0 || tot < 0) return "invalid";
      if (tot === 0) return "noOutcomes";
      if (f > tot) return "favorableExceedsTotal";
      const g = gcd(f, tot);
      const pn = f / g;
      const pd = tot / g;
      const dec = f / tot;
      const pct = dec * 100;
      const unfav = tot - f;
      const oddsG = gcd(f, unfav);
      const oddsFor = unfav === 0 ? "always" : `${f / oddsG}:${unfav / oddsG}`;
      const oddsAgainst = f === 0 ? "never" : `${unfav / oddsG}:${f / oddsG}`;
      return { kind: "basic", favorable: f, total: tot, probNum: pn, probDen: pd, decimal: dec, percent: pct, oddsFor, oddsAgainst };
    }

    if (tab === "permutation" || tab === "combination") {
      const nv = parseInt(n, 10);
      const rv = parseInt(r, 10);
      if (!Number.isInteger(nv) || !Number.isInteger(rv) || nv < 0 || rv < 0) return "invalid";
      if (rv > nv) return "invalid";
      if (nv > MAX_N) return "overflow";
      const fn = factorial(nv);
      const fnr = factorial(nv - rv);
      if (!isFinite(fn) || !isFinite(fnr)) return "overflow";
      if (tab === "permutation") {
        const value = fn / fnr;
        return { kind: "perm", n: nv, r: rv, value };
      } else {
        const fr = factorial(rv);
        const value = fn / (fr * fnr);
        return { kind: "comb", n: nv, r: rv, value };
      }
    }

    if (tab === "dice") {
      const nd = parseInt(numDice, 10);
      const tgt = parseInt(target, 10);
      const s = parseInt(sides, 10);
      if (!Number.isInteger(nd) || !Number.isInteger(tgt) || !Number.isInteger(s)) return "invalid";
      if (nd < 1 || nd > 6 || s < 2) return "invalid";
      const minSum = nd;
      const maxSum = nd * s;
      if (tgt < minSum || tgt > maxSum) return "diceRange";
      const ways = countDiceWays(nd, s, tgt);
      const tot = Math.pow(s, nd);
      const g = gcd(ways, tot);
      const pn = ways / g;
      const pd = tot / g;
      return { kind: "dice", ways, total: tot, probNum: pn, probDen: pd, decimal: ways / tot, percent: (ways / tot) * 100 };
    }

    return null;
  }, [tab, favorable, total, n, r, numDice, target, sides]);

  const tabs: Tab[] = ["basic", "permutation", "combination", "dice"];

  const isError = (v: CalcResult | ErrorKey | null): v is ErrorKey =>
    typeof v === "string";

  return (
    <div>
      {/* Tab bar */}
      <div className="mb-4 flex flex-wrap gap-2">
        {tabs.map((tb) => (
          <button
            key={tb}
            type="button"
            onClick={() => setTab(tb)}
            className={`rounded px-3 py-1 text-sm ${
              tab === tb
                ? "bg-brand-600 text-white"
                : "border border-slate-300 dark:border-slate-700"
            }`}
          >
            {t(`tab.${tb}`)}
          </button>
        ))}
      </div>

      {/* Basic probability inputs */}
      {tab === "basic" && (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium">{t("input.favorable")}</span>
            <input
              type="number"
              min="0"
              step="1"
              value={favorable}
              onChange={(e) => setFavorable(e.target.value)}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 tabular-nums dark:border-slate-700 dark:bg-slate-900"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">{t("input.total")}</span>
            <input
              type="number"
              min="1"
              step="1"
              value={total}
              onChange={(e) => setTotal(e.target.value)}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 tabular-nums dark:border-slate-700 dark:bg-slate-900"
            />
          </label>
        </div>
      )}

      {/* Permutations / Combinations inputs */}
      {(tab === "permutation" || tab === "combination") && (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium">{t("input.n")}</span>
            <input
              type="number"
              min="0"
              max={MAX_N}
              step="1"
              value={n}
              onChange={(e) => setN(e.target.value)}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 tabular-nums dark:border-slate-700 dark:bg-slate-900"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">{t("input.r")}</span>
            <input
              type="number"
              min="0"
              step="1"
              value={r}
              onChange={(e) => setR(e.target.value)}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 tabular-nums dark:border-slate-700 dark:bg-slate-900"
            />
          </label>
        </div>
      )}

      {/* Dice inputs */}
      {tab === "dice" && (
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="block">
            <span className="text-sm font-medium">{t("input.numDice")}</span>
            <input
              type="number"
              min="1"
              max="6"
              step="1"
              value={numDice}
              onChange={(e) => setNumDice(e.target.value)}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 tabular-nums dark:border-slate-700 dark:bg-slate-900"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">{t("input.target")}</span>
            <input
              type="number"
              min="1"
              step="1"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 tabular-nums dark:border-slate-700 dark:bg-slate-900"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">{t("input.sides")}</span>
            <select
              value={sides}
              onChange={(e) => setSides(e.target.value)}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
            >
              {[4, 6, 8, 10, 12, 20].map((s) => (
                <option key={s} value={s}>
                  d{s}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      {/* Results */}
      <div aria-live="polite" className="mt-6 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
        {computedResult === null ? (
          <div className="text-sm text-slate-600 dark:text-slate-400">{t("empty")}</div>
        ) : isError(computedResult) ? (
          <div className="text-sm text-rose-500">{t(`error.${computedResult}`)}</div>
        ) : computedResult.kind === "basic" || computedResult.kind === "dice" ? (
          <div>
            <div className="rounded bg-emerald-50 p-3 text-center dark:bg-emerald-900/20">
              <div className="text-xs font-medium text-emerald-900 dark:text-emerald-200">
                {t("result.probability")}
              </div>
              <div className="font-mono text-3xl font-bold tabular-nums">
                {pctFmt.format(computedResult.percent)}%
              </div>
            </div>
            <dl className="mt-3 grid gap-1 text-sm">
              <div className="flex justify-between border-b border-slate-200 py-1.5 dark:border-slate-800">
                <dt>{t("result.fraction")}</dt>
                <dd className="tabular-nums font-mono">
                  {computedResult.probNum}/{computedResult.probDen}
                </dd>
              </div>
              <div className="flex justify-between border-b border-slate-200 py-1.5 dark:border-slate-800">
                <dt>{t("result.decimal")}</dt>
                <dd className="tabular-nums font-mono">{fmt.format(computedResult.decimal)}</dd>
              </div>
              {computedResult.kind === "basic" && (
                <>
                  <div className="flex justify-between border-b border-slate-200 py-1.5 dark:border-slate-800">
                    <dt>{t("result.oddsFor")}</dt>
                    <dd className="tabular-nums font-mono">{computedResult.oddsFor}</dd>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 py-1.5 dark:border-slate-800">
                    <dt>{t("result.oddsAgainst")}</dt>
                    <dd className="tabular-nums font-mono">{computedResult.oddsAgainst}</dd>
                  </div>
                </>
              )}
            </dl>
          </div>
        ) : (
          <div>
            <div className="rounded bg-emerald-50 p-3 text-center dark:bg-emerald-900/20">
              <div className="text-xs font-medium text-emerald-900 dark:text-emerald-200">
                {t(computedResult.kind === "perm" ? "result.permutations" : "result.combinations")}
              </div>
              <div className="font-mono text-3xl font-bold tabular-nums">
                {fmt.format(computedResult.value)}
              </div>
            </div>
            <p className="mt-3 text-center font-mono text-sm text-slate-600 dark:text-slate-400">
              {computedResult.kind === "perm" ? "nPr" : "nCr"} ({computedResult.n}, {computedResult.r})
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
