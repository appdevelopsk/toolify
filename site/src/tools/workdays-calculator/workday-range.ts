/**
 * Calendar-day workday counting, using local dates (never UTC ISO conversion).
 * Both ends are included by default. In exclusive mode only dates strictly
 * between the start/end are counted, so holidays/weekends on the boundaries
 * are never incorrectly subtracted from a result.
 */
export type WorkdayRangeResult = {
  workdays: number;
  weekendDays: number;
  holidayDays: number;
  total: number;
};

export function isoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function countWorkdays(
  start: Date,
  end: Date,
  weekend: Set<number>,
  holidays: Set<string>,
  excludeEndpoints = false,
): WorkdayRangeResult {
  const zero = { workdays: 0, weekendDays: 0, holidayDays: 0, total: 0 };
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) return zero;
  let workdays = 0;
  let weekendDays = 0;
  let holidayDays = 0;
  let total = 0;
  const cur = new Date(start);
  const last = new Date(end);
  if (excludeEndpoints) {
    cur.setDate(cur.getDate() + 1);
    last.setDate(last.getDate() - 1);
  }
  while (cur <= last) {
    total++;
    if (weekend.has(cur.getDay())) {
      weekendDays++;
    } else if (holidays.has(isoDate(cur))) {
      holidayDays++;
    } else {
      workdays++;
    }
    cur.setDate(cur.getDate() + 1);
  }
  return { workdays, weekendDays, holidayDays, total };
}
