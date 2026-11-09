import { describe, expect, it } from "vitest";
import { diffYMD } from "./dateMath";

const date = (text: string) => new Date(text + "T00:00:00");

describe("age difference calendar arithmetic", () => {
  it("does not produce negative days across shorter months", () => {
    expect(diffYMD(date("2023-01-31"), date("2023-03-01"))).toEqual({
      y: 0, m: 1, d: 1, totalDays: 29,
    });
    expect(diffYMD(date("2024-01-31"), date("2024-03-01"))).toEqual({
      y: 0, m: 1, d: 1, totalDays: 30,
    });
  });

  it("handles leap days and end-of-month anniversaries", () => {
    expect(diffYMD(date("2024-02-29"), date("2025-02-28"))).toEqual({
      y: 1, m: 0, d: 0, totalDays: 365,
    });
    expect(diffYMD(date("2024-02-28"), date("2024-03-01"))).toEqual({
      y: 0, m: 0, d: 2, totalDays: 2,
    });
  });

  it("does not count daylight saving hours as missing or extra days", () => {
    expect(diffYMD(date("2026-03-07"), date("2026-03-09")).totalDays).toBe(2);
    expect(diffYMD(date("2026-11-01"), date("2026-11-03")).totalDays).toBe(2);
  });

  it("is symmetric and handles equal dates", () => {
    const a = date("1990-05-15");
    const b = date("1992-08-23");
    expect(diffYMD(a, b)).toEqual(diffYMD(b, a));
    expect(diffYMD(a, a)).toEqual({ y: 0, m: 0, d: 0, totalDays: 0 });
  });
});
