import { describe, expect, it } from "vitest";
import { convertSalary, DEFAULT_BASIS, hoursIn, parseHoursPerWeek, round2 } from "./calc";

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

// The "hours per week" field: the UI passes { ...DEFAULT_BASIS, hoursPerWeek }.
// Daily stays 8 hours; weekly, monthly and annual follow the field.
describe("hours-per-week field", () => {
  const withWeek = (hoursPerWeek: number) => ({ ...DEFAULT_BASIS, hoursPerWeek });

  it("40 (the default) gives exactly the same result as no basis argument", () => {
    for (const p of ["hourly", "daily", "weekly", "monthly", "annual"] as const) {
      expect(convertSalary(60000, p, withWeek(40))).toEqual(convertSalary(60000, p));
    }
  });

  it("35 h (France): 20/hour → 700/week, 3,033.33/month, 36,400/year; 60,000/year → 32.97/hour", () => {
    const r = convertSalary(20, "hourly", withWeek(35))!;
    expect(r.daily).toBe(160);
    expect(r.weekly).toBe(700);
    expect(round2(r.monthly)).toBe(3033.33); // 1,820 / 12 = 151.67 h
    expect(r.annual).toBe(36400);
    const a = convertSalary(60000, "annual", withWeek(35))!;
    expect(round2(a.hourly)).toBe(32.97);
    expect(round2(a.daily)).toBe(263.74);
    expect(round2(a.weekly)).toBe(1153.85);
    expect(round2(a.monthly)).toBe(5000);
  });

  it("44 h (Brazil CLT): 20/hour → 880/week, 3,813.33/month, 45,760/year (1.1× the 40 h figures)", () => {
    const r = convertSalary(20, "hourly", withWeek(44))!;
    expect(r.weekly).toBe(880);
    expect(round2(r.monthly)).toBe(3813.33);
    expect(r.annual).toBe(45760);
    expect(r.annual / convertSalary(20, "hourly")!.annual).toBeCloseTo(1.1, 12);
  });

  it("45 h (Türkiye): 200/hour → 9,000/week, 39,000/month, 468,000/year (1.125× the 40 h figures)", () => {
    const r = convertSalary(200, "hourly", withWeek(45))!;
    expect(r.daily).toBe(1600);
    expect(r.weekly).toBe(9000);
    expect(r.monthly).toBe(39000);
    expect(r.annual).toBe(468000);
    expect(r.annual / convertSalary(200, "hourly")!.annual).toBeCloseTo(1.125, 12);
  });

  it("parses the field: decimal comma accepted, empty / zero / negative / over 168 rejected", () => {
    expect(parseHoursPerWeek("40")).toBe(40);
    expect(parseHoursPerWeek(" 37,5 ")).toBe(37.5);
    expect(parseHoursPerWeek("37.5")).toBe(37.5);
    expect(parseHoursPerWeek("168")).toBe(168);
    for (const bad of ["", "0", "-5", "169", "abc", "40h", "1e2"]) expect(parseHoursPerWeek(bad)).toBeNull();
  });
});

// Local-currency examples quoted in messages/<locale>.json. The display now uses
// the same currency (src/lib/currency.ts), so these must match what the tool shows.
describe("examples quoted in localized copy (default 40 h basis)", () => {
  it.each([
    ["ru", 120000, "monthly", 692], // ₽120 000/месяц ≈ ₽692/час
    ["vi", 100_000_000, "monthly", 577000], // 100 triệu₫/tháng ≈ 577.000₫/giờ (rounded to 1,000)
    ["vi", 20_000_000, "monthly", 115000],
    ["id", 10_000_000, "monthly", 57700], // Rp10 juta/bulan ≈ Rp57.700/jam (rounded to 100)
    ["pt-BR", 10000, "monthly", 58], // R$ 10.000/mês ≈ R$ 58/hora
    ["fr", 50000, "annual", 24], // 50 000 €/an ≈ 24 €/heure
    ["de", 60000, "annual", 29],
    ["tr", 100000, "annual", 48],
    ["ja", 10_000_000, "annual", 4800], // 年収1000万円 ≈ 時給4800円 (rounded to 100)
  ] as const)("%s: %d per %s ≈ %d per hour", (_locale, amount, period, quoted) => {
    const hourly = convertSalary(amount, period)!.hourly;
    expect(Math.abs(hourly - quoted) / quoted).toBeLessThan(0.01); // copy rounds to the unit shown
  });

  it("fr: 50 000 €/an on the 35 h basis ≈ 27,50 €/heure", () => {
    const hourly = convertSalary(50000, "annual", { ...DEFAULT_BASIS, hoursPerWeek: 35 })!.hourly;
    expect(round2(hourly)).toBe(27.47);
  });
});
