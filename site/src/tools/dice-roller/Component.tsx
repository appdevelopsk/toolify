"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";

const PRESETS = [
  { label: "d4", sides: 4 },
  { label: "d6", sides: 6 },
  { label: "d8", sides: 8 },
  { label: "d10", sides: 10 },
  { label: "d12", sides: 12 },
  { label: "d20", sides: 20 },
  { label: "d100", sides: 100 },
];

function secureRoll(sides: number): number {
  const range = sides;
  const max = 0x100000000;
  const limit = max - (max % range);
  const buf = new Uint32Array(1);
  while (true) {
    crypto.getRandomValues(buf);
    if (buf[0]! < limit) return 1 + (buf[0]! % range);
  }
}

export default function DiceRoller() {
  const t = useTranslations("tools.dice-roller");
  const locale = useLocale();
  const [sides, setSides] = useState(6);
  const [count, setCount] = useState(2);
  const [modifier, setModifier] = useState("0");
  const [rolls, setRolls] = useState<number[]>([]);
  const [history, setHistory] = useState<{ rolls: number[]; sum: number; sides: number; modifier: number }[]>([]);

  const fmt = new Intl.NumberFormat(locale);
  const mod = parseInt(modifier, 10) || 0;

  function roll() {
    const n = Math.max(1, Math.min(50, count));
    const s = Math.max(2, Math.min(1000, sides));
    const newRolls: number[] = [];
    for (let i = 0; i < n; i++) newRolls.push(secureRoll(s));
    setRolls(newRolls);
    setHistory((h) => [{ rolls: newRolls, sum: newRolls.reduce((a, b) => a + b, 0) + mod, sides: s, modifier: mod }, ...h.slice(0, 9)]);
  }

  const sum = rolls.reduce((a, b) => a + b, 0);
  const total = sum + mod;

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-1">
        {PRESETS.map((p) => (
          <button key={p.label} onClick={() => setSides(p.sides)} className={`rounded border px-2 py-1 text-xs ${sides === p.sides ? "border-brand-500 bg-brand-50 dark:bg-brand-900/40" : "border-slate-300 dark:border-slate-700"}`}>
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block">
          <span className="text-sm font-medium">{t("input.count")}</span>
          <input inputMode="numeric" value={count} onChange={(e) => setCount(Math.max(1, Math.min(50, parseInt(e.target.value, 10) || 1)))} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-center font-mono dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.sides")}</span>
          <input inputMode="numeric" value={sides} onChange={(e) => setSides(Math.max(2, Math.min(1000, parseInt(e.target.value, 10) || 6)))} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-center font-mono dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.modifier")}</span>
          <input inputMode="numeric" value={modifier} onChange={(e) => setModifier(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-center font-mono dark:border-slate-700 dark:bg-slate-900" />
        </label>
      </div>

      <button onClick={roll} className="mt-4 w-full rounded bg-brand-600 px-6 py-3 text-lg font-bold text-white hover:bg-brand-700 sm:w-auto">
        🎲 {t("roll", { count, sides, modifier: mod >= 0 ? `+${mod}` : `${mod}` })}
      </button>

      {rolls.length > 0 && (
        <div aria-live="polite" className="mt-6 rounded-lg border border-brand-200 bg-brand-50 p-4 dark:border-brand-900 dark:bg-brand-900/20">
          <div className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">{t("result.total")}</div>
          <div className="mt-1 font-mono text-5xl font-bold tabular-nums">
            {fmt.format(total)}
            {mod !== 0 && <span className="ml-2 text-base font-normal text-slate-600 dark:text-slate-400">({fmt.format(sum)} {mod >= 0 ? "+" : "−"} {Math.abs(mod)})</span>}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {rolls.map((r, i) => (
              <span key={i} className="rounded bg-white px-3 py-1 font-mono text-xl tabular-nums dark:bg-slate-900">{r}</span>
            ))}
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div className="mt-6">
          <div className="mb-2 text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">{t("result.history")}</div>
          <div className="space-y-1">
            {history.map((h, i) => (
              <div key={i} className="flex flex-wrap items-baseline justify-between gap-2 rounded border border-slate-200 px-3 py-1.5 text-sm dark:border-slate-800">
                <span className="font-mono">
                  {h.rolls.length}d{h.sides}{h.modifier !== 0 && <>{h.modifier >= 0 ? "+" : ""}{h.modifier}</>}: <span className="text-slate-600 dark:text-slate-400">[{h.rolls.join(", ")}]</span>
                </span>
                <span className="font-mono text-base font-bold tabular-nums">= {fmt.format(h.sum)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
