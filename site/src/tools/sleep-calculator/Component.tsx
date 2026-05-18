"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

type Mode = "wakeUp" | "bedtime";

const FALL_ASLEEP_MIN = 14;
const CYCLE_MIN = 90;
const CYCLES = [6, 5, 4] as const;

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function nowTimeString() {
  const d = new Date();
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function parseTime(value: string): number | null {
  const parts = value.split(":");
  if (parts.length < 2) return null;
  const rawH = parts[0];
  const rawM = parts[1];
  if (rawH === undefined || rawM === undefined) return null;
  const h = parseInt(rawH, 10);
  const m = parseInt(rawM, 10);
  if (!isFinite(h) || !isFinite(m)) return null;
  return h * 60 + m;
}

function minutesToTimeString(totalMinutes: number): string {
  const wrapped = ((totalMinutes % 1440) + 1440) % 1440;
  const h = Math.floor(wrapped / 60);
  const m = wrapped % 60;
  return `${pad(h)}:${pad(m)}`;
}

function minutesToDuration(min: number): { h: number; m: number } {
  return { h: Math.floor(min / 60), m: min % 60 };
}

interface SleepResult {
  cycles: number;
  time: string;
  sleepMinutes: number;
}

function calcWakeUpMode(wakeMinutes: number): SleepResult[] {
  return CYCLES.map((n) => {
    const sleepMinutes = n * CYCLE_MIN + FALL_ASLEEP_MIN;
    const bedtime = wakeMinutes - sleepMinutes;
    return {
      cycles: n,
      time: minutesToTimeString(bedtime),
      sleepMinutes,
    };
  });
}

function calcBedtimeMode(bedMinutes: number): SleepResult[] {
  return CYCLES.map((n) => {
    const sleepMinutes = n * CYCLE_MIN;
    const wakeTime = bedMinutes + FALL_ASLEEP_MIN + sleepMinutes;
    return {
      cycles: n,
      time: minutesToTimeString(wakeTime),
      sleepMinutes,
    };
  });
}

export default function SleepCalculator() {
  const t = useTranslations("tools.sleep-calculator");
  const [mode, setMode] = useState<Mode>("wakeUp");
  const [timeValue, setTimeValue] = useState(nowTimeString);

  const results = useMemo((): SleepResult[] | null => {
    const parsed = parseTime(timeValue);
    if (parsed === null) return null;
    if (mode === "wakeUp") return calcWakeUpMode(parsed);
    return calcBedtimeMode(parsed);
  }, [mode, timeValue]);

  return (
    <div>
      {/* Mode toggle */}
      <div className="mb-4 inline-flex rounded-md border border-slate-300 dark:border-slate-700">
        <button
          onClick={() => setMode("wakeUp")}
          className={`px-3 py-1.5 text-sm ${mode === "wakeUp" ? "bg-brand-600 text-white" : ""}`}
        >
          {t("mode.wakeUp")}
        </button>
        <button
          onClick={() => setMode("bedtime")}
          className={`px-3 py-1.5 text-sm ${mode === "bedtime" ? "bg-brand-600 text-white" : ""}`}
        >
          {t("mode.bedtime")}
        </button>
      </div>

      {/* Time input */}
      <label className="block">
        <span className="text-sm font-medium">{t(`input.${mode}`)}</span>
        <input
          type="time"
          value={timeValue}
          onChange={(e) => setTimeValue(e.target.value)}
          className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
        />
      </label>

      {/* Results */}
      <div aria-live="polite" className="mt-6">
        {results ? (
          <>
            <p className="mb-3 text-sm font-medium text-slate-700 dark:text-slate-300">
              {t(`result.${mode}`)}
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {results.map(({ cycles, time, sleepMinutes }) => {
                const isRecommended = cycles === 5;
                const dur = minutesToDuration(sleepMinutes - (mode === "wakeUp" ? FALL_ASLEEP_MIN : 0));
                const actualSleepMin = mode === "wakeUp" ? sleepMinutes - FALL_ASLEEP_MIN : sleepMinutes;
                const displayDur = minutesToDuration(actualSleepMin);
                return (
                  <div
                    key={cycles}
                    className={`relative rounded-lg border p-4 ${
                      isRecommended
                        ? "border-brand-400 bg-brand-50 dark:border-brand-600 dark:bg-brand-900/20"
                        : "border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    {isRecommended && (
                      <span className="absolute -top-2.5 left-3 rounded-full bg-brand-600 px-2 py-0.5 text-xs font-medium text-white">
                        {t("recommend")}
                      </span>
                    )}
                    <div className="text-2xl font-bold tabular-nums">{time}</div>
                    <div className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                      {t("result.cycles", { n: cycles })}
                    </div>
                    <div className="mt-0.5 text-sm text-slate-500 dark:text-slate-500">
                      {t("result.duration", { h: displayDur.h, m: displayDur.m })}
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="mt-3 text-xs text-slate-500 dark:text-slate-500">
              {t("result.fallAsleep")}
            </p>
          </>
        ) : (
          <div className="rounded-lg border border-slate-200 p-4 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-400">
            {t("empty")}
          </div>
        )}
      </div>
    </div>
  );
}
