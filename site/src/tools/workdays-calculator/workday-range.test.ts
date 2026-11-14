import { describe, expect, it } from "vitest";
import { countWorkdays, isoDate } from "./workday-range";

const d = (date: string) => new Date(date + "T00:00:00");
const weekend = new Set([0, 6]);
const none = new Set<string>();

describe("workdays inclusive/exclusive boundaries", () => {
  it("counts the two weekdays Friday-to-Monday inclusively", () => {
    expect(countWorkdays(d("2026-01-02"), d("2026-01-05"), weekend, none))
      .toEqual({ workdays: 2, weekendDays: 2, holidayDays: 0, total: 4 });
  });
  it("excludes both boundary weekdays without subtracting weekend days", () => {
    expect(countWorkdays(d("2026-01-02"), d("2026-01-05"), weekend, none, true))
      .toEqual({ workdays: 0, weekendDays: 2, holidayDays: 0, total: 2 });
  });
  it("does not subtract two workdays when Saturday is a boundary", () => {
    expect(countWorkdays(d("2026-01-03"), d("2026-01-05"), weekend, none, true))
      .toEqual({ workdays: 0, weekendDays: 1, holidayDays: 0, total: 1 });
  });
  it("same date exclusive has zero calendar days, not negative days", () => {
    expect(countWorkdays(d("2026-01-05"), d("2026-01-05"), weekend, none, true))
      .toEqual({ workdays: 0, weekendDays: 0, holidayDays: 0, total: 0 });
  });
  it("adjacent weekdays exclusive has zero days", () => {
    expect(countWorkdays(d("2026-01-05"), d("2026-01-06"), weekend, none, true).total).toBe(0);
  });
  it("excludes listed holiday inside range and honors a holiday on endpoint", () => {
    const holidays = new Set(["2026-01-05", "2026-01-06"]);
    expect(countWorkdays(d("2026-01-05"), d("2026-01-07"), weekend, holidays, true))
      .toEqual({ workdays: 0, weekendDays: 0, holidayDays: 1, total: 1 });
  });
  it("supports customized Saturday workday rules", () => {
    expect(countWorkdays(d("2026-01-02"), d("2026-01-05"), new Set([0]), none, true))
      .toEqual({ workdays: 1, weekendDays: 1, holidayDays: 0, total: 2 });
  });
  it("rejects reversed or invalid ranges without negative counts", () => {
    expect(countWorkdays(d("2026-01-06"), d("2026-01-02"), weekend, none, true).total).toBe(0);
    expect(countWorkdays(new Date(NaN), d("2026-01-02"), weekend, none).total).toBe(0);
  });
  it("uses local calendar date formatting even in offset timezones", () => {
    expect(isoDate(d("2026-01-05"))).toBe("2026-01-05");
  });
});
