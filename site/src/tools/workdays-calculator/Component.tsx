"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useShareableState } from "@/lib/hooks/useShareableState";
import { HOLIDAY_PRESETS, type HolidayCountry } from "./holidays";

const PRESET_OPTIONS = ["", "US", "JP", "UK", "DE"] as const;

function parseHolidays(input: string): Set<string> {
  return new Set(
    input
      .split(/[\s,;\n]+/)
      .map((s) => s.trim())
      .filter(Boolean),
  );
}

// Local calendar date → "yyyy-mm-dd". (toISOString() is UTC: east of UTC — e.g. JST — it shifted
// every day back by one, so preset holidays matched the wrong weekday.)
function isoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function countWorkdays(
  start: Date,
  end: Date,
  weekend: Set<number>,
  holidays: Set<string>,
): { workdays: number; weekendDays: number; holidayDays: number; total: number } {
  if (start > end) return { workdays: 0, weekendDays: 0, holidayDays: 0, total: 0 };
  let workdays = 0;
  let weekendDays = 0;
  let holidayDays = 0;
  let total = 0;
  const cur = new Date(start);
  while (cur <= end) {
    total++;
    const dow = cur.getDay();
    const dStr = isoDate(cur);
    if (weekend.has(dow)) {
      weekendDays++;
    } else if (holidays.has(dStr)) {
      holidayDays++;
    } else {
      workdays++;
    }
    cur.setDate(cur.getDate() + 1);
  }
  return { workdays, weekendDays, holidayDays, total };
}

// start から n 営業日後(n<0 は前)の日付。開始日自体は数えない。
function addWorkdays(start: Date, n: number, weekend: Set<number>, holidays: Set<string>): Date | null {
  const step = n < 0 ? -1 : 1;
  let left = Math.abs(n);
  const cur = new Date(start);
  for (let guard = 0; guard < 20000; guard++) {
    if (left === 0) return cur;
    cur.setDate(cur.getDate() + step);
    if (!weekend.has(cur.getDay()) && !holidays.has(isoDate(cur))) left--;
  }
  return null;
}

