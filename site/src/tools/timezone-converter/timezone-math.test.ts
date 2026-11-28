import { describe, expect, it } from "vitest";
import { nowInZone, resolveWallTime } from "./timezone-math";

describe("timezone wall-clock conversion", () => {
  const cases = [
    ["2026-11-27T09:00", "Europe/Istanbul", "2026-11-27T06:00:00.000Z"],
    ["2026-11-27T09:00", "Europe/Moscow", "2026-11-27T06:00:00.000Z"],
    ["2026-11-27T09:00", "Asia/Tokyo", "2026-11-27T00:00:00.000Z"],
    ["2026-11-27T09:00", "America/New_York", "2026-11-27T14:00:00.000Z"],
    ["2026-11-27T09:00", "Asia/Kolkata", "2026-11-27T03:30:00.000Z"],
    ["2026-11-27T00:00", "UTC", "2026-11-27T00:00:00.000Z"],
    ["2026-07-01T09:00", "America/New_York", "2026-07-01T13:00:00.000Z"],
    ["2026-11-01T01:30", "America/New_York", "2026-11-01T05:30:00.000Z"],
    ["2026-11-27T00:15", "Pacific/Auckland", "2026-11-26T11:15:00.000Z"],
    ["2026-04-05T01:45", "Australia/Lord_Howe", "2026-04-04T14:45:00.000Z"],
    ["2026-11-27T09:00", "Asia/Kathmandu", "2026-11-27T03:15:00.000Z"],
    ["2026-11-27T09:00", "Pacific/Chatham", "2026-11-26T19:15:00.000Z"],
  ] as const;
  for (const [wall, zone, expected] of cases) {
    it(`${zone} ${wall}`, () => {
      expect(resolveWallTime(wall, zone)?.toISOString()).toBe(expected);
    });
  }
  it("rejects DST gaps and invalid inputs", () => {
    expect(resolveWallTime("2026-03-08T02:30", "America/New_York")).toBeNull();
    expect(resolveWallTime("2026-10-04T02:15", "Australia/Lord_Howe")).toBeNull();
    expect(resolveWallTime("2026-02-30T09:00", "UTC")).toBeNull();
    expect(resolveWallTime("2026-11-27T09:00", "Not/AZone")).toBeNull();
    expect(resolveWallTime("", "UTC")).toBeNull();
  });
  it("Now uses the selected zone instead of the browser zone", () => {
    const instant = new Date("2026-11-27T23:30:00Z");
    expect(nowInZone("Europe/Istanbul", instant)).toBe("2026-11-28T02:30");
    expect(nowInZone("Asia/Tokyo", instant)).toBe("2026-11-28T08:30");
    expect(nowInZone("America/New_York", instant)).toBe("2026-11-27T18:30");
    expect(nowInZone("Not/AZone", instant)).toBe("");
  });
});
