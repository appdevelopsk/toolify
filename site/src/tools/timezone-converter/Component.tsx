"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

const COMMON_TIMEZONES = [
  "UTC", "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
  "America/Sao_Paulo", "Europe/London", "Europe/Paris", "Europe/Berlin", "Europe/Moscow",
  "Africa/Cairo", "Asia/Dubai", "Asia/Kolkata", "Asia/Bangkok", "Asia/Singapore",
  "Asia/Shanghai", "Asia/Tokyo", "Asia/Seoul", "Australia/Sydney", "Pacific/Auckland",
];

function pad(n: number) { return String(n).padStart(2, "0"); }

function localNowIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function inTzString(date: Date, tz: string, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale, {
      timeZone: tz,
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit",
      hour12: false,
      timeZoneName: "short",
    }).format(date);
  } catch {
    return "(invalid)";
  }
}

export default function TimezoneConverter() {
  const t = useTranslations("tools.timezone-converter");
  const locale = useLocale();
  const [sourceTz, setSourceTz] = useState<string>("");
  const [targetTzs, setTargetTzs] = useState<string[]>(["America/New_York", "Europe/London", "Asia/Tokyo"]);
  const [dt, setDt] = useState<string>(localNowIso());

  useEffect(() => {
    if (!sourceTz) {
      try {
        setSourceTz(Intl.DateTimeFormat().resolvedOptions().timeZone);
      } catch {
        setSourceTz("UTC");
      }
    }
  }, [sourceTz]);

  // Interpret the local datetime-local string as a moment in sourceTz, return Date
  const sourceDate = useMemo(() => {
    if (!dt || !sourceTz) return null;
    // Parse pieces
    const m = dt.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
    if (!m) return null;
    const [, y, mo, d, h, mi] = m;
    // Try to find the UTC moment such that when displayed in sourceTz it shows the input. Two-step Newton-style:
    let guess = new Date(Date.UTC(+y!, +mo! - 1, +d!, +h!, +mi!));
    for (let i = 0; i < 3; i++) {
      const fmt = new Intl.DateTimeFormat("en-US", {
        timeZone: sourceTz,
        year: "numeric", month: "2-digit", day: "2-digit",
        hour: "2-digit", minute: "2-digit", hour12: false,
      }).formatToParts(guess);
      const parts: Record<string, string> = {};
      for (const p of fmt) parts[p.type] = p.value;
      const observedUtc = Date.UTC(+parts.year!, +parts.month! - 1, +parts.day!, +parts.hour! % 24, +parts.minute!);
      const diff = observedUtc - guess.getTime();
      if (diff === 0) break;
      guess = new Date(guess.getTime() - diff);
    }
    return guess;
  }, [dt, sourceTz]);

  function setNow() { setDt(localNowIso()); }
  function addTz(tz: string) {
    if (!targetTzs.includes(tz)) setTargetTzs((arr) => [...arr, tz]);
  }
  function removeTz(tz: string) { setTargetTzs((arr) => arr.filter((x) => x !== tz)); }

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">{t("input.sourceTz")}</span>
          <select value={sourceTz} onChange={(e) => setSourceTz(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
            {COMMON_TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.dt")}</span>
          <div className="mt-1 flex gap-2">
            <input type="datetime-local" value={dt} onChange={(e) => setDt(e.target.value)} className="flex-1 rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
            <button onClick={setNow} className="rounded border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800">{t("now")}</button>
          </div>
        </label>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-xs uppercase text-slate-600 dark:text-slate-400">{t("addTz")}:</span>
        <select onChange={(e) => { addTz(e.target.value); e.target.value = ""; }} className="rounded border border-slate-300 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900">
          <option value="">—</option>
          {COMMON_TIMEZONES.filter((tz) => !targetTzs.includes(tz)).map((tz) => <option key={tz} value={tz}>{tz}</option>)}
        </select>
      </div>

      <div aria-live="polite" className="mt-6 space-y-2">
        {targetTzs.map((tz) => (
          <div key={tz} className="flex items-center justify-between rounded border border-slate-200 px-4 py-3 dark:border-slate-800">
            <div>
              <div className="text-sm font-medium">{tz}</div>
              <div className="font-mono text-lg tabular-nums">
                {sourceDate ? inTzString(sourceDate, tz, locale) : "—"}
              </div>
            </div>
            <button onClick={() => removeTz(tz)} aria-label={t("remove")} className="text-slate-400 hover:text-red-600">×</button>
          </div>
        ))}
        {targetTzs.length === 0 && <div className="rounded border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-600 dark:text-slate-400 dark:border-slate-700">{t("empty")}</div>}
      </div>
    </div>
  );
}