export default function WorkdaysCalculator() {
  const t = useTranslations("tools.workdays-calculator");
  const locale = useLocale();
  const today = new Date();
  const todayStr = isoDate(today);
  const futureStr = isoDate(new Date(today.getTime() + 30 * 86400000));
  const [start, setStart] = useState(todayStr);
  const [end, setEnd] = useState(futureStr);
  const [includeSat, setIncludeSat] = useState(false);
  const [includeSun, setIncludeSun] = useState(false);
  const [holidays, setHolidays] = useState("");
  const [preset, setPreset] = useState<"" | HolidayCountry>("");
  const [mode, setMode] = useState<"range" | "add">("range");
  const [days, setDays] = useState("30");

  useShareableState(
    "workdays-calculator",
    { mode, start, end, days, includeSat, includeSun, holidays, preset },
    (d) => {
      if (d.mode === "range" || d.mode === "add") setMode(d.mode);
      if (typeof d.start === "string") setStart(d.start);
      if (typeof d.end === "string") setEnd(d.end);
      if (typeof d.days === "string") setDays(d.days);
      if (typeof d.includeSat === "boolean") setIncludeSat(d.includeSat);
      if (typeof d.includeSun === "boolean") setIncludeSun(d.includeSun);
      if (typeof d.holidays === "string") setHolidays(d.holidays);
      if (d.preset === "" || (typeof d.preset === "string" && d.preset in HOLIDAY_PRESETS)) setPreset(d.preset as "" | HolidayCountry);
    },
  );

  const presetInRange = useMemo(() => {
    if (!preset) return [];
    return HOLIDAY_PRESETS[preset].filter((h) => h.date >= start && h.date <= end);
  }, [preset, start, end]);

  const afterDate = useMemo(() => {
    if (mode !== "add") return null;
    const sd = new Date(start + "T00:00:00");
    const n = parseInt(days, 10);
    if (isNaN(sd.getTime()) || !isFinite(n)) return null;
    const weekend = new Set<number>();
    if (!includeSat) weekend.add(6);
    if (!includeSun) weekend.add(0);
    const hSet = parseHolidays(holidays);
    if (preset) for (const h of HOLIDAY_PRESETS[preset]) hSet.add(h.date);
    return addWorkdays(sd, n, weekend, hSet);
  }, [mode, start, days, includeSat, includeSun, holidays, preset]);

  const result = useMemo(() => {
    const sd = new Date(start + "T00:00:00");
    const ed = new Date(end + "T00:00:00");
    if (isNaN(sd.getTime()) || isNaN(ed.getTime())) return null;
    const weekend = new Set<number>();
    if (!includeSat) weekend.add(6);
    if (!includeSun) weekend.add(0);
    const hSet = parseHolidays(holidays);
    if (preset) {
      for (const h of HOLIDAY_PRESETS[preset]) hSet.add(h.date);
    }
    return countWorkdays(sd, ed, weekend, hSet);
  }, [start, end, includeSat, includeSun, holidays, preset]);

  const dateFmt = useMemo(
    () => new Intl.DateTimeFormat(locale, { month: "short", day: "numeric", year: "numeric", weekday: "short" }),
    [locale],
  );

  // GA4 calculate の label(ToolInteractionTracker が読む)。祝日プリセットと週末設定のみ=日付は送らない。
  const calcLabel = `${mode === "add" ? "add:" : ""}${preset || "none"}${includeSat ? "+sat" : ""}${includeSun ? "+sun" : ""}`;

  return (
    <div data-calc-label={calcLabel}>
      <div className="mb-4 inline-flex rounded-md border border-slate-300 dark:border-slate-700">
        <button onClick={() => setMode("range")} className={`px-3 py-1.5 text-sm ${mode === "range" ? "bg-brand-600 text-white" : ""}`}>{t("mode.range")}</button>
        <button onClick={() => setMode("add")} className={`px-3 py-1.5 text-sm ${mode === "add" ? "bg-brand-600 text-white" : ""}`}>{t("mode.add")}</button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">{t("input.start")}</span>
          <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
        </label>
        {mode === "range" ? (
          <label className="block">
            <span className="text-sm font-medium">{t("input.end")}</span>
            <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
          </label>
        ) : (
          <label className="block">
            <span className="text-sm font-medium">{t("input.days")}</span>
            <input inputMode="numeric" value={days} onChange={(e) => setDays(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-mono dark:border-slate-700 dark:bg-slate-900" />
          </label>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-3 text-sm">
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" checked={includeSat} onChange={(e) => setIncludeSat(e.target.checked)} />
          <span>{t("input.includeSat")}</span>
        </label>
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" checked={includeSun} onChange={(e) => setIncludeSun(e.target.checked)} />
          <span>{t("input.includeSun")}</span>
        </label>
      </div>

      <label className="mt-4 block">
        <span className="text-sm font-medium">{t("preset.label")}</span>
        <select
          value={preset}
          onChange={(e) => setPreset(e.target.value as "" | HolidayCountry)}
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
        >
          {PRESET_OPTIONS.map((p) => (
            <option key={p} value={p}>
              {t(`preset.${p === "" ? "none" : p.toLowerCase()}`)}
            </option>
          ))}
        </select>
        <span className="mt-1 block text-xs text-slate-600 dark:text-slate-400">{t("preset.note")}</span>
      </label>

      {preset && presetInRange.length > 0 && (
        <div className="mt-3 rounded border border-slate-200 p-3 dark:border-slate-800">
          <div className="text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-slate-400">
            {t("preset.listTitle")} ({presetInRange.length})
          </div>
          <ul className="mt-2 grid gap-1 text-sm sm:grid-cols-2">
            {presetInRange.map((h) => (
              <li key={h.date} className="flex justify-between gap-2">
                <span className="tabular-nums text-slate-600 dark:text-slate-400">
                  {dateFmt.format(new Date(h.date + "T00:00:00"))}
                </span>
                <span className="truncate text-right">{h.name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <label className="mt-3 block">
        <span className="text-sm font-medium">{t("input.holidays")}</span>
        <textarea
          value={holidays}
          onChange={(e) => setHolidays(e.target.value)}
          rows={3}
          placeholder="2026-01-01, 2026-12-25"
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-mono text-sm dark:border-slate-700 dark:bg-slate-900"
        />
        <span className="text-xs text-slate-600 dark:text-slate-400">{t("input.holidaysHint")}</span>
      </label>

      <div aria-live="polite" className="mt-6 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
        {mode === "add" ? (
          afterDate ? (
            <div className="flex items-center justify-between rounded bg-emerald-50 px-3 py-2 dark:bg-emerald-900/20">
              <span className="text-sm font-medium">{t("result.afterDate")}</span>
              <span className="text-xl font-bold tabular-nums">{dateFmt.format(afterDate)}</span>
            </div>
          ) : (
            <div className="text-sm text-slate-600 dark:text-slate-400">{t("empty")}</div>
          )
        ) : result && result.total > 0 ? (
          <dl className="grid gap-2 text-sm">
            <div className="flex justify-between rounded bg-emerald-50 px-3 py-2 dark:bg-emerald-900/20">
              <dt className="font-medium">{t("result.workdays")}</dt>
              <dd className="tabular-nums text-2xl font-bold">{result.workdays}</dd>
            </div>
            <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800"><dt>{t("result.weekendDays")}</dt><dd className="tabular-nums">{result.weekendDays}</dd></div>
            <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800"><dt>{t("result.holidayDays")}</dt><dd className="tabular-nums">{result.holidayDays}</dd></div>
            <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800"><dt>{t("result.total")}</dt><dd className="tabular-nums">{result.total}</dd></div>
          </dl>
        ) : (
          <div className="text-sm text-slate-600 dark:text-slate-400">{t("empty")}</div>
        )}
      </div>
    </div>
  );
}
