// Business-day arithmetic for the date calculator.
// Holiday data is shared with the workdays calculator (same presets, same years).
import {
  HOLIDAY_PRESETS,
  HOLIDAY_YEARS,
  type HolidayCountry,
  type HolidayEntry,
} from "../workdays-calculator/holidays";

export type { HolidayCountry, HolidayEntry };
export const HOLIDAY_PRESET_OPTIONS = ["", "US", "JP", "UK", "DE"] as const;

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/** "yyyy-mm-dd" → local midnight (not UTC, so getDay()/display match the picked date in every time zone). */
export function parseLocalDate(s: string): Date {
  return new Date(`${s}T00:00:00`);
}

/** Local calendar date → "yyyy-mm-dd" (toISOString would shift the day east of UTC). */
export function localIso(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/**
 * Calendar arithmetic: add years and months first, clamping to the last day of the
 * target month (Jan 31 + 1 month = Feb 28/29, not Mar 3 as raw setMonth gives), then days.
 * Negative values subtract.
 */
export function addCalendar(d: Date, years: number, months: number, days: number): Date {
  const first = new Date(d.getFullYear() + years, d.getMonth() + months, 1);
  const lastDay = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  return new Date(first.getFullYear(), first.getMonth(), Math.min(d.getDate(), lastDay) + days);
}

function holidayMap(preset: "" | HolidayCountry): Map<string, HolidayEntry> {
  const m = new Map<string, HolidayEntry>();
  if (preset) for (const h of HOLIDAY_PRESETS[preset]) m.set(h.date, h);
  return m;
}

const isWeekend = (d: Date) => d.getDay() === 0 || d.getDay() === 6;

/**
 * Move `n` business days from `start` (sign = +1 forward, -1 backward).
 * The start date itself is not counted. Weekends are always skipped; with a preset,
 * that country's public holidays on weekdays are skipped too (and returned).
 */
export function addBusinessDays(
  start: Date,
  n: number,
  sign: 1 | -1,
  preset: "" | HolidayCountry = "",
): { date: Date; skipped: HolidayEntry[] } {
  const hol = holidayMap(preset);
  const skipped: HolidayEntry[] = [];
  const out = new Date(start);
  let remaining = Math.abs(n);
  while (remaining > 0) {
    out.setDate(out.getDate() + sign);
    if (isWeekend(out)) continue;
    const h = hol.get(localIso(out));
    if (h) {
      skipped.push(h);
      continue;
    }
    remaining--;
  }
  return { date: out, skipped };
}

/**
 * Business days in [from, to) — from inclusive, to exclusive (unchanged from the original
 * date calculator). With a preset, weekday public holidays are excluded and returned.
 */
export function countBusinessDays(
  from: Date,
  to: Date,
  preset: "" | HolidayCountry = "",
): { business: number; skipped: HolidayEntry[] } {
  const hol = holidayMap(preset);
  const skipped: HolidayEntry[] = [];
  let business = 0;
  const cursor = new Date(from);
  while (cursor < to) {
    if (!isWeekend(cursor)) {
      const h = hol.get(localIso(cursor));
      if (h) skipped.push(h);
      else business++;
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return { business, skipped };
}

/** True when any date in [a, b] falls outside the years covered by the built-in holiday data. */
export function outsideHolidayYears(a: Date, b: Date): boolean {
  const lo = Math.min(a.getFullYear(), b.getFullYear());
  const hi = Math.max(a.getFullYear(), b.getFullYear());
  const first: number = HOLIDAY_YEARS[0];
  const last: number = HOLIDAY_YEARS[HOLIDAY_YEARS.length - 1] ?? first;
  return lo < first || hi > last;
}
