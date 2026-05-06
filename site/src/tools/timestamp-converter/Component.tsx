"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

type Mode = "fromTimestamp" | "fromDate";
type Unit = "seconds" | "milliseconds";

function pad(n: number, w = 2) { return String(n).padStart(w, "0"); }
function isoOf(d: Date) { return d.toISOString(); }
function localOf(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export default function TimestampConverter() {
  const t = useTranslations("tools.timestamp-converter");
  const locale = useLocale();
  const [mode, setMode] = useState<Mode>("fromTimestamp");
  const [unit, setUnit] = useState<Unit>("seconds");
  const [tsInput, setTsInput] = useState("");
  const [dateInput, setDateInput] = useState("");
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const result = useMemo(() => {
    if (mode === "fromTimestamp") {
      const v = parseFloat(tsInput);
      if (!isFinite(v)) return null;
      const ms = unit === "seconds" ? v * 1000 : v;
      const d = new Date(ms);
      if (isNaN(d.getTime())) return null;
      return { date: d, ms };
    } else {
      if (!dateInput) return null;
      const d = new Date(dateInput);
      if (isNaN(d.getTime())) return null;
      return { date: d, ms: d.getTime() };
    }
  }, [mode, unit, tsInput, dateInput]);

  const dateFmt = useMemo(() => new Intl.DateTimeFormat(locale, { dateStyle: "full", timeStyle: "long" }), [locale]);

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-md border border-slate-300 dark:border-slate-700">
          <button onClick={() => setMode("fromTimestamp")} className={`px-3 py-1.5 text-sm ${mode === "fromTimestamp" ? "bg-brand-600 text-white" : ""}`}>
            {t("mode.fromTimestamp")}
          </button>
          <button onClick={() => setMode("fromDate")} className={`px-3 py-1.5 text-sm ${mode === "fromDate" ? "bg-brand-600 text-white" : ""}`}>
            {t("mode.fromDate")}
          </button>
        </div>
        {mode === "fromTimestamp" && (
          <div className="inline-flex rounded-md border border-slate-300 dark:border-slate-700">
            <button onClick={() => setUnit("seconds")} className={`px-3 py-1.5 text-sm ${unit === "seconds" ? "bg-brand-600 text-white" : ""}`}>
              {t("unit.seconds")}
            </button>
            <button onClick={() => setUnit("milliseconds")} className={`px-3 py-1.5 text-sm ${unit === "milliseconds" ? "bg-brand-600 text-white" : ""}`}>
              {t("unit.milliseconds")}
            </button>
          </div>
        )}
      </div>

      {mode === "fromTimestamp" ? (
        <label className="block">
          <span className="text-sm font-medium">{t("input.timestamp")}</span>
          <input inputMode="numeric" value={tsInput} onChange={(e) => setTsInput(e.target.value)} placeholder={unit === "seconds" ? "1735689600" : "1735689600000"} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-mono dark:border-slate-700 dark:bg-slate-900" />
        </label>
      ) : (
        <label className="block">
          <span className="text-sm font-medium">{t("input.date")}</span>
          <input type="datetime-local" step="1" value={dateInput} onChange={(e) => setDateInput(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
        </label>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          onClick={() => {
            if (mode === "fromTimestamp") {
              const v = (now ?? Date.now()) / (unit === "seconds" ? 1000 : 1);
              setTsInput(String(Math.floor(v)));
            } else {
              const d = new Date();
              setDateInput(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`);
            }
          }}
          className="rounded border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          {t("now")}
        </button>
        {now !== null && (
          <span className="self-center text-xs text-slate-500">
            {t("currentTimestamp")}: <code className="font-mono">{Math.floor(now / 1000)}</code>
          </span>
        )}
      </div>

      <div aria-live="polite" className={`mt-6 rounded-lg border p-4 ${result ? "border-brand-200 bg-brand-50 dark:border-brand-900 dark:bg-brand-900/20" : "border-slate-200 dark:border-slate-800"}`}>
        {result ? (
          <dl className="grid gap-2 text-sm">
            <Row label={t("result.timestampSec")} value={String(Math.floor(result.ms / 1000))} mono />
            <Row label={t("result.timestampMs")} value={String(result.ms)} mono />
            <Row label={t("result.iso")} value={isoOf(result.date)} mono />
            <Row label={t("result.local")} value={localOf(result.date)} mono />
            <Row label={t("result.locale")} value={dateFmt.format(result.date)} />
            <Row label={t("result.relative")} value={relativeFromNow(result.ms, now ?? Date.now(), t)} />
          </dl>
        ) : (
          <div className="text-sm text-slate-500">{t("empty")}</div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-slate-200 py-1 dark:border-slate-800">
      <dt className="text-slate-500">{label}</dt>
      <dd className={`text-right ${mono ? "font-mono" : ""}`}>{value}</dd>
    </div>
  );
}

function relativeFromNow(then: number, now: number, t: (k: string, p?: Record<string, number | string>) => string): string {
  const diffMs = then - now;
  const past = diffMs < 0;
  const abs = Math.abs(diffMs);
  const days = Math.floor(abs / 86400000);
  const hours = Math.floor((abs % 86400000) / 3600000);
  const minutes = Math.floor((abs % 3600000) / 60000);
  if (abs < 60000) return past ? t("relative.justPast") : t("relative.justNow");
  if (days > 0) return past ? t("relative.daysAgo", { n: days }) : t("relative.daysFromNow", { n: days });
  if (hours > 0) return past ? t("relative.hoursAgo", { n: hours }) : t("relative.hoursFromNow", { n: hours });
  return past ? t("relative.minutesAgo", { n: minutes }) : t("relative.minutesFromNow", { n: minutes });
}
