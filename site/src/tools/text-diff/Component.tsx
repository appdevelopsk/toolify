"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

type Op = "equal" | "add" | "remove";
interface Line {
  op: Op;
  oldNo: number | null;
  newNo: number | null;
  text: string;
}

/**
 * Patience-style line-level diff using LCS (Longest Common Subsequence).
 * Sufficient for human-readable text diffs up to a few thousand lines.
 */
function lineDiff(a: string[], b: string[]): Line[] {
  const m = a.length;
  const n = b.length;
  // dp[i][j] = LCS length of a[i..] and b[j..]
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      if (a[i] === b[j]) dp[i]![j] = dp[i + 1]![j + 1]! + 1;
      else dp[i]![j] = Math.max(dp[i + 1]![j]!, dp[i]![j + 1]!);
    }
  }
  const out: Line[] = [];
  let i = 0, j = 0, oldNo = 1, newNo = 1;
  while (i < m && j < n) {
    if (a[i] === b[j]) {
      out.push({ op: "equal", oldNo: oldNo++, newNo: newNo++, text: a[i]! });
      i++; j++;
    } else if (dp[i + 1]![j]! >= dp[i]![j + 1]!) {
      out.push({ op: "remove", oldNo: oldNo++, newNo: null, text: a[i]! });
      i++;
    } else {
      out.push({ op: "add", oldNo: null, newNo: newNo++, text: b[j]! });
      j++;
    }
  }
  while (i < m) { out.push({ op: "remove", oldNo: oldNo++, newNo: null, text: a[i++]! }); }
  while (j < n) { out.push({ op: "add", oldNo: null, newNo: newNo++, text: b[j++]! }); }
  return out;
}

export default function TextDiff() {
  const t = useTranslations("tools.text-diff");
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");

  const diff = useMemo(() => {
    if (!left && !right) return null;
    return lineDiff(left.split("\n"), right.split("\n"));
  }, [left, right]);

  const stats = useMemo(() => {
    if (!diff) return null;
    let added = 0, removed = 0, unchanged = 0;
    for (const line of diff) {
      if (line.op === "add") added++;
      else if (line.op === "remove") removed++;
      else unchanged++;
    }
    return { added, removed, unchanged };
  }, [diff]);

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">{t("input.left")}</span>
          <textarea value={left} onChange={(e) => setLeft(e.target.value)} rows={8} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-mono text-sm dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.right")}</span>
          <textarea value={right} onChange={(e) => setRight(e.target.value)} rows={8} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-mono text-sm dark:border-slate-700 dark:bg-slate-900" />
        </label>
      </div>

      {stats && (
        <div className="mt-3 flex flex-wrap gap-3 text-xs">
          <span className="rounded bg-emerald-100 px-2 py-1 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">+{stats.added} {t("stats.added")}</span>
          <span className="rounded bg-red-100 px-2 py-1 text-red-800 dark:bg-red-900/40 dark:text-red-200">−{stats.removed} {t("stats.removed")}</span>
          <span className="rounded bg-slate-100 px-2 py-1 text-slate-700 dark:bg-slate-800 dark:text-slate-300">={stats.unchanged} {t("stats.unchanged")}</span>
        </div>
      )}

      <div aria-live="polite" className="mt-4">
        {diff ? (
          <pre className="overflow-x-auto rounded border border-slate-200 bg-slate-50 text-sm dark:border-slate-800 dark:bg-slate-950">
            <table className="w-full font-mono">
              <tbody>
                {diff.map((line, i) => (
                  <tr key={i} className={
                    line.op === "add" ? "bg-emerald-50 dark:bg-emerald-900/20" :
                    line.op === "remove" ? "bg-red-50 dark:bg-red-900/20" : ""
                  }>
                    <td className="select-none border-r border-slate-200 px-2 text-right text-slate-400 tabular-nums dark:border-slate-800">{line.oldNo ?? ""}</td>
                    <td className="select-none border-r border-slate-200 px-2 text-right text-slate-400 tabular-nums dark:border-slate-800">{line.newNo ?? ""}</td>
                    <td className="select-none px-2 text-slate-600 dark:text-slate-400">
                      {line.op === "add" ? "+" : line.op === "remove" ? "−" : " "}
                    </td>
                    <td className="px-2 whitespace-pre-wrap break-all">{line.text || " "}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </pre>
        ) : (
          <div className="rounded-lg border border-slate-200 p-4 text-sm text-slate-600 dark:text-slate-400 dark:border-slate-800">{t("empty")}</div>
        )}
      </div>
    </div>
  );
}
