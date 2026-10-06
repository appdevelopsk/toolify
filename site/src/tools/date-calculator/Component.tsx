"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  HOLIDAY_PRESET_OPTIONS,
  addBusinessDays,
  addCalendar,
  countBusinessDays,
  outsideHolidayYears,
  parseLocalDate,
  type HolidayCountry,
  type HolidayEntry,
} from "./business";

type Mode = "addSubtract" | "between";
type Op = "add" | "subtract";

function pad(n: number) { return String(n).padStart(2, "0"); }
function todayIso() { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }

function diffYMD(a: Date, b: Date) {
  // assume a <= b
  let years = b.getFullYear() - a.getFullYear();
  let months = b.getMonth() - a.getMonth();
  let days = b.getDate() - a.getDate();
  if (days < 0) {
    months -= 1;
    const prev = new Date(b.getFullYear(), b.getMonth(), 0);
    days += prev.getDate();
  }
  if (months < 0) { years -= 1; months += 12; }
  return { years, months, days };
}

export default function DateCalculator() {
  const t = useTranslations("tools.date-calculator");
  const locale = useLocale();
  const [mode, setMode] = useState<Mode>("addSubtract");
  const [op, setOp] = useState<Op>("add");
  const [start, setStart] = useState(todayIso());
  const [years, setYears] = useState("0");
  const [months, setMonths] = useState("0");
  const [days, setDays] = useState("0");
  const [endDate, setEndDate] = useState(todayIso());
  const [businessMode, setBusinessMode] = useState(false);
  // Public-holiday preset for business days. "" (default) = weekends only, as before.
  const [preset, setPreset] = useState<"" | HolidayCountry>("");

  const result = useMemo(() => {
    if (mode === "addSubtract") {
      const d = parseLocalDate(start);
      if (isNaN(d.getTime())) return null;
      const sign: 1 | -1 = op === "add" ? 1 : -1;
      if (businessMode) {
        // Add/subtract whole business days (Mon–Fri, minus preset holidays), ignoring years/months.
        const n = Math.abs(parseInt(days, 10) || 0);
        const { date, skipped } = addBusinessDays(d, n, sign, preset);
        return { type: "date" as const, date, skipped, outOfRange: !!preset && outsideHolidayYears(d, date) };
      }
      const y = (parseInt(years, 10) || 0) * sign;
      const m = (parseInt(months, 10) || 0) * sign;
      const dd = (parseInt(days, 10) || 0) * sign;
      const out = addCalendar(d, y, m, dd);
      return { type: "date" as const, date: out, skipped: [] as HolidayEntry[], outOfRange: false };
    } else {
      const a = parseLocalDate(start);
      const b = parseLocalDate(endDate);
      if (isNaN(a.getTime()) || isNaN(b.getTime())) return null;
      const [from, to] = a <= b ? [a, b] : [b, a];
      const ymd = diffYMD(from, to);
      // Round, not floor: local midnights are 23h/25h apart across a DST change.
      const totalDays = Math.round((to.getTime() - from.getTime()) / 86400000);
      const totalMonths = ymd.years * 12 + ymd.months;
      const totalWeeks = Math.floor(totalDays / 7);
      // Business days (Mon-Fri; minus preset public holidays when a preset is picked)
      const { business, skipped } = countBusinessDays(from, to, preset);
      const outOfRange = !!preset && outsideHolidayYears(from, to);
      return { type: "diff" as const, ymd, totalDays, totalMonths, totalWeeks, business, skipped, outOfRange };
    }
  }, [mode, op, start, years, months, days, endDate, businessMode, preset]);

  const dateFmt = useMemo(() => new Intl.DateTimeFormat(locale, { dateStyle: "full" }), [locale]);
  const fmt = useMemo(() => new Intl.NumberFormat(locale), [locale]);
  const shortFmt = useMemo(
    () => new Intl.DateTimeFormat(locale, { month: "short", day: "numeric", year: "numeric", weekday: "short" }),
    [locale],
  );

  const presetSelect = (
    <label className="mt-3 block">
      <span className="text-sm font-medium">{t("preset.label")}</span>
      <select
        value={preset}
        onChange={(e) => setPreset(e.target.value as "" | HolidayCountry)}
        className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
      >
        {HOLIDAY_PRESET_OPTIONS.map((p) => (
          <option key={p} value={p}>
            {t(`preset.${p === "" ? "none" : p.toLowerCase()}`)}
          </option>
        ))}
      </select>
      <span className="mt-1 block text-xs text-slate-600 dark:text-slate-400">{t("preset.note")}</span>
    </label>
  );

  const skippedList = (skipped: HolidayEntry[], outOfRange: boolean) =>
    preset ? (
      <div className="mt-4 text-sm">
        <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800">
          <span>{t("result.holidaysSkipped")}</span>
          <span className="tabular-nums">{fmt.format(skipped.length)}</span>
        </div>
        {skipped.length > 0 && (
          <ul className="mt-2 grid gap-1 sm:grid-cols-2">
            {skipped.map((h) => (
              <li key={h.date} className="flex justify-between gap-2">
                <span className="tabular-nums text-slate-600 dark:text-slate-400">{shortFmt.format(parseLocalDate(h.date))}</span>
                <span className="truncate text-right">{h.name}</span>
              </li>
            ))}
          </ul>
        )}
        {outOfRange && <p className="mt-2 text-xs text-amber-700 dark:text-amber-400">{t("preset.outOfRange")}</p>}
      </div>
    ) : null;

  // GA4 calculate の label(ToolInteractionTracker が読む)。計算モードと祝日プリセットのみ=日付・日数は送らない。
  // add/sub = 通常の加減算(祝日は効かないので常に none)、business = 営業日で加算(business-sub は減算)、diff = 2日付の差。
  const holidayKey = preset || "none";
  const calcLabel =
    mode === "between"
      ? `diff:${holidayKey}`
      : businessMode
        ? `${op === "add" ? "business" : "business-sub"}:${holidayKey}`
        : `${op === "add" ? "add" : "sub"}:none`;

  return (
    <div data-calc-label={calcLabel}>
      <div className="mb-4 inline-flex rounded-md border border-slate-300 dark:border-slate-700">
        <button onClick={() => setMode("addSubtract")} className={`px-3 py-1.5 text-sm ${mode === "addSubtract" ? "bg-brand-600 text-white" : ""}`}>{t("mode.addSubtract")}</button>
        <button onClick={() => setMode("between")} className={`px-3 py-1.5 text-sm ${mode === "between" ? "bg-brand-600 text-white" : ""}`}>{t("mode.between")}</button>
      </div>

      <label className="block">
        <span className="text-sm font-medium">{t("input.start")}</span>
        <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
      </label>

      {mode === "addSubtract" ? (
        <>
          <div className="mt-3 inline-flex rounded-md border border-slate-300 dark:border-slate-700">
            <button onClick={() => setOp("add")} className={`px-3 py-1.5 text-sm ${op === "add" ? "bg-brand-600 text-white" : ""}`}>{t("op.add")}</button>
            <button onClick={() => setOp("subtract")} className={`px-3 py-1.5 text-sm ${op === "subtract" ? "bg-brand-600 text-white" : ""}`}>{t("op.subtract")}</button>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <label className="block">
              <span className="text-xs uppercase text-slate-600 dark:text-slate-400">{t("input.years")}</span>
              <input inputMode="numeric" value={years} onChange={(e) => setYears(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-center dark:border-slate-700 dark:bg-slate-900" />
            </label>
            <label className="block">
              <span className="text-xs uppercase text-slate-600 dark:text-slate-400">{t("input.months")}</span>
              <input inputMode="numeric" value={months} onChange={(e) => setMonths(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-center dark:border-slate-700 dark:bg-slate-900" />
            </label>
            <label className="block">
              <span className="text-xs uppercase text-slate-600 dark:text-slate-400">{t("input.days")}</span>
              <input inputMode="numeric" value={days} onChange={(e) => setDays(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-center dark:border-slate-700 dark:bg-slate-900" />
            </label>
          </div>
          <label className="mt-3 flex items-center gap-2 text-sm">
            <input type="checkbox" checked={businessMode} onChange={(e) => setBusinessMode(e.target.checked)} />
            <span>{t("input.businessDayMode")}</span>
          </label>
          {businessMode && presetSelect}
        </>
      ) : (
        <>
          <label className="mt-3 block">
            <span className="text-sm font-medium">{t("input.end")}</span>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
          </label>
          {presetSelect}
        </>
      )}

      <div aria-live="polite" className={`mt-6 rounded-lg border p-4 ${result ? "border-brand-200 bg-brand-50 dark:border-brand-900 dark:bg-brand-900/20" : "border-slate-200 dark:border-slate-800"}`}>
        {result && result.type === "date" ? (
          <>
            <div className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">{t("result.resultDate")}</div>
            <div className="mt-1 text-3xl font-bold">{dateFmt.format(result.date)}</div>
            {businessMode && skippedList(result.skipped, result.outOfRange)}
          </>
        ) : result && result.type === "diff" ? (
          <>
            <div className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">{t("result.difference")}</div>
            <div className="mt-1 text-2xl font-bold tabular-nums">
              {t("result.ymd", { y: result.ymd.years, m: result.ymd.months, d: result.ymd.days })}
            </div>
            <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
              <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800"><dt>{t("result.totalDays")}</dt><dd className="tabular-nums">{fmt.format(result.totalDays)}</dd></div>
              <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800"><dt>{t("result.totalWeeks")}</dt><dd className="tabular-nums">{fmt.format(result.totalWeeks)}</dd></div>
              <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800"><dt>{t("result.totalMonths")}</dt><dd className="tabular-nums">{fmt.format(result.totalMonths)}</dd></div>
              <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800"><dt>{t("result.businessDays")}</dt><dd className="tabular-nums">{fmt.format(result.business)}</dd></div>
            </dl>
            {skippedList(result.skipped, result.outOfRange)}
          </>
        ) : (
          <div className="text-sm text-slate-600 dark:text-slate-400">{t("empty")}</div>
        )}
      </div>
    </div>
  );
}
