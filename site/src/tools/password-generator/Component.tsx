"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";

const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWER = "abcdefghijklmnopqrstuvwxyz";
const NUMBERS = "0123456789";
const SYMBOLS = "!@#$%^&*()-_=+[]{};:,.<>?/";
const AMBIGUOUS = /[0OoIl1|`']/g;

function pickFromAlphabet(alphabet: string, length: number): string {
  if (alphabet.length === 0) return "";
  const out: string[] = [];
  const buf = new Uint32Array(length);
  crypto.getRandomValues(buf);
  for (let i = 0; i < length; i++) {
    out.push(alphabet[buf[i]! % alphabet.length]!);
  }
  return out.join("");
}

interface Strength {
  bits: number;
  level: "weak" | "medium" | "strong" | "excellent";
}

function strengthOf(alphabetSize: number, length: number): Strength {
  const bits = Math.log2(Math.max(1, alphabetSize)) * length;
  let level: Strength["level"] = "weak";
  if (bits >= 128) level = "excellent";
  else if (bits >= 80) level = "strong";
  else if (bits >= 50) level = "medium";
  return { bits: Math.round(bits), level };
}

export default function PasswordGenerator() {
  const t = useTranslations("tools.password-generator");
  const [length, setLength] = useState(16);
  const [useUpper, setUseUpper] = useState(true);
  const [useLower, setUseLower] = useState(true);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [avoidAmbiguous, setAvoidAmbiguous] = useState(false);
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);

  const generate = useCallback(() => {
    let alphabet = "";
    if (useUpper) alphabet += UPPER;
    if (useLower) alphabet += LOWER;
    if (useNumbers) alphabet += NUMBERS;
    if (useSymbols) alphabet += SYMBOLS;
    if (avoidAmbiguous) alphabet = alphabet.replace(AMBIGUOUS, "");
    setPassword(pickFromAlphabet(alphabet, Math.max(4, Math.min(128, length))));
    setCopied(false);
  }, [useUpper, useLower, useNumbers, useSymbols, avoidAmbiguous, length]);

  useEffect(() => {
    generate();
  }, [generate]);

  const alphabetSize =
    (useUpper ? 26 : 0) +
    (useLower ? 26 : 0) +
    (useNumbers ? 10 : 0) +
    (useSymbols ? 25 : 0) -
    (avoidAmbiguous ? 6 : 0);
  const strength = strengthOf(Math.max(1, alphabetSize), length);

  async function copy() {
    if (!password) return;
    await navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div>
      <div className="flex flex-wrap items-stretch gap-2">
        <output className="flex-1 min-w-0 rounded border border-slate-300 bg-slate-50 px-3 py-2 font-mono text-base break-all dark:border-slate-700 dark:bg-slate-950">
          {password || "—"}
        </output>
        <button
          onClick={copy}
          className="rounded border border-slate-300 px-3 py-2 text-sm hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          {copied ? t("copied") : t("copy")}
        </button>
        <button
          onClick={generate}
          className="rounded bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          {t("regenerate")}
        </button>
      </div>

      <div className="mt-3 flex items-center gap-2 text-sm">
        <span
          className={`rounded px-2 py-0.5 text-xs font-medium ${
            strength.level === "excellent"
              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200"
              : strength.level === "strong"
                ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200"
                : strength.level === "medium"
                  ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200"
                  : "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200"
          }`}
        >
          {t(`strength.${strength.level}`)}
        </span>
        <span className="text-slate-600 dark:text-slate-400">
          {t("entropy", { bits: strength.bits })}
        </span>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="text-sm font-medium">
            {t("input.length")}: <span className="tabular-nums">{length}</span>
          </span>
          <input
            type="range"
            min={4}
            max={64}
            value={length}
            onChange={(e) => setLength(parseInt(e.target.value, 10))}
            className="mt-2 w-full"
          />
        </label>
        <Toggle label={t("opt.upper")} checked={useUpper} onChange={setUseUpper} />
        <Toggle label={t("opt.lower")} checked={useLower} onChange={setUseLower} />
        <Toggle label={t("opt.numbers")} checked={useNumbers} onChange={setUseNumbers} />
        <Toggle label={t("opt.symbols")} checked={useSymbols} onChange={setUseSymbols} />
        <Toggle label={t("opt.avoidAmbiguous")} checked={avoidAmbiguous} onChange={setAvoidAmbiguous} />
      </div>
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 rounded border border-slate-200 px-3 py-2 text-sm dark:border-slate-800">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}
