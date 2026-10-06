import { describe, expect, it } from "vitest";
import { addBusinessDays, addCalendar, countBusinessDays, localIso, outsideHolidayYears, parseLocalDate } from "./business";

const d = parseLocalDate;

describe("date-calculator business days", () => {
  it("default (no preset) skips weekends only — unchanged behaviour", () => {
    // Thu 2026-04-30 + 10 business days, weekends only → Thu 2026-05-14
    const r = addBusinessDays(d("2026-04-30"), 10, 1);
    expect(localIso(r.date)).toBe("2026-05-14");
    expect(r.skipped).toEqual([]);
  });

  it("JP preset skips Golden Week", () => {
    // May 4–6 2026 are holidays (May 3 is a Sunday) → Tue 2026-05-19
    const r = addBusinessDays(d("2026-04-30"), 10, 1, "JP");
    expect(localIso(r.date)).toBe("2026-05-19");
    expect(r.skipped.map((h) => h.date)).toEqual(["2026-05-04", "2026-05-05", "2026-05-06"]);
  });

  it("subtracting with US preset skips observed Independence Day", () => {
    // Mon 2026-07-06 − 1 business day: Fri 07-03 is the observed holiday → Thu 07-02
    expect(localIso(addBusinessDays(d("2026-07-06"), 1, -1, "US").date)).toBe("2026-07-02");
    expect(localIso(addBusinessDays(d("2026-07-06"), 1, -1).date)).toBe("2026-07-03");
  });

  it("counts business days in [from, to) and excludes preset holidays", () => {
    // July 2026: 23 weekdays from 07-01 to 07-31 inclusive → [07-01, 08-01)
    expect(countBusinessDays(d("2026-07-01"), d("2026-08-01")).business).toBe(23);
    const us = countBusinessDays(d("2026-07-01"), d("2026-08-01"), "US");
    expect(us.business).toBe(22);
    expect(us.skipped.map((h) => h.date)).toEqual(["2026-07-03"]);
  });

  it("flags ranges outside the built-in holiday years", () => {
    expect(outsideHolidayYears(d("2026-01-05"), d("2027-12-31"))).toBe(false);
    expect(outsideHolidayYears(d("2027-12-20"), d("2028-01-10"))).toBe(true);
  });

  it("calendar months clamp to the end of the target month", () => {
    expect(localIso(addCalendar(d("2026-01-31"), 0, 1, 0))).toBe("2026-02-28");
    expect(localIso(addCalendar(d("2028-01-31"), 0, 1, 0))).toBe("2028-02-29");
    expect(localIso(addCalendar(d("2028-02-29"), 1, 0, 0))).toBe("2029-02-28");
    expect(localIso(addCalendar(d("2026-03-31"), 0, -1, 0))).toBe("2026-02-28");
    // FAQ examples: "4 months less a day" and "5 years minus 262 days"
    expect(localIso(addCalendar(d("2026-11-05"), 0, 4, -1))).toBe("2027-03-04");
    expect(localIso(addCalendar(d("2026-01-01"), 5, 0, -262))).toBe("2030-04-14");
    expect(localIso(addCalendar(d("2026-12-15"), 0, 2, 20))).toBe("2027-03-07");
  });

  it("FAQ example: 205 business days from 2026-07-16", () => {
    expect(localIso(addBusinessDays(d("2026-07-16"), 205, 1).date)).toBe("2027-04-29");
    expect(localIso(addBusinessDays(d("2026-07-16"), 205, 1, "US").date)).toBe("2027-05-11");
  });
});
