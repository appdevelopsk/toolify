"use client";

import { useEffect, useMemo, useState } from "react";
import { scenarioResult, type PercentageMode } from "./scenario-comparison";
import { scenarioCopy, resumeCopy } from "./scenario-copy";
import { SCENARIO_STORAGE_KEY, parseSavedScenario, serializeSavedScenario, type SavedPercentageScenario } from "./scenario-resume";
import { useLocale, useTranslations } from "next-intl";
import { useShareableState } from "@/lib/hooks/useShareableState";
import { trackScenarioAction } from "@/lib/analytics/events";

type Mode = PercentageMode;
const MODES: Mode[] = ["pct_of", "what_pct", "pct_change", "pct_add", "pct_sub"];

export default function PercentageCalculator() {
  const t = useTranslations("tools.percentage-calculator");
  const locale = useLocale();
  const comparisonText = scenarioCopy(locale);
  const resumeText = resumeCopy(locale);
  const [mode, setMode] = useState<Mode>("pct_of");
  // 空欄で着地すると結果カードが何も描かれず、道具が動くことが伝わらないまま離脱する。
  // 代表値を初期表示し、最初の描画から結果を見せる(2026-08-22)。
  const [a, setA] = useState("20");
  const [b, setB] = useState("250");
  const [baseline, setBaseline] = useState<{ mode: Mode; a: string; b: string; value: number } | null>(null);
  const [saved, setSaved] = useState<SavedPercentageScenario | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(SCENARIO_STORAGE_KEY);
      const value = parseSavedScenario(raw, Date.now());
      setSaved(value);
      if (raw && !value) window.localStorage.removeItem(SCENARIO_STORAGE_KEY);
    } catch { /* Browser storage may be disabled; calculator remains functional. */ }
  }, []);

  useShareableState("percentage-calculator", { mode, a, b }, (d) => {
    if (typeof d.mode === "string" && (MODES as string[]).includes(d.mode)) setMode(d.mode as Mode);
    if (typeof d.a === "string") setA(d.a);
    if (typeof d.b === "string") setB(d.b);
  });

  const result = useMemo(() => scenarioResult(mode, a, b), [mode, a, b]);

  const fmt = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 4 }), [locale]);
  // 加算・減算モードは「X% of Y」と同じ入力欄(X=率, Y=値)なので文言を流用する。
  const base: Mode = mode === "pct_add" || mode === "pct_sub" ? "pct_of" : mode;
  const labelA = t(`mode.${base}.labelA`);
  const labelB = t(`mode.${base}.labelB`);
  const resultLabel = t(`mode.${mode}.resultLabel`);
  const resultUnit = base === mode ? t(`mode.${mode}.resultUnit`) : "";

  return (
    <div>
      <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
        {MODES.map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`rounded border px-3 py-2 text-sm ${
              mode === m
                ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20"
                : "border-slate-300 dark:border-slate-700"
            }`}
          >
            {t(`mode.${m}.title`)}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">{labelA}</span>
          <input
            inputMode="decimal"
            value={a}
            onChange={(e) => setA(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{labelB}</span>
          <input
            inputMode="decimal"
            value={b}
            onChange={(e) => setB(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          />
        </label>
      </div>

      <div
        aria-live="polite"
        className={`mt-6 rounded-lg border p-4 ${
          result !== null ? "border-brand-200 bg-brand-50 dark:border-brand-900 dark:bg-brand-900/20" : "border-slate-200 dark:border-slate-800"
        }`}
      >
        {result !== null ? (
          <>
            <div className="text-sm uppercase tracking-wider text-slate-600 dark:text-slate-400">{resultLabel}</div>
            <div className="mt-1 text-4xl font-bold tabular-nums">
              {fmt.format(result)}
              <span className="ml-1 text-2xl text-slate-600 dark:text-slate-400">{resultUnit}</span>
            </div>
          </>
        ) : (
          <div className="text-sm text-slate-600 dark:text-slate-400">{t("empty")}</div>
        )}
      </div>
      <section className="mt-5 rounded-lg border border-slate-200 p-4 dark:border-slate-700" aria-label={resumeText.save}>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => {
            try {
              const next = serializeSavedScenario(mode, a, b, Date.now());
              if (!next) return;
              window.localStorage.setItem(SCENARIO_STORAGE_KEY, next);
              setSaved(parseSavedScenario(next, Date.now()));
              trackScenarioAction({ tool: "percentage-calculator", locale, action: "draft_save" });
            } catch { /* Storage unavailable: do not interrupt calculation. */ }
          }} disabled={result === null} className="min-h-11 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700">{resumeText.save}</button>
          {saved && <>
            <button type="button" onClick={() => {
              try {
                const valid = parseSavedScenario(window.localStorage.getItem(SCENARIO_STORAGE_KEY), Date.now());
                if (!valid) {
                  window.localStorage.removeItem(SCENARIO_STORAGE_KEY);
                  setSaved(null);
                  return;
                }
                setMode(valid.mode);
                setA(valid.a);
                setB(valid.b);
                trackScenarioAction({ tool: "percentage-calculator", locale, action: "draft_restore" });
              } catch { setSaved(null); }
            }} className="min-h-11 rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700">{resumeText.restore}</button>
            <button type="button" onClick={() => {
              try { window.localStorage.removeItem(SCENARIO_STORAGE_KEY); } catch {}
              setSaved(null);
              trackScenarioAction({ tool: "percentage-calculator", locale, action: "draft_clear" });
            }} className="min-h-11 rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700">{resumeText.clear}</button>
          </>}
        </div>
        <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">{resumeText.disclosure}</p>
      </section>
      {/* Temporary comparison: no automatic storage, analytics payload, or server transfer. */}
      <section className="mt-5 rounded-lg border border-slate-200 p-4 dark:border-slate-700">
        <h3 className="text-sm font-semibold">{comparisonText.heading}</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" disabled={result === null} onClick={() => { if (result !== null) { setBaseline({ mode, a, b, value: result }); trackScenarioAction({ tool: "percentage-calculator", locale, action: "compare_save" }); } }} className="min-h-11 rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50">{comparisonText.save}</button>
          {baseline && <button type="button" onClick={() => { setMode(baseline.mode); setA(baseline.a); setB(baseline.b); trackScenarioAction({ tool: "percentage-calculator", locale, action: "compare_restore" }); }} className="min-h-11 rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700">{comparisonText.restore}</button>}
          {baseline && <button type="button" onClick={() => { setBaseline(null); trackScenarioAction({ tool: "percentage-calculator", locale, action: "compare_clear" }); }} className="min-h-11 rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700">{comparisonText.clear}</button>}
        </div>
        {baseline && (
          <dl className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3" aria-live="polite">
            <div><dt className="text-xs font-semibold">A · {t(`mode.${baseline.mode}.title`)}</dt><dd className="mt-1 text-xl font-semibold tabular-nums">{fmt.format(baseline.value)}</dd></div>
            <div><dt className="text-xs font-semibold">B · {t(`mode.${mode}.title`)}</dt><dd className="mt-1 text-xl font-semibold tabular-nums">{result === null ? "—" : fmt.format(result)}</dd></div>
            <div><dt className="text-xs font-semibold">{comparisonText.difference}</dt><dd className="mt-1 text-xl font-semibold tabular-nums">{result === null || baseline.mode !== mode ? "—" : fmt.format(result - baseline.value)}</dd></div>
          </dl>
        )}
      </section>
    </div>
  );
}
