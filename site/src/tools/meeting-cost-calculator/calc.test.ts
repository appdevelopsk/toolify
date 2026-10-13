import { describe, expect, it } from "vitest";
import { ANNUAL_HOURS, hourlyRate, meetingCost } from "./calc";

const r2 = (n: number) => Math.round(n * 100) / 100;

describe("meeting-cost-calculator", () => {
  it("uses 2,080 hours per year (40 × 52)", () => {
    expect(ANNUAL_HOURS).toBe(2080);
    expect(r2(hourlyRate(100000))).toBe(48.08);
  });

  it("the article's worked example: 8 × ($100,000 ÷ 2080) × 1 h × 1.4 = $538", () => {
    const r = meetingCost(8, 100000, 1, 1.4)!;
    expect(r2(r.totalCost)).toBe(538.46);
    expect(Math.round(r.totalCost)).toBe(538);
    expect(r.personHours).toBe(8);
    // held weekly for a year ≈ $28,000 (the article's figure)
    expect(Math.round(r.totalCost * 52)).toBe(28000);
  });

  it("cost per minute is the hourly burn divided by 60, independent of duration", () => {
    const oneHour = meetingCost(8, 100000, 1, 1.4)!;
    expect(r2(oneHour.costPerMinute)).toBe(8.97);
    expect(oneHour.costPerMinute * 60).toBeCloseTo(oneHour.totalCost, 9);
    const halfHour = meetingCost(8, 100000, 0.5, 1.4)!;
    expect(halfHour.costPerMinute).toBeCloseTo(oneHour.costPerMinute, 12);
    expect(r2(halfHour.totalCost)).toBe(269.23);
  });

  it("timer at 0:00 costs nothing but still shows the per-minute burn", () => {
    const r = meetingCost(4, 52000, 0, 1)!;
    expect(r.totalCost).toBe(0);
    expect(r.personHours).toBe(0);
    expect(r2(r.costPerMinute)).toBe(1.67); // 4 × $25/h ÷ 60
  });

  it("rejects unusable input", () => {
    expect(meetingCost(0, 100000, 1, 1.4)).toBeNull();
    expect(meetingCost(8, 0, 1, 1.4)).toBeNull();
    expect(meetingCost(8, 100000, -1, 1.4)).toBeNull();
    expect(meetingCost(8, NaN, 1, 1.4)).toBeNull();
  });
});
