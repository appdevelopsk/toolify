"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

function pad(n: number) {
  return String(Math.max(0, n)).padStart(2, "0");
}

export default function CountdownTimer() {
  const t = useTranslations("tools.countdown-timer");
  const locale = useLocale();
  const [target, setTarget] = useState("");
  const [title, setTitle] = useState("");
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const result = useMemo(() => {
    if (!target || now === null) return null;
    const ts = new Date(target).getTime();
    if (isNaN(ts)) return null;
    const diff = ts - now;
    const ended = diff <= 0;
    const abs = Math.abs(diff);
    const days = Math.floor(abs / 86400000);
    const hours = Math.floor((abs % 86400000) / 3600000);
    const minutes = Math.floor((abs % 3600000) / 60000);
    const seconds = Math.floor((abs % 60000) / 1000);
    return { days, hours, minutes, seconds, ended };
  }, [target, now]);

  const targetFmt = useMemo(() => {
    if (!target) return "";
    try {
      return new Intl.DateTimeFormat(locale, { dateStyle: "full", timeStyle: "short" }).format(new Date(target));
    } catch {
      return target;
    }
  }, [target, locale]);

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">{t("input.target")}</span>
          <input
            type="datetime-local"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.title")}</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("input.titlePlaceholder")}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          />
        </label>
      </div>

      <div
        aria-live="polite"
        className={`mt-6 rounded-lg border p-4 ${
          result
            ? result.ended
              ? "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-900/20"
              : "border-brand-200 bg-brand-50 dark:border-brand-900 dark:bg-brand-900/20"
            : "border-slate-200 dark:border-slate-800"
        }`}
      >
        {result ? (
          <>
            {title && <div className="mb-2 text-lg font-medium">{title}</div>}
            <div className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">
              {result.ended ? t("ended") : t("remaining")} • {targetFmt}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
              {(["days", "hours", "minutes", "seconds"] as const).map((unit) => {
                const v = result[unit];
                return (
                  <div key={unit} className="rounded bg-white/60 p-2 dark:bg-slate-900/60">
                    <div className="text-3xl font-bold tabular-nums sm:text-4xl">{unit === "days" ? v : pad(v)}</div>
                    <div className="text-xs uppercase text-slate-600 dark:text-slate-400">{t(`unit.${unit}`)}</div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="text-sm text-slate-600 dark:text-slate-400">{t("empty")}</div>
        )}
      </div>
    </div>
  );
}
