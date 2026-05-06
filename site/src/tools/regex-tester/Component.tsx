"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

interface MatchInfo {
  match: string;
  index: number;
  groups: string[];
  named: Record<string, string>;
}

function compile(pattern: string, flags: string): { ok: true; re: RegExp } | { ok: false; error: string } {
  try {
    return { ok: true, re: new RegExp(pattern, flags) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

function findAll(text: string, re: RegExp): MatchInfo[] {
  const out: MatchInfo[] = [];
  if (!re.global) {
    const m = text.match(re);
    if (m) out.push({ match: m[0]!, index: m.index ?? 0, groups: m.slice(1).filter((g): g is string => g !== undefined), named: m.groups ?? {} });
    return out;
  }
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    out.push({ match: m[0], index: m.index, groups: m.slice(1).filter((g): g is string => g !== undefined), named: m.groups ?? {} });
    if (m[0].length === 0) re.lastIndex++;
  }
  return out;
}

function highlight(text: string, matches: MatchInfo[]): React.ReactNode[] {
  if (matches.length === 0) return [text];
  const out: React.ReactNode[] = [];
  let cursor = 0;
  matches.forEach((m, i) => {
    if (m.index > cursor) out.push(text.slice(cursor, m.index));
    out.push(
      <mark key={i} className="rounded bg-yellow-200 px-0.5 dark:bg-yellow-700/60">
        {text.slice(m.index, m.index + m.match.length)}
      </mark>
    );
    cursor = m.index + m.match.length;
  });
  if (cursor < text.length) out.push(text.slice(cursor));
  return out;
}

export default function RegexTester() {
  const t = useTranslations("tools.regex-tester");
  const [pattern, setPattern] = useState("\\b[A-Z]\\w+");
  const [flags, setFlags] = useState("g");
  const [test, setTest] = useState("Hello World, this is a Regex Tester.");
  const [replace, setReplace] = useState("");
  const [showReplace, setShowReplace] = useState(false);

  const compiled = useMemo(() => compile(pattern, flags), [pattern, flags]);
  const matches = useMemo(() => (compiled.ok ? findAll(test, compiled.re) : []), [compiled, test]);
  const replaced = useMemo(() => {
    if (!compiled.ok || !showReplace) return null;
    try {
      return test.replace(compiled.re, replace);
    } catch (e) {
      return e instanceof Error ? e.message : String(e);
    }
  }, [compiled, test, replace, showReplace]);

  function toggleFlag(f: string) {
    setFlags((cur) => (cur.includes(f) ? cur.replace(f, "") : cur + f));
  }

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <label className="block">
          <span className="text-sm font-medium">{t("input.pattern")}</span>
          <div className="mt-1 flex items-stretch rounded border border-slate-300 dark:border-slate-700">
            <span className="flex items-center px-2 font-mono text-slate-400">/</span>
            <input value={pattern} onChange={(e) => setPattern(e.target.value)} className="flex-1 bg-transparent px-1 py-2 font-mono text-sm focus:outline-none" />
            <span className="flex items-center px-2 font-mono text-slate-400">/{flags}</span>
          </div>
        </label>
        <div>
          <span className="text-sm font-medium">{t("input.flags")}</span>
          <div className="mt-1 flex flex-wrap gap-1">
            {["g", "i", "m", "s", "u"].map((f) => (
              <button key={f} onClick={() => toggleFlag(f)} className={`rounded border px-2 py-1 font-mono text-xs ${flags.includes(f) ? "border-brand-500 bg-brand-50 dark:bg-brand-900/40" : "border-slate-300 dark:border-slate-700"}`}>
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {!compiled.ok && (
        <div className="mt-2 rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
          {t("error.invalid")}: {compiled.error}
        </div>
      )}

      <label className="mt-4 block">
        <span className="text-sm font-medium">{t("input.test")}</span>
        <textarea value={test} onChange={(e) => setTest(e.target.value)} rows={5} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-mono text-sm dark:border-slate-700 dark:bg-slate-900" />
      </label>

      <label className="mt-3 flex items-center gap-2 text-sm">
        <input type="checkbox" checked={showReplace} onChange={(e) => setShowReplace(e.target.checked)} />
        {t("input.replaceMode")}
      </label>

      {showReplace && (
        <label className="mt-2 block">
          <span className="text-sm font-medium">{t("input.replace")}</span>
          <input value={replace} onChange={(e) => setReplace(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-mono text-sm dark:border-slate-700 dark:bg-slate-900" placeholder="$&" />
          <span className="mt-1 block text-xs text-slate-500">{t("hint.replaceVars")}</span>
        </label>
      )}

      <div aria-live="polite" className="mt-6 space-y-3">
        {compiled.ok && (
          <>
            <div className="text-xs uppercase tracking-wider text-slate-500">{t("result.matches")} ({matches.length})</div>
            <div className="rounded border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-sm leading-relaxed whitespace-pre-wrap dark:border-slate-800 dark:bg-slate-950">
              {highlight(test, matches)}
            </div>
            {showReplace && replaced !== null && (
              <>
                <div className="text-xs uppercase tracking-wider text-slate-500">{t("result.replaced")}</div>
                <div className="rounded border border-emerald-200 bg-emerald-50 px-3 py-2 font-mono text-sm leading-relaxed whitespace-pre-wrap dark:border-emerald-800 dark:bg-emerald-900/20">
                  {replaced}
                </div>
              </>
            )}
            {matches.length > 0 && matches.some((m) => m.groups.length > 0 || Object.keys(m.named).length > 0) && (
              <details className="rounded border border-slate-200 px-3 py-2 text-sm dark:border-slate-800" open>
                <summary className="cursor-pointer">{t("result.groups")}</summary>
                <ol className="mt-2 list-decimal pl-5">
                  {matches.map((m, i) => (
                    <li key={i} className="mb-2">
                      <code className="font-mono">{m.match}</code> @{m.index}
                      {m.groups.length > 0 && (
                        <ul className="ml-4 list-disc text-xs text-slate-500">
                          {m.groups.map((g, j) => <li key={j}>${j + 1}: <code>{g}</code></li>)}
                        </ul>
                      )}
                      {Object.keys(m.named).length > 0 && (
                        <ul className="ml-4 list-disc text-xs text-slate-500">
                          {Object.entries(m.named).map(([k, v]) => <li key={k}>{k}: <code>{v}</code></li>)}
                        </ul>
                      )}
                    </li>
                  ))}
                </ol>
              </details>
            )}
          </>
        )}
      </div>
    </div>
  );
}
