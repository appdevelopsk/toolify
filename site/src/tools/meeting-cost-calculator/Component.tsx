"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

const ANNUAL_HOURS = 2080; // 52 weeks × 40 hours

type Mode = "standard" | "timer";

function getCostColor(cost: number): string {
  if (cost < 100) return "border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-900/20";
  if (cost < 500) return "border-yellow-300 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20";
  if (cost < 2000) return "border-orange-300 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20";
  return "border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-900/20";
}

function getCostTextColor(cost: number): string {
  if (cost < 100) return "text-green-700 dark:text-green-400";
  if (cost < 500) return "text-yellow-700 dark:text-yellow-400";
  if (cost < 2000) return "text-orange-700 dark:text-orange-400";
  return "text-red-700 dark:text-red-400";
}

export default function MeetingCostCalculator() {
  const t = useTranslations("tools.meeting-cost-calculator");
  const locale = useLocale();

  const [mode, setMode] = useState<Mode>("standard");

  // Standard mode inputs
  const [attendees, setAttendees] = useState("8");
  const [annualSalary, setAnnualSalary] = useState(locale === "ja" ? "6000000" : "100000");
  const [durationHours, setDurationHours] = useState("1");
  const [durationMinutes, setDurationMinutes] = useState("0");
  const [showOverhead, setShowOverhead] = useState(false);
  const [overheadMultiplier, setOverheadMultiplier] = useState("1.4");

  // Timer mode state
  const [timerRunning, setTimerRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currency = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: "currency",
        currency: locale === "ja" ? "JPY" : "USD",
        maximumFractionDigits: locale === "ja" ? 0 : 2,
      }),
    [locale],
  );

  const fmt2 = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }), [locale]);

  // Parse shared inputs
  const parsedAttendees = useMemo(() => {
    const v = parseFloat(attendees);
    return isFinite(v) && v >= 1 ? Math.round(v) : null;
  }, [attendees]);

  const parsedSalary = useMemo(() => {
    const v = parseFloat(annualSalary);
    return isFinite(v) && v > 0 ? v : null;
  }, [annualSalary]);

  const parsedMultiplier = useMemo(() => {
    const v = parseFloat(overheadMultiplier);
    return isFinite(v) && v >= 1 && v <= 3 ? v : 1.4;
  }, [overheadMultiplier]);

  // Hourly cost per person (shared formula base)
  const hourlyPerPerson = useMemo(() => {
    if (parsedSalary === null) return null;
    return parsedSalary / ANNUAL_HOURS;
  }, [parsedSalary]);

  // Standard mode result
  const standardResult = useMemo(() => {
    if (parsedAttendees === null || hourlyPerPerson === null) return null;
    const h = parseFloat(durationHours);
    const m = parseFloat(durationMinutes);
    const hours = (isFinite(h) ? h : 0) + (isFinite(m) ? m : 0) / 60;
    if (hours <= 0) return null;

    const totalCost = parsedAttendees * hourlyPerPerson * hours * parsedMultiplier;
    const costPerMinute = parsedAttendees * hourlyPerPerson * parsedMultiplier;
    const salaryHoursConsumed = parsedAttendees * hours;

    return { totalCost, costPerMinute, salaryHoursConsumed, durationHours: hours };
  }, [parsedAttendees, hourlyPerPerson, durationHours, durationMinutes, parsedMultiplier]);

  // Timer mode result
  const timerResult = useMemo(() => {
    if (parsedAttendees === null || hourlyPerPerson === null) return null;
    const hours = elapsedSeconds / 3600;
    const totalCost = parsedAttendees * hourlyPerPerson * hours * parsedMultiplier;
    const costPerMinute = parsedAttendees * hourlyPerPerson * parsedMultiplier;
    const salaryHoursConsumed = parsedAttendees * hours;
    return { totalCost, costPerMinute, salaryHoursConsumed };
  }, [parsedAttendees, hourlyPerPerson, elapsedSeconds, parsedMultiplier]);

  const startTimer = useCallback(() => {
    if (timerRunning) return;
    setTimerRunning(true);
    intervalRef.current = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
  }, [timerRunning]);

  const stopTimer = useCallback(() => {
    setTimerRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const resetTimer = useCallback(() => {
    stopTimer();
    setElapsedSeconds(0);
  }, [stopTimer]);

  // Clean up on unmount or mode change
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    stopTimer();
    setElapsedSeconds(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const formatElapsed = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
  };

  const inputClass =
    "mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900";

  const activeResult = mode === "timer" ? timerResult : standardResult;
  const showEmailNote = activeResult !== null && activeResult.totalCost > 1000;

  return (
    <div>
      {/* Mode tabs */}
      <div className="mb-6 flex gap-2 rounded-lg border border-slate-200 p-1 dark:border-slate-800 w-fit">
        {(["standard", "timer"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`rounded px-4 py-1.5 text-sm font-medium transition-colors ${
              mode === m
                ? "bg-brand-600 text-white dark:bg-brand-500"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            }`}
          >
            {t(m === "standard" ? "standardMode" : "timerMode")}
          </button>
        ))}
      </div>

      {/* Shared inputs */}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">{t("input.attendees")}</span>
          <input
            inputMode="numeric"
            value={attendees}
            onChange={(e) => setAttendees(e.target.value)}
            className={inputClass}
            placeholder="8"
            min="1"
            max="100"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.averageSalary")}</span>
          <input
            inputMode="decimal"
            value={annualSalary}
            onChange={(e) => setAnnualSalary(e.target.value)}
            className={inputClass}
            placeholder={locale === "ja" ? "6000000" : "100000"}
          />
        </label>
      </div>

      {/* Standard mode: duration */}
      {mode === "standard" && (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium">{t("input.durationHours")}</span>
            <input
              inputMode="numeric"
              value={durationHours}
              onChange={(e) => setDurationHours(e.target.value)}
              className={inputClass}
              placeholder="1"
              min="0"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">{t("input.durationMinutes")}</span>
            <input
              inputMode="numeric"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
              className={inputClass}
              placeholder="0"
              min="0"
              max="59"
            />
          </label>
        </div>
      )}

      {/* Overhead multiplier toggle */}
      <div className="mt-4">
        <button
          type="button"
          onClick={() => setShowOverhead((v) => !v)}
          className="text-sm text-brand-600 hover:underline dark:text-brand-400"
        >
          {showOverhead ? "▾" : "▸"} {t("input.overheadMultiplier")} ({parsedMultiplier}×)
        </button>
        {showOverhead && (
          <div className="mt-2">
            <input
              type="range"
              min="1"
              max="3"
              step="0.1"
              value={overheadMultiplier}
              onChange={(e) => setOverheadMultiplier(e.target.value)}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-slate-500">
              <span>1.0×</span>
              <span>{parsedMultiplier}×</span>
              <span>3.0×</span>
            </div>
          </div>
        )}
      </div>

      {/* Timer controls */}
      {mode === "timer" && (
        <div className="mt-6 flex flex-col items-center gap-4">
          <div className="font-mono text-5xl font-bold tabular-nums text-slate-800 dark:text-slate-100">
            {formatElapsed(elapsedSeconds)}
          </div>
          <div className="flex gap-3">
            {!timerRunning ? (
              <button
                onClick={startTimer}
                disabled={parsedAttendees === null || hourlyPerPerson === null}
                className="rounded bg-green-600 px-6 py-2 font-medium text-white hover:bg-green-700 disabled:opacity-50"
              >
                {t("start")}
              </button>
            ) : (
              <button
                onClick={stopTimer}
                className="rounded bg-yellow-500 px-6 py-2 font-medium text-white hover:bg-yellow-600"
              >
                {t("stop")}
              </button>
            )}
            <button
              onClick={resetTimer}
              className="rounded border border-slate-300 px-6 py-2 font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              {t("reset")}
            </button>
          </div>
        </div>
      )}

      {/* Results */}
      <div
        aria-live="polite"
        className={`mt-6 rounded-lg border p-4 transition-colors ${
          activeResult && activeResult.totalCost > 0
            ? getCostColor(activeResult.totalCost)
            : "border-slate-200 dark:border-slate-800"
        }`}
      >
        {activeResult && (mode === "standard" ? activeResult.totalCost > 0 : elapsedSeconds > 0) ? (
          <>
            <dl className="grid gap-4 sm:grid-cols-3">
              <div>
                <dt className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  {t("result.totalCost")}
                </dt>
                <dd
                  className={`mt-1 text-3xl font-bold tabular-nums ${getCostTextColor(activeResult.totalCost)}`}
                >
                  {currency.format(activeResult.totalCost)}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  {t("result.costPerMinute")}
                </dt>
                <dd className="mt-1 text-xl font-bold tabular-nums">
                  {currency.format(activeResult.costPerMinute)}
                  <span className="ml-1 text-sm font-normal text-slate-500">/min</span>
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  {t("result.salaryHoursConsumed")}
                </dt>
                <dd className="mt-1 text-xl font-bold tabular-nums">
                  {fmt2.format(activeResult.salaryHoursConsumed)}
                  <span className="ml-1 text-sm font-normal text-slate-500">person-hrs</span>
                </dd>
              </div>
            </dl>
            {showEmailNote && (
              <p className="mt-4 rounded bg-red-100 px-3 py-2 text-sm font-medium text-red-800 dark:bg-red-900/30 dark:text-red-300">
                {t("result.couldBeEmail")}
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-slate-600 dark:text-slate-400">{t("empty")}</p>
        )}
      </div>
    </div>
  );
}
