/**
 * Calendar-day arithmetic for the age difference tool.
 *
 * Dates are treated as calendar dates, not elapsed milliseconds between
 * local midnights (which can be 23 or 25 hours across DST transitions).
 */
function utcDay(date: Date): number {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
}

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}

function monthAnchor(start: Date, months: number): number {
  const firstOfMonth = new Date(Date.UTC(start.getFullYear(), start.getMonth() + months, 1));
  const year = firstOfMonth.getUTCFullYear();
  const month = firstOfMonth.getUTCMonth();
  // Clamp long-month birthdays to the last day of a shorter month.
  return Date.UTC(year, month, Math.min(start.getDate(), daysInMonth(year, month)));
}

export function diffYMD(a: Date, b: Date): { y: number; m: number; d: number; totalDays: number } {
  const aDay = utcDay(a);
  const bDay = utcDay(b);
  if (!Number.isFinite(aDay) || !Number.isFinite(bDay)) throw new RangeError("Invalid date");

  const earlier = aDay <= bDay ? a : b;
  const later = aDay <= bDay ? b : a;
  const laterDay = Math.max(aDay, bDay);
  let totalMonths = (later.getFullYear() - earlier.getFullYear()) * 12
    + later.getMonth() - earlier.getMonth();

  // Compare to the anniversary in the target month, not just the numeric
  // day-of-month: January 31 -> March 1 is 1 month + 1 day, never a
  // negative number of days.
  if (monthAnchor(earlier, totalMonths) > laterDay) totalMonths -= 1;
  const days = Math.round((laterDay - monthAnchor(earlier, totalMonths)) / 86_400_000);

  return {
    y: Math.floor(totalMonths / 12),
    m: totalMonths % 12,
    d: days,
    totalDays: Math.round((laterDay - Math.min(aDay, bDay)) / 86_400_000),
  };
}
