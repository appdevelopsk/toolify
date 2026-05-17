"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

interface FieldSpec {
  min: number;
  max: number;
  name: string;
}
const FIELDS: FieldSpec[] = [
  { name: "minute", min: 0, max: 59 },
  { name: "hour", min: 0, max: 23 },
  { name: "dayOfMonth", min: 1, max: 31 },
  { name: "month", min: 1, max: 12 },
  { name: "dayOfWeek", min: 0, max: 6 },
];

function parseField(expr: string, spec: FieldSpec): Set<number> | string {
  if (expr === "*" || expr === "?") {
    const all = new Set<number>();
    for (let i = spec.min; i <= spec.max; i++) all.add(i);
    return all;
  }
  const out = new Set<number>();
  const parts = expr.split(",");
  for (const part of parts) {
    let stepSpec = part;
    let step = 1;
    if (part.includes("/")) {
      const [base, st] = part.split("/");
      stepSpec = base!;
      step = parseInt(st!, 10);
      if (!isFinite(step) || step <= 0) return `invalid step: /${st}`;
    }
    let from: number, to: number;
    if (stepSpec === "*" || stepSpec === "?") {
      from = spec.min;
      to = spec.max;
    } else if (stepSpec.includes("-")) {
      const [a, b] = stepSpec.split("-").map((s) => parseInt(s, 10));
      if (!isFinite(a!) || !isFinite(b!)) return `invalid range: ${stepSpec}`;
      from = a!;
      to = b!;
    } else {
      const v = parseInt(stepSpec, 10);
      if (!isFinite(v)) return `invalid value: ${stepSpec}`;
      from = v;
      to = v;
    }
    if (from < spec.min || to > spec.max || from > to) return `out of range [${spec.min}-${spec.max}]: ${stepSpec}`;
    for (let i = from; i <= to; i += step) out.add(i);
  }
  return out;
}

function nextNRuns(fields: Set<number>[], n: number, from = new Date()): Date[] {
  const [mins, hours, doms, months, dows] = fields as [Set<number>, Set<number>, Set<number>, Set<number>, Set<number>];
  const out: Date[] = [];
  const cursor = new Date(from);
  cursor.setSeconds(0, 0);
  cursor.setMinutes(cursor.getMinutes() + 1);
  let safety = 0;
  while (out.length < n && safety < 525600 * 4) {
    safety++;
    if (
      mins!.has(cursor.getMinutes()) &&
      hours!.has(cursor.getHours()) &&
      doms!.has(cursor.getDate()) &&
      months!.has(cursor.getMonth() + 1) &&
      dows!.has(cursor.getDay())
    ) {
      out.push(new Date(cursor));
    }
    cursor.setMinutes(cursor.getMinutes() + 1);
  }
  return out;
}

export default function CronExpressionTester() {
  const t = useTranslations("tools.cron-expression-tester");
  const locale = useLocale();
  const [expr, setExpr] = useState("0 9 * * 1-5");

  const result = useMemo(() => {
    const tokens = expr.trim().split(/\s+/);
    if (tokens.length !== 5) return { error: t("error.fieldCount") };
    const sets: Set<number>[] = [];
    for (let i = 0; i < 5; i++) {
      const parsed = parseField(tokens[i]!, FIELDS[i]!);
      if (typeof parsed === "string") return { error: `${FIELDS[i]!.name}: ${parsed}` };
      sets.push(parsed);
    }
    try {
      const next = nextNRuns(sets, 5);
      return { next, sets };
    } catch (e) {
      return { error: e instanceof Error ? e.message : String(e) };
    }
  }, [expr, t]);

  const dateFmt = useMemo(() => new Intl.DateTimeFormat(locale, { dateStyle: "full", timeStyle: "short" }), [locale]);

  return (
    <div>
      <label className="block">
        <span className="text-sm font-medium">{t("input.expr")}</span>
        <input value={expr} onChange={(e) => setExpr(e.target.value)} placeholder="0 9 * * 1-5" className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-mono text-base dark:border-slate-700 dark:bg-slate-900" />
        <span className="mt-1 block text-xs text-slate-600 dark:text-slate-400">{t("input.format")}: <code className="font-mono">分 時 日 月 曜日</code></span>
      </label>

      <div className="mt-3 flex flex-wrap gap-1 text-xs">
        {[
          { label: "every minute", expr: "* * * * *" },
          { label: "hourly", expr: "0 * * * *" },
          { label: "daily 00:00", expr: "0 0 * * *" },
          { label: "weekdays 9am", expr: "0 9 * * 1-5" },
          { label: "every 15min", expr: "*/15 * * * *" },
          { label: "monthly 1st", expr: "0 0 1 * *" },
        ].map((p) => (
          <button key={p.expr} onClick={() => setExpr(p.expr)} className="rounded border border-slate-300 px-2 py-1 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800">
            <code className="font-mono">{p.expr}</code>
            <span className="ml-1 text-slate-600 dark:text-slate-400">— {p.label}</span>
          </button>
        ))}
      </div>

      <div aria-live="polite" className="mt-6">
        {"error" in result && result.error ? (
          <div className="rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
            {t("error.label")}: {result.error}
          </div>
        ) : "next" in result && result.next ? (
          <div className="rounded-lg border border-brand-200 bg-brand-50 p-4 dark:border-brand-900 dark:bg-brand-900/20">
            <div className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">{t("result.next5")}</div>
            <ol className="mt-2 space-y-1">
              {result.next.map((d, i) => (
                <li key={i} className="font-mono text-sm tabular-nums">
                  <span className="mr-2 text-slate-600 dark:text-slate-400">{i + 1}.</span>
                  {dateFmt.format(d)}
                </li>
              ))}
            </ol>
          </div>
        ) : null}
      </div>
    </div>
  );
}
