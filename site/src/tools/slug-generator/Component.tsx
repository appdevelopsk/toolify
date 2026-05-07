"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

function toAscii(s: string): string {
  // Decompose accents and strip them
  return s.normalize("NFKD").replace(/[̀-ͯ]/g, "");
}

function generateSlug(input: string, opts: { sep: string; lower: boolean; allowUnicode: boolean; maxLen: number }): string {
  let s = input.trim();
  if (!opts.allowUnicode) s = toAscii(s);
  if (opts.lower) s = s.toLowerCase();
  // Remove characters that aren't alphanumeric (or unicode letters/numbers if allowed)
  s = opts.allowUnicode
    ? s.replace(/[^\p{L}\p{N}\s-]/gu, "")
    : s.replace(/[^a-zA-Z0-9\s-]/g, "");
  // Collapse whitespace and hyphens
  s = s.replace(/[\s-]+/g, opts.sep);
  // Trim separators from edges
  s = s.replace(new RegExp(`^${opts.sep}+|${opts.sep}+$`, "g"), "");
  if (opts.maxLen > 0 && s.length > opts.maxLen) {
    s = s.slice(0, opts.maxLen);
    // Avoid ending with a partial word's separator
    s = s.replace(new RegExp(`${opts.sep}+$`), "");
  }
  return s;
}

export default function SlugGenerator() {
  const t = useTranslations("tools.slug-generator");
  const [input, setInput] = useState("How to Build an AdSense-Ready Tool Site (2026 Edition)");
  const [sep, setSep] = useState("-");
  const [lower, setLower] = useState(true);
  const [allowUnicode, setAllowUnicode] = useState(false);
  const [maxLen, setMaxLen] = useState(60);
  const [copied, setCopied] = useState(false);

  const slug = useMemo(() => generateSlug(input, { sep, lower, allowUnicode, maxLen }), [input, sep, lower, allowUnicode, maxLen]);

  async function copy() {
    await navigator.clipboard.writeText(slug);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div>
      <label className="block">
        <span className="text-sm font-medium">{t("input.text")}</span>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={3}
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-base dark:border-slate-700 dark:bg-slate-900"
        />
      </label>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">{t("input.separator")}</span>
          <select value={sep} onChange={(e) => setSep(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
            <option value="-">-（{t("sep.hyphen")}）</option>
            <option value="_">_（{t("sep.underscore")}）</option>
            <option value=".">.（{t("sep.dot")}）</option>
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.maxLen")}: {maxLen}</span>
          <input type="range" min={20} max={120} value={maxLen} onChange={(e) => setMaxLen(parseInt(e.target.value))} className="mt-1 w-full" />
        </label>
        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" checked={lower} onChange={(e) => setLower(e.target.checked)} />
          <span>{t("input.lowercase")}</span>
        </label>
        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" checked={allowUnicode} onChange={(e) => setAllowUnicode(e.target.checked)} />
          <span>{t("input.allowUnicode")}</span>
        </label>
      </div>

      <div aria-live="polite" className="mt-6 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{t("result.slug")}</span>
          <button onClick={copy} className="rounded bg-brand-600 px-2 py-1 text-xs font-medium text-white">
            {copied ? t("copied") : t("copy")}
          </button>
        </div>
        <code className="mt-2 block break-all rounded bg-slate-100 p-3 font-mono text-sm dark:bg-slate-800">{slug || t("empty")}</code>
        <div className="mt-2 text-xs text-slate-500">{t("result.length")}: {slug.length}</div>
      </div>
    </div>
  );
}
