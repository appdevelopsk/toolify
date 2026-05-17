"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

const SYNODIC = 29.53058868;
const KNOWN_NEW_MOON = Date.UTC(2000, 0, 6, 18, 14, 0); // 2000-01-06 18:14 UTC

function moonAge(d: Date): number {
  const diff = (d.getTime() - KNOWN_NEW_MOON) / 86400000;
  return ((diff % SYNODIC) + SYNODIC) % SYNODIC;
}

function phaseId(age: number): string {
  if (age < 1.0) return "new";
  if (age < 6.5) return "waxingCrescent";
  if (age < 8.5) return "firstQuarter";
  if (age < 13.5) return "waxingGibbous";
  if (age < 15.0) return "full";
  if (age < 21.0) return "waningGibbous";
  if (age < 23.0) return "lastQuarter";
  if (age < 28.5) return "waningCrescent";
  return "new";
}

function phaseEmoji(id: string): string {
  return ({
    new: "🌑",
    waxingCrescent: "🌒",
    firstQuarter: "🌓",
    waxingGibbous: "🌔",
    full: "🌕",
    waningGibbous: "🌖",
    lastQuarter: "🌗",
    waningCrescent: "🌘",
  } as const)[id] ?? "🌑";
}

function illumination(age: number): number {
  const phaseAngle = (age / SYNODIC) * 2 * Math.PI;
  return (1 - Math.cos(phaseAngle)) / 2;
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function nextEvent(from: Date, target: number): Date {
  const ageNow = moonAge(from);
  let daysToAdd = (target - ageNow + SYNODIC) % SYNODIC;
  if (daysToAdd < 0.5) daysToAdd += SYNODIC; // Avoid same-day if just passed
  const result = new Date(from);
  result.setDate(result.getDate() + Math.floor(daysToAdd));
  return result;
}

export default function MoonPhaseCalculator() {
  const t = useTranslations("tools.moon-phase-calculator");
  const locale = useLocale();
  const [date, setDate] = useState(isoDate(new Date()));

  const result = useMemo(() => {
    const d = new Date(date + "T12:00:00");
    if (isNaN(d.getTime())) return null;
    const age = moonAge(d);
    const id = phaseId(age);
    const ill = illumination(age);
    const nextNew = nextEvent(d, 0);
    const nextFull = nextEvent(d, SYNODIC / 2);
    return { age, id, illumination: ill, nextNew, nextFull };
  }, [date]);

  const fmt = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }), [locale]);
  const fmtDate = useMemo(() => new Intl.DateTimeFormat(locale, { year: "numeric", month: "long", day: "numeric" }), [locale]);

  return (
    <div>
      <label className="block">
        <span className="text-sm font-medium">{t("input.date")}</span>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
      </label>

      <div aria-live="polite" className="mt-6 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
        {result ? (
          <div>
            <div className="rounded bg-slate-100 p-4 text-center dark:bg-slate-800">
              <div className="text-7xl">{phaseEmoji(result.id)}</div>
              <div className="mt-2 text-xl font-bold">{t(`phase.${result.id}`)}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">{t("result.illumination")}: {Math.round(result.illumination * 100)}%</div>
            </div>
            <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
              <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800">
                <dt>{t("result.moonAge")}</dt>
                <dd className="tabular-nums">{fmt.format(result.age)} {t("result.days")}</dd>
              </div>
              <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800">
                <dt>{t("result.phaseAngle")}</dt>
                <dd className="tabular-nums">{fmt.format((result.age / SYNODIC) * 360)}°</dd>
              </div>
              <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800">
                <dt>{t("result.nextNewMoon")}</dt>
                <dd className="tabular-nums">{fmtDate.format(result.nextNew)}</dd>
              </div>
              <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800">
                <dt>{t("result.nextFullMoon")}</dt>
                <dd className="tabular-nums">{fmtDate.format(result.nextFull)}</dd>
              </div>
            </dl>
          </div>
        ) : (
          <div className="text-sm text-slate-600 dark:text-slate-400">{t("empty")}</div>
        )}
      </div>
    </div>
  );
}
