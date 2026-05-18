"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

type Mode = "nth" | "sequence";

const NTH_MAX = 100;
const SEQ_MAX = 50;

function fibNth(n: number): bigint {
  if (n <= 0) return 0n;
  if (n === 1) return 1n;
  let a = 0n;
  let b = 1n;
  for (let i = 2; i <= n; i++) {
    const c = a + b;
    a = b;
    b = c;
  }
  return b;
}

function fibSequence(n: number): bigint[] {
  if (n <= 0) return [];
  const seq: bigint[] = [0n];
  if (n === 1) return seq;
  seq.push(1n);
  for (let i = 2; i < n; i++) {
    seq.push((seq[i - 1] as bigint) + (seq[i - 2] as bigint));
  }
  return seq;
}

export default function FibonacciCalculator() {
  const t = useTranslations("tools.fibonacci-calculator");
  const [mode, setMode] = useState<Mode>("nth");
  const [n, setN] = useState("");

  const maxN = mode === "nth" ? NTH_MAX : SEQ_MAX;

  const result = useMemo(() => {
    const num = parseInt(n, 10);
    if (!n || isNaN(num) || num < 1) return null;
    const capped = Math.min(num, maxN);
    if (mode === "nth") {
      return { type: "nth" as const, n: capped, value: fibNth(capped).toString() };
    } else {
      const seq = fibSequence(capped);
      return { type: "sequence" as const, n: capped, values: seq.map((v) => v.toString()) };
    }
  }, [n, mode, maxN]);

  return (
    <div>
      <div className="mb-4 inline-flex rounded-md border border-slate-300 dark:border-slate-700">
        <button
          onClick={() => setMode("nth")}
          className={`px-4 py-2 text-sm rounded-l-md ${
            mode === "nth"
              ? "bg-brand-600 text-white"
              : "hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          {t("input.nthLabel")}
        </button>
        <button
          onClick={() => setMode("sequence")}
          className={`px-4 py-2 text-sm rounded-r-md ${
            mode === "sequence"
              ? "bg-brand-600 text-white"
              : "hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          {t("input.sequenceLabel")}
        </button>
      </div>

      <label className="block">
        <span className="text-sm font-medium">
          {mode === "nth"
            ? t("input.n", { max: NTH_MAX })
            : t("input.n", { max: SEQ_MAX })}
        </span>
        <input
          type="number"
          min={1}
          max={maxN}
          value={n}
          onChange={(e) => setN(e.target.value)}
          placeholder={mode === "nth" ? "e.g. 10" : "e.g. 15"}
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
        />
      </label>

      <div
        aria-live="polite"
        className={`mt-6 rounded-lg border p-4 ${
          result
            ? "border-brand-200 bg-brand-50 dark:border-brand-900 dark:bg-brand-900/20"
            : "border-slate-200 dark:border-slate-800"
        }`}
      >
        {result ? (
          result.type === "nth" ? (
            <dl className="grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  {t("result.term", { n: result.n })}
                </dt>
                <dd className="mt-1 break-all font-mono text-xl font-bold tabular-nums">
                  {result.value}
                </dd>
              </div>
            </dl>
          ) : (
            <div>
              <p className="mb-2 text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">
                {t("result.sequence", { n: result.n })}
              </p>
              <p className="break-all font-mono text-sm leading-relaxed">
                {result.values.join(", ")}
              </p>
            </div>
          )
        ) : (
          <p className="text-sm text-slate-600 dark:text-slate-400">{t("empty")}</p>
        )}
      </div>
    </div>
  );
}
