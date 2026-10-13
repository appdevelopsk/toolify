import { describe, expect, it } from "vitest";
import { convertSalary, DEFAULT_BASIS, hoursIn, round2 } from "./calc";

// Fixed cases worked out by hand. The copy in messages/*.json quotes these
// numbers (2,080 h/year, 173.33 h/month, $100k ≈ $48/h…), so if a default
// changes here, every locale's text must change with it.

describe("salary-converter basis", () => {
  it("defaults to 8 h/day, 40 h/week, 52 weeks = 2,080 h/year", () => {
    expect(DEFAULT_BASIS).toEqual({ hoursPerDay: 8, hoursPerWeek: 40, weeksPerYear: 52 });
    const h = hoursIn();
    expect(h.daily).toBe(8);
    expect(h.weekly).toBe(40);
    expect(h.annual).toBe(2080);
    expect(round2(h.monthly)).toBe(173.33);
  });
});

describe("convertSalary (default 2,080 h basis)", () => {
  it("$60,000/year → $28.85/hour, and every other period", () => {
    const r = convertSalary(60000, "annual")!;
    expect(round2(r.hourly)).toBe(28.85);
    expect(round2(r.daily)).toBe(230.77);
    expect(round2(r.weekly)).toBe(1153.85);
    expect(round2(r.monthly)).toBe(5000); // exactly annual / 12, not 4,999.90
    expect(round2(r.annual)).toBe(60000);
  });

  it("$100,000/year ≈ $48.08/hour (the article's '$48/hour' example)", () => {
    expect(round2(convertSalary(100000, "annual")!.hourly)).toBe(48.08);
  });

  it("$25/hour → 200 / 1,000 / 4,333.33 / 52,000", () => {
    const r = convertSalary(25, "hourly")!;
    expect(r.daily).toBe(200);
    expect(r.weekly).toBe(1000);
    expect(round2(r.monthly)).toBe(4333.33);
    expect(r.annual).toBe(52000);
  });

  it("monthly ↔ annual is exactly ×12", () => {
    const r = convertSalary(5000, "monthly")!;
    expect(round2(r.annual)).toBe(60000);
    expect(round2(r.hourly)).toBe(28.85);
    expect(round2(convertSalary(10000, "monthly")!.hourly)).toBe(57.69);
  });

  it("weekly and daily inputs", () => {
    expect(round2(convertSalary(1000, "weekly")!.annual)).toBe(52000);
    expect(round2(convertSalary(200, "daily")!.hourly)).toBe(25);
    expect(round2(convertSalary(200, "daily")!.annual)).toBe(52000);
  });

  it("round-trips: the input period always comes back unchanged", () => {
    for (const p of ["hourly", "daily", "weekly", "monthly", "annual"] as const) {
      expect(convertSalary(1234.56, p)![p]).toBeCloseTo(1234.56, 9);
    }
  });

  it("boundaries and rounding", () => {
    const zero = convertSalary(0, "annual")!;
    expect(Object.values(zero).every((v) => v === 0)).toBe(true);
    expect(convertSalary(-1, "annual")).toBeNull();
    expect(convertSalary(NaN, "annual")).toBeNull();
    expect(convertSalary(Infinity, "hourly")).toBeNull();
    expect(round2(convertSalary(1, "annual")!.hourly)).toBe(0); // 0.00048…
    expect(round2(convertSalary(0.01, "hourly")!.annual)).toBe(20.8);
    expect(round2(1.005)).toBe(1.01);
    expect(round2(28.846153)).toBe(28.85);
  });
});

describe("convertSalary with a non-default basis (what the copy tells readers to adjust for)", () => {
  it("45 h × 52 = 2,340 h: $60,000/year → $25.64/hour", () => {
    const b = { hoursPerDay: 9, hoursPerWeek: 45, weeksPerYear: 52 };
    expect(hoursIn(b).annual).toBe(2340);
    expect(round2(hoursIn(b).monthly)).toBe(195);
    expect(round2(convertSalary(60000, "annual", b)!.hourly)).toBe(25.64);
  });

  it("35 h × 52 = 1,820 h: $60,000/year → $32.97/hour; annual from hourly is 35/40 = 0.875× the default", () => {
    const b = { hoursPerDay: 7, hoursPerWeek: 35, weeksPerYear: 52 };
    expect(hoursIn(b).annual).toBe(1820);
    expect(round2(convertSalary(60000, "annual", b)!.hourly)).toBe(32.97);
    expect(convertSalary(30, "hourly", b)!.annual / convertSalary(30, "hourly")!.annual).toBeCloseTo(0.875, 12);
  });

  it("44 h × 52 = 2,288 h and 48 h × 52 = 2,496 h", () => {
    expect(hoursIn({ hoursPerDay: 8, hoursPerWeek: 44, weeksPerYear: 52 }).annual).toBe(2288);
    expect(hoursIn({ hoursPerDay: 8, hoursPerWeek: 48, weeksPerYear: 52 }).annual).toBe(2496);
  });

  it("rejects a zero or negative basis", () => {
    expect(convertSalary(100, "annual", { hoursPerDay: 8, hoursPerWeek: 0, weeksPerYear: 52 })).toBeNull();
    expect(convertSalary(100, "daily", { hoursPerDay: 0, hoursPerWeek: 40, weeksPerYear: 52 })).toBeNull();
  });
});
