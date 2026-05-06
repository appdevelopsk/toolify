"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

function splitWords(s: string): string[] {
  return s
    .replace(/([a-z\d])([A-Z])/g, "$1 $2")
    .replace(/[_\-\/\.]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}
function caps(w: string) {
  return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
}

const TRANSFORMS = {
  lower: (s: string) => s.toLowerCase(),
  upper: (s: string) => s.toUpperCase(),
  title: (s: string) => splitWords(s).map(caps).join(" "),
  sentence: (s: string) => s.toLowerCase().replace(/(^|[\.!?]\s+)([a-z])/g, (_, p, c) => p + c.toUpperCase()),
  camel: (s: string) => splitWords(s).map((w, i) => (i === 0 ? w.toLowerCase() : caps(w))).join(""),
  pascal: (s: string) => splitWords(s).map(caps).join(""),
  snake: (s: string) => splitWords(s).map((w) => w.toLowerCase()).join("_"),
  kebab: (s: string) => splitWords(s).map((w) => w.toLowerCase()).join("-"),
  constant: (s: string) => splitWords(s).map((w) => w.toUpperCase()).join("_"),
  invert: (s: string) => s.split("").map((c) => (c === c.toLowerCase() ? c.toUpperCase() : c.toLowerCase())).join(""),
};

type Key = keyof typeof TRANSFORMS;

export default function CaseConverter() {
  const t = useTranslations("tools.case-converter");
  const [text, setText] = useState("hello world example");
  const [copied, setCopied] = useState<Key | null>(null);

  const results = useMemo(() => {
    const out: Record<Key, string> = {} as Record<Key, string>;
    for (const k of Object.keys(TRANSFORMS) as Key[]) out[k] = TRANSFORMS[k](text);
    return out;
  }, [text]);

  async function copy(key: Key) {
    await navigator.clipboard.writeText(results[key]);
    setCopied(key);
    setTimeout(() => setCopied(null), 1200);
  }

  return (
    <div>
      <label className="block">
        <span className="text-sm font-medium">{t("input.text")}</span>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-mono text-sm dark:border-slate-700 dark:bg-slate-900" />
      </label>

      <div aria-live="polite" className="mt-4 space-y-2">
        {(Object.keys(TRANSFORMS) as Key[]).map((k) => (
          <div key={k} className="rounded border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between bg-slate-50 px-3 py-2 text-xs uppercase tracking-wider text-slate-500 dark:bg-slate-900">
              <span>{t(`case.${k}`)}</span>
              <button onClick={() => copy(k)} className="text-xs hover:underline">
                {copied === k ? t("copied") : t("copy")}
              </button>
            </div>
            <pre className="overflow-x-auto px-3 py-2 font-mono text-sm">{results[k] || " "}</pre>
          </div>
        ))}
      </div>
    </div>
  );
}
