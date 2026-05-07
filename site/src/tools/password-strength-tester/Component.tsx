"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

const COMMON_PASSWORDS = new Set([
  "password", "123456", "12345678", "qwerty", "abc123", "password1",
  "iloveyou", "admin", "welcome", "monkey", "dragon", "letmein",
  "sunshine", "princess", "qwerty123", "starwars", "passw0rd",
  "football", "baseball", "master", "trustno1", "111111", "1234567",
]);

interface Analysis {
  length: number;
  hasLower: boolean;
  hasUpper: boolean;
  hasDigit: boolean;
  hasSymbol: boolean;
  charsetSize: number;
  entropyBits: number;
  crackTime: { offline: number; onlineFast: number; onlineSlow: number };
  isCommon: boolean;
  hasRepeated: boolean;
  hasSequential: boolean;
  score: number; // 0-4
  warnings: string[];
}

function analyze(pw: string): Analysis | null {
  if (pw.length === 0) return null;
  const hasLower = /[a-z]/.test(pw);
  const hasUpper = /[A-Z]/.test(pw);
  const hasDigit = /\d/.test(pw);
  const hasSymbol = /[^a-zA-Z0-9]/.test(pw);
  let charsetSize = 0;
  if (hasLower) charsetSize += 26;
  if (hasUpper) charsetSize += 26;
  if (hasDigit) charsetSize += 10;
  if (hasSymbol) charsetSize += 33;
  const entropyBits = pw.length * Math.log2(charsetSize || 1);
  // Approximations: 1e10 hash/sec offline (GPU), 1000/sec online fast, 100/sec online with rate-limit
  const guesses = Math.pow(2, entropyBits) / 2;
  const crackTime = {
    offline: guesses / 1e10,
    onlineFast: guesses / 1000,
    onlineSlow: guesses / 100,
  };
  const isCommon = COMMON_PASSWORDS.has(pw.toLowerCase());
  const hasRepeated = /(.)\1{2,}/.test(pw);
  const hasSequential = /(0123|1234|2345|3456|4567|5678|6789|abcd|bcde|cdef|qwer|wert|erty|asdf|sdfg)/i.test(pw);
  const warnings: string[] = [];
  if (isCommon) warnings.push("isCommon");
  if (pw.length < 8) warnings.push("tooShort");
  if (hasRepeated) warnings.push("hasRepeated");
  if (hasSequential) warnings.push("hasSequential");
  if (charsetSize <= 26) warnings.push("limitedCharset");

  let score: number;
  if (isCommon || pw.length < 6) score = 0;
  else if (entropyBits < 30) score = 1;
  else if (entropyBits < 50) score = 2;
  else if (entropyBits < 70) score = 3;
  else score = 4;

  return {
    length: pw.length,
    hasLower, hasUpper, hasDigit, hasSymbol,
    charsetSize, entropyBits,
    crackTime, isCommon, hasRepeated, hasSequential,
    score, warnings,
  };
}

function formatTime(seconds: number, t: (k: string, v?: Record<string, string | number>) => string): string {
  if (!isFinite(seconds) || seconds > 1e30) return t("time.eternity");
  if (seconds < 1) return t("time.instant");
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)}h`;
  if (seconds < 31_536_000) return `${Math.round(seconds / 86400)}d`;
  const yrs = seconds / 31_536_000;
  if (yrs < 1000) return `${Math.round(yrs)}y`;
  if (yrs < 1e6) return `${Math.round(yrs / 1000)}k${t("time.yrs")}`;
  if (yrs < 1e9) return `${Math.round(yrs / 1e6)}M${t("time.yrs")}`;
  return `${(yrs / 1e9).toExponential(1)} ${t("time.yrs")}`;
}

export default function PasswordStrengthTester() {
  const t = useTranslations("tools.password-strength-tester");
  const locale = useLocale();
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);

  const a = useMemo(() => analyze(pw), [pw]);

  const fmt = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }), [locale]);
  const scoreColor = ["bg-rose-500", "bg-orange-500", "bg-amber-500", "bg-lime-500", "bg-emerald-500"];
  const scoreLabel = ["veryWeak", "weak", "fair", "strong", "veryStrong"];

  return (
    <div>
      <label className="block">
        <span className="text-sm font-medium">{t("input.password")}</span>
        <div className="mt-1 flex gap-2">
          <input
            type={show ? "text" : "password"}
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            autoFocus
            className="flex-1 rounded border border-slate-300 px-3 py-2 font-mono text-base dark:border-slate-700 dark:bg-slate-900"
          />
          <button onClick={() => setShow((s) => !s)} className="rounded border border-slate-300 px-3 py-2 text-sm dark:border-slate-700">
            {show ? t("hide") : t("show")}
          </button>
        </div>
        <span className="text-xs text-slate-500">{t("input.privacyNote")}</span>
      </label>

      {a && (
        <div aria-live="polite" className="mt-6 space-y-4">
          <div>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{t("result.strength")}: {t(`level.${scoreLabel[a.score]}`)}</span>
              <span className="text-slate-500">{fmt.format(a.entropyBits)} {t("result.bits")}</span>
            </div>
            <div className="mt-1 flex gap-1 h-2 overflow-hidden rounded">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className={`flex-1 ${i <= a.score ? scoreColor[a.score] : "bg-slate-200 dark:bg-slate-700"}`} />
              ))}
            </div>
          </div>

          <dl className="grid gap-1 text-sm sm:grid-cols-2">
            <Row label={t("result.length")} value={String(a.length)} />
            <Row label={t("result.charsetSize")} value={String(a.charsetSize)} />
            <Row label={t("result.entropy")} value={`${fmt.format(a.entropyBits)} bits`} />
            <Row label={t("result.lowercase")} value={a.hasLower ? "✓" : "✗"} />
            <Row label={t("result.uppercase")} value={a.hasUpper ? "✓" : "✗"} />
            <Row label={t("result.digits")} value={a.hasDigit ? "✓" : "✗"} />
            <Row label={t("result.symbols")} value={a.hasSymbol ? "✓" : "✗"} />
          </dl>

          <div>
            <h3 className="text-sm font-medium">{t("result.crackTime")}</h3>
            <dl className="mt-1 grid gap-1 text-sm">
              <Row label={t("result.crackOffline")} value={formatTime(a.crackTime.offline, t)} />
              <Row label={t("result.crackOnlineFast")} value={formatTime(a.crackTime.onlineFast, t)} />
              <Row label={t("result.crackOnlineSlow")} value={formatTime(a.crackTime.onlineSlow, t)} />
            </dl>
          </div>

          {a.warnings.length > 0 && (
            <div className="rounded border border-amber-300 bg-amber-50 p-3 text-sm dark:border-amber-900 dark:bg-amber-900/20">
              <div className="font-medium text-amber-900 dark:text-amber-200">{t("result.warningsHeading")}</div>
              <ul className="mt-1 list-inside list-disc text-amber-800 dark:text-amber-300">
                {a.warnings.map((w) => <li key={w}>{t(`warning.${w}`)}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800">
      <dt className="text-slate-600 dark:text-slate-400">{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  );
}
