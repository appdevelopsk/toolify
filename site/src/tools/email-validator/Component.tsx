"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

// RFC 5322 inspired pragmatic regex — strict enough to catch typos, lenient enough to allow real-world addresses.
const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,63}$/;

// TLDs that have rare but valid lengths
const COMMON_TYPO_DOMAINS: Record<string, string> = {
  "gmial.com": "gmail.com", "gmai.com": "gmail.com", "gmaill.com": "gmail.com", "gnail.com": "gmail.com",
  "gmail.co": "gmail.com", "gmail.con": "gmail.com",
  "yaho.com": "yahoo.com", "yhaoo.com": "yahoo.com", "yahho.com": "yahoo.com",
  "hotnail.com": "hotmail.com", "hotmial.com": "hotmail.com", "hotmaill.com": "hotmail.com",
  "outlok.com": "outlook.com", "outloook.com": "outlook.com",
  "iclud.com": "icloud.com", "iclooud.com": "icloud.com",
};

interface Result {
  email: string;
  syntaxValid: boolean;
  localPart: string;
  domain: string;
  tld: string;
  hasPlus: boolean;
  hasDot: boolean;
  suggestion: string | null;
  notes: string[];
}

function analyze(input: string): Result | null {
  const email = input.trim();
  if (!email) return null;
  const syntaxValid = EMAIL_RE.test(email);
  const at = email.lastIndexOf("@");
  const localPart = at >= 0 ? email.slice(0, at) : "";
  const domain = at >= 0 ? email.slice(at + 1) : "";
  const dot = domain.lastIndexOf(".");
  const tld = dot >= 0 ? domain.slice(dot + 1) : "";
  const hasPlus = localPart.includes("+");
  const hasDot = localPart.includes(".");
  const lcDomain = domain.toLowerCase();
  const suggestion = COMMON_TYPO_DOMAINS[lcDomain] ?? null;

  const notes: string[] = [];
  if (localPart.length > 64) notes.push("local-part exceeds 64 chars (RFC limit)");
  if (email.length > 254) notes.push("address exceeds 254 chars");
  if (localPart.startsWith(".") || localPart.endsWith(".")) notes.push("local-part starts/ends with dot");
  if (localPart.includes("..")) notes.push("local-part has consecutive dots");
  if (domain.includes("..")) notes.push("domain has consecutive dots");

  return { email, syntaxValid, localPart, domain, tld, hasPlus, hasDot, suggestion, notes };
}

export default function EmailValidator() {
  const t = useTranslations("tools.email-validator");
  const [input, setInput] = useState("user@example.com");

  const result = useMemo(() => analyze(input), [input]);

  return (
    <div>
      <label className="block">
        <span className="text-sm font-medium">{t("input.email")}</span>
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="name@example.com" className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-mono dark:border-slate-700 dark:bg-slate-900" />
      </label>

      <div aria-live="polite" className="mt-6">
        {result ? (
          <>
            <div className={`rounded-lg border p-4 ${result.syntaxValid ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-900/20" : "border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-900/20"}`}>
              <div className="flex items-center gap-2">
                <span className={`text-2xl ${result.syntaxValid ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                  {result.syntaxValid ? "✓" : "✗"}
                </span>
                <span className="text-lg font-bold">
                  {result.syntaxValid ? t("status.valid") : t("status.invalid")}
                </span>
              </div>
              {result.suggestion && (
                <div className="mt-3 rounded border border-amber-300 bg-amber-50 px-3 py-2 text-sm dark:border-amber-800 dark:bg-amber-900/20">
                  {t("suggestion", { suggestion: result.suggestion })}
                </div>
              )}
            </div>

            <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
              <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800"><dt>{t("breakdown.localPart")}</dt><dd className="font-mono">{result.localPart || "—"}</dd></div>
              <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800"><dt>{t("breakdown.domain")}</dt><dd className="font-mono">{result.domain || "—"}</dd></div>
              <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800"><dt>{t("breakdown.tld")}</dt><dd className="font-mono">{result.tld || "—"}</dd></div>
              <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800"><dt>{t("breakdown.hasPlus")}</dt><dd>{result.hasPlus ? "✓" : "—"}</dd></div>
            </dl>

            {result.notes.length > 0 && (
              <ul className="mt-4 space-y-1 text-sm">
                {result.notes.map((n, i) => (
                  <li key={i} className="rounded bg-amber-50 px-3 py-1 text-amber-800 dark:bg-amber-900/20 dark:text-amber-200">⚠ {n}</li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <div className="rounded-lg border border-slate-200 p-4 text-sm text-slate-600 dark:text-slate-400 dark:border-slate-800">{t("empty")}</div>
        )}
      </div>
    </div>
  );
}
