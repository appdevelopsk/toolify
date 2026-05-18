"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

// ─── Types ───────────────────────────────────────────────────────────────────

type Tab = "add-subtract" | "time-difference" | "hours-to-decimal";
type Op = "+" | "-";
type HDecMode = "hm-to-decimal" | "decimal-to-hm";

interface TimeRow {
  id: number;
  op: Op;
  hours: string;
  minutes: string;
  seconds: string;
}

let nextId = 1;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatHMS(totalSeconds: number): string {
  const abs = Math.abs(totalSeconds);
  const h = Math.floor(abs / 3600);
  const m = Math.floor((abs % 3600) / 60);
  const s = Math.floor(abs % 60);
  const sign = totalSeconds < 0 ? "-" : "";
  return `${sign}${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function toDecimalHours(totalSeconds: number): number {
  return totalSeconds / 3600;
}

/**
 * Parse a time string like "9:30", "9:30:00", "9:30 AM", "21:30" into total seconds.
 * Returns NaN on failure.
 */
function parseTimeString(raw: string): number {
  const s = raw.trim();

  // Detect AM/PM
  const ampmMatch = s.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm)$/i);
  if (ampmMatch) {
    const g1 = ampmMatch[1] ?? "";
    const g2 = ampmMatch[2] ?? "";
    const g4 = ampmMatch[4] ?? "";
    let h = parseInt(g1, 10);
    const m = parseInt(g2, 10);
    const sec = ampmMatch[3] ? parseInt(ampmMatch[3], 10) : 0;
    const period = g4.toLowerCase();
    if (h < 1 || h > 12 || m > 59 || sec > 59) return NaN;
    if (period === "am" && h === 12) h = 0;
    if (period === "pm" && h !== 12) h += 12;
    return h * 3600 + m * 60 + sec;
  }

  // 24-hour HH:MM or HH:MM:SS
  const match = s.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (match) {
    const h = parseInt(match[1] ?? "", 10);
    const m = parseInt(match[2] ?? "", 10);
    const sec = match[3] ? parseInt(match[3], 10) : 0;
    if (h > 23 || m > 59 || sec > 59) return NaN;
    return h * 3600 + m * 60 + sec;
  }

  return NaN;
}

function decimalToHMS(decimal: number): { h: number; m: number; s: number } {
  const abs = Math.abs(decimal);
  const totalSec = Math.round(abs * 3600);
  return {
    h: Math.floor(totalSec / 3600),
    m: Math.floor((totalSec % 3600) / 60),
    s: totalSec % 60,
  };
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function AddSubtractTab({ t, locale }: { t: ReturnType<typeof useTranslations>; locale: string }) {
  const [rows, setRows] = useState<TimeRow[]>([
    { id: nextId++, op: "+", hours: "2", minutes: "30", seconds: "" },
    { id: nextId++, op: "+", hours: "1", minutes: "45", seconds: "" },
  ]);

  const fmt = useMemo(
    () => new Intl.NumberFormat(locale, { maximumFractionDigits: 6 }),
    [locale]
  );

  const result = useMemo(() => {
    let total = 0;
    let hasValid = false;
    for (const row of rows) {
      const h = parseFloat(row.hours) || 0;
      const m = parseFloat(row.minutes) || 0;
      const s = parseFloat(row.seconds) || 0;
      if (row.hours === "" && row.minutes === "" && row.seconds === "") continue;
      hasValid = true;
      const seconds = h * 3600 + m * 60 + s;
      total += row.op === "+" ? seconds : -seconds;
    }
    if (!hasValid) return null;
    return {
      totalSeconds: total,
      hms: formatHMS(total),
      decimal: toDecimalHours(total),
    };
  }, [rows]);

  function update(id: number, patch: Partial<TimeRow>) {
    setRows((arr) => arr.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }
  function add() {
    if (rows.length >= 10) return;
    setRows((arr) => [...arr, { id: nextId++, op: "+", hours: "", minutes: "", seconds: "" }]);
  }
  function remove(id: number) {
    setRows((arr) => (arr.length <= 1 ? arr : arr.filter((r) => r.id !== id)));
  }

  return (
    <div>
      {/* Column headers */}
      <div className="mb-1 grid grid-cols-[44px_1fr_1fr_1fr_32px] gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
        <span>{t("addSub.op")}</span>
        <span>{t("addSub.hours")}</span>
        <span>{t("addSub.minutes")}</span>
        <span>{t("addSub.seconds")}</span>
        <span />
      </div>

      <div className="space-y-2">
        {rows.map((row, idx) => (
          <div key={row.id} className="grid grid-cols-[44px_1fr_1fr_1fr_32px] items-center gap-2">
            {/* Op selector — first row is always + and locked */}
            {idx === 0 ? (
              <span className="rounded border border-slate-200 bg-slate-50 px-2 py-1.5 text-center text-sm font-bold dark:border-slate-700 dark:bg-slate-800">
                +
              </span>
            ) : (
              <select
                value={row.op}
                onChange={(e) => update(row.id, { op: e.target.value as Op })}
                className="rounded border border-slate-300 px-1 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900"
              >
                <option value="+">+</option>
                <option value="-">−</option>
              </select>
            )}
            <input
              inputMode="decimal"
              value={row.hours}
              onChange={(e) => update(row.id, { hours: e.target.value })}
              placeholder="0"
              className="rounded border border-slate-300 px-2 py-1.5 text-sm tabular-nums dark:border-slate-700 dark:bg-slate-900"
            />
            <input
              inputMode="decimal"
              value={row.minutes}
              onChange={(e) => update(row.id, { minutes: e.target.value })}
              placeholder="0"
              className="rounded border border-slate-300 px-2 py-1.5 text-sm tabular-nums dark:border-slate-700 dark:bg-slate-900"
            />
            <input
              inputMode="decimal"
              value={row.seconds}
              onChange={(e) => update(row.id, { seconds: e.target.value })}
              placeholder="0"
              className="rounded border border-slate-300 px-2 py-1.5 text-sm tabular-nums dark:border-slate-700 dark:bg-slate-900"
            />
            <button
              onClick={() => remove(row.id)}
              aria-label={t("remove")}
              disabled={rows.length <= 1}
              className="text-slate-400 hover:text-red-500 disabled:opacity-30"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {rows.length < 10 && (
        <button
          onClick={add}
          className="mt-3 rounded border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          + {t("addSub.addRow")}
        </button>
      )}

      <div aria-live="polite" className="mt-6 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
        {!result ? (
          <p className="text-sm text-slate-600 dark:text-slate-400">{t("empty")}</p>
        ) : (
          <dl className="grid gap-3 sm:grid-cols-3">
            <div className="rounded bg-emerald-50 p-3 dark:bg-emerald-900/20">
              <dt className="text-xs font-medium text-emerald-900 dark:text-emerald-200">
                {t("result.total")}
              </dt>
              <dd className="mt-1 font-mono text-3xl font-bold tabular-nums">{result.hms}</dd>
            </div>
            <div className="rounded bg-slate-100 p-3 dark:bg-slate-800">
              <dt className="text-xs font-medium text-slate-600 dark:text-slate-400">
                {t("result.decimalHours")}
              </dt>
              <dd className="mt-1 font-mono text-2xl font-bold tabular-nums">
                {fmt.format(result.decimal)}
              </dd>
            </div>
            <div className="rounded bg-slate-100 p-3 dark:bg-slate-800">
              <dt className="text-xs font-medium text-slate-600 dark:text-slate-400">
                {t("result.totalMinutes")}
              </dt>
              <dd className="mt-1 font-mono text-2xl font-bold tabular-nums">
                {fmt.format(result.totalSeconds / 60)}
              </dd>
            </div>
          </dl>
        )}
      </div>
    </div>
  );
}

function TimeDifferenceTab({ t, locale }: { t: ReturnType<typeof useTranslations>; locale: string }) {
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:30");
  const [crossMidnight, setCrossMidnight] = useState(false);

  const fmt = useMemo(
    () => new Intl.NumberFormat(locale, { maximumFractionDigits: 6 }),
    [locale]
  );

  const result = useMemo(() => {
    const startSec = parseTimeString(startTime);
    const endSec = parseTimeString(endTime);
    if (isNaN(startSec) || isNaN(endSec)) return null;

    let diff = endSec - startSec;
    if (crossMidnight && diff <= 0) {
      diff += 86400; // add 24 hours
    } else if (!crossMidnight && diff < 0) {
      diff += 86400;
    }

    return {
      hms: formatHMS(diff),
      decimal: toDecimalHours(diff),
      totalMinutes: diff / 60,
      totalSeconds: diff,
    };
  }, [startTime, endTime, crossMidnight]);

  const inputClass =
    "mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900";

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">{t("timeDiff.startTime")}</span>
          <input
            type="text"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            placeholder="9:00 AM or 09:00"
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("timeDiff.endTime")}</span>
          <input
            type="text"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            placeholder="5:30 PM or 17:30"
            className={inputClass}
          />
        </label>
      </div>

      <label className="mt-3 flex cursor-pointer items-center gap-2">
        <input
          type="checkbox"
          checked={crossMidnight}
          onChange={(e) => setCrossMidnight(e.target.checked)}
          className="h-4 w-4 rounded border-slate-300"
        />
        <span className="text-sm">{t("timeDiff.crossMidnight")}</span>
      </label>

      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        {t("timeDiff.formatHint")}
      </p>

      <div aria-live="polite" className="mt-6 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
        {!result ? (
          <p className="text-sm text-slate-600 dark:text-slate-400">{t("empty")}</p>
        ) : (
          <dl className="grid gap-3 sm:grid-cols-2">
            <div className="rounded bg-emerald-50 p-3 dark:bg-emerald-900/20 sm:col-span-2">
              <dt className="text-xs font-medium text-emerald-900 dark:text-emerald-200">
                {t("result.total")}
              </dt>
              <dd className="mt-1 font-mono text-3xl font-bold tabular-nums">{result.hms}</dd>
            </div>
            <div className="rounded bg-slate-100 p-3 dark:bg-slate-800">
              <dt className="text-xs font-medium text-slate-600 dark:text-slate-400">
                {t("result.decimalHours")}
              </dt>
              <dd className="mt-1 font-mono text-2xl font-bold tabular-nums">
                {fmt.format(result.decimal)}
              </dd>
            </div>
            <div className="rounded bg-slate-100 p-3 dark:bg-slate-800">
              <dt className="text-xs font-medium text-slate-600 dark:text-slate-400">
                {t("result.totalMinutes")}
              </dt>
              <dd className="mt-1 font-mono text-2xl font-bold tabular-nums">
                {fmt.format(result.totalMinutes)}
              </dd>
            </div>
            <div className="rounded bg-slate-100 p-3 dark:bg-slate-800 sm:col-span-2">
              <dt className="text-xs font-medium text-slate-600 dark:text-slate-400">
                {t("result.totalSeconds")}
              </dt>
              <dd className="mt-1 font-mono text-xl font-bold tabular-nums">
                {fmt.format(result.totalSeconds)}
              </dd>
            </div>
          </dl>
        )}
      </div>
    </div>
  );
}

function HoursToDecimalTab({ t, locale }: { t: ReturnType<typeof useTranslations>; locale: string }) {
  const [mode, setMode] = useState<HDecMode>("hm-to-decimal");
  const [hours, setHours] = useState("1");
  const [minutes, setMinutes] = useState("30");
  const [decimalInput, setDecimalInput] = useState("1.5");

  const fmt = useMemo(
    () => new Intl.NumberFormat(locale, { maximumFractionDigits: 6 }),
    [locale]
  );

  const result = useMemo(() => {
    if (mode === "hm-to-decimal") {
      const h = parseFloat(hours) || 0;
      const m = parseFloat(minutes) || 0;
      if (hours === "" && minutes === "") return null;
      const totalSec = h * 3600 + m * 60;
      return {
        decimal: totalSec / 3600,
        totalMinutes: totalSec / 60,
        totalSeconds: totalSec,
        hms: formatHMS(totalSec),
      };
    } else {
      const dec = parseFloat(decimalInput);
      if (!isFinite(dec) || decimalInput === "") return null;
      const totalSec = Math.round(dec * 3600);
      const { h, m, s } = decimalToHMS(dec);
      return {
        decimal: dec,
        totalMinutes: totalSec / 60,
        totalSeconds: totalSec,
        hms: `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`,
      };
    }
  }, [mode, hours, minutes, decimalInput]);

  const inputClass =
    "mt-1 w-full rounded border border-slate-300 px-3 py-2 tabular-nums dark:border-slate-700 dark:bg-slate-900";

  return (
    <div>
      {/* Mode toggle */}
      <div className="mb-4 flex gap-2">
        {(["hm-to-decimal", "decimal-to-hm"] as HDecMode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`rounded px-3 py-1 text-sm ${
              mode === m
                ? "bg-brand-600 text-white"
                : "border border-slate-300 dark:border-slate-700"
            }`}
          >
            {t(`hoursDecimal.mode.${m}`)}
          </button>
        ))}
      </div>

      {mode === "hm-to-decimal" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium">{t("addSub.hours")}</span>
            <input
              inputMode="decimal"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              placeholder="0"
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">{t("addSub.minutes")}</span>
            <input
              inputMode="decimal"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              placeholder="0"
              className={inputClass}
            />
          </label>
        </div>
      ) : (
        <label className="block">
          <span className="text-sm font-medium">{t("hoursDecimal.decimalLabel")}</span>
          <input
            inputMode="decimal"
            value={decimalInput}
            onChange={(e) => setDecimalInput(e.target.value)}
            placeholder="1.5"
            className={inputClass}
          />
        </label>
      )}

      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        {t("hoursDecimal.payrollNote")}
      </p>

      <div aria-live="polite" className="mt-6 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
        {!result ? (
          <p className="text-sm text-slate-600 dark:text-slate-400">{t("empty")}</p>
        ) : (
          <dl className="grid gap-3 sm:grid-cols-2">
            <div className="rounded bg-emerald-50 p-3 dark:bg-emerald-900/20">
              <dt className="text-xs font-medium text-emerald-900 dark:text-emerald-200">
                {t("result.total")}
              </dt>
              <dd className="mt-1 font-mono text-3xl font-bold tabular-nums">{result.hms}</dd>
            </div>
            <div className="rounded bg-sky-50 p-3 dark:bg-sky-900/20">
              <dt className="text-xs font-medium text-sky-900 dark:text-sky-200">
                {t("result.decimalHours")}
              </dt>
              <dd className="mt-1 font-mono text-3xl font-bold tabular-nums">
                {fmt.format(result.decimal)}
              </dd>
            </div>
            <div className="rounded bg-slate-100 p-3 dark:bg-slate-800">
              <dt className="text-xs font-medium text-slate-600 dark:text-slate-400">
                {t("result.totalMinutes")}
              </dt>
              <dd className="mt-1 font-mono text-xl font-bold tabular-nums">
                {fmt.format(result.totalMinutes)}
              </dd>
            </div>
            <div className="rounded bg-slate-100 p-3 dark:bg-slate-800">
              <dt className="text-xs font-medium text-slate-600 dark:text-slate-400">
                {t("result.totalSeconds")}
              </dt>
              <dd className="mt-1 font-mono text-xl font-bold tabular-nums">
                {fmt.format(result.totalSeconds)}
              </dd>
            </div>
          </dl>
        )}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function HoursCalculator() {
  const t = useTranslations("tools.hours-calculator");
  const locale = useLocale();
  const [tab, setTab] = useState<Tab>("add-subtract");

  const tabs: { id: Tab; label: string }[] = [
    { id: "add-subtract", label: t("tabs.addSubtract") },
    { id: "time-difference", label: t("tabs.timeDifference") },
    { id: "hours-to-decimal", label: t("tabs.hoursToDecimal") },
  ];

  return (
    <div>
      {/* Tab bar */}
      <div
        role="tablist"
        className="mb-6 flex flex-wrap gap-2 border-b border-slate-200 pb-2 dark:border-slate-800"
      >
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`rounded-t px-4 py-2 text-sm font-medium transition-colors ${
              tab === id
                ? "border-b-2 border-brand-600 text-brand-700 dark:text-brand-400"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab panels */}
      {tab === "add-subtract" && (
        <div role="tabpanel">
          <AddSubtractTab t={t} locale={locale} />
        </div>
      )}
      {tab === "time-difference" && (
        <div role="tabpanel">
          <TimeDifferenceTab t={t} locale={locale} />
        </div>
      )}
      {tab === "hours-to-decimal" && (
        <div role="tabpanel">
          <HoursToDecimalTab t={t} locale={locale} />
        </div>
      )}
    </div>
  );
}
