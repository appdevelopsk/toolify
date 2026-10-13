import { describe, expect, it } from "vitest";
import { calcFederalTax, calcPaycheck, STANDARD_DEDUCTIONS, SS_WAGE_BASE, TAX_YEAR } from "./calc";

// Fixed cases worked out by hand from the 2026 IRS tables (Rev. Proc. 2025-32). If TAX_YEAR changes,
// every expected number here must be recomputed — the first test fails on purpose.

describe("paycheck-calculator (tax year 2026)", () => {
  it("is pinned to tax year 2026 with the 2026 constants", () => {
    expect(TAX_YEAR).toBe(2026);
    expect(STANDARD_DEDUCTIONS).toEqual({ single: 16100, mfj: 32200, hoh: 24150 });
    expect(SS_WAGE_BASE).toBe(184500);
  });

  it("single $75,000 biweekly — the worked example in the article", () => {
    // taxable 58,900 = 1,240 (10%) + 4,560 (12%) + 1,870 (22%) = 7,670
    const r = calcPaycheck(75000, "single", "biweekly")!;
    expect(r.annualFederalTax).toBeCloseTo(7670, 2);
    expect(r.annualSS).toBeCloseTo(4650, 2);
    expect(r.annualMedicare).toBeCloseTo(1087.5, 2);
    expect(r.annualStateTax).toBeCloseTo(3750, 2);
    // (75,000 − 7,670 − 3,750 − 4,650 − 1,087.50) / 26
    expect(r.netPerPaycheck).toBeCloseTo(57842.5 / 26, 6);
    expect(r.annualNet).toBeCloseTo(57842.5, 6);
  });

  it("married filing jointly $100,000 monthly", () => {
    // taxable 67,800 = 2,480 (10%) + 5,160 (12%) = 7,640
    const r = calcPaycheck(100000, "mfj", "monthly")!;
    expect(r.annualFederalTax).toBeCloseTo(7640, 2);
    expect(r.federalTaxPerPaycheck).toBeCloseTo(7640 / 12, 6);
  });

  it("head of household $50,000 weekly", () => {
    // taxable 25,850 = 1,770 (10%) + 978 (12% of 8,150) = 2,748
    const r = calcPaycheck(50000, "hoh", "weekly")!;
    expect(r.annualFederalTax).toBeCloseTo(2748, 2);
  });

  it("single $250,000 — Social Security cap and Additional Medicare Tax", () => {
    // taxable 233,900 = 41,024 (through 24%) + 10,280 (32% of 32,125) = 51,304
    const r = calcPaycheck(250000, "single", "semimonthly")!;
    expect(r.annualFederalTax).toBeCloseTo(51304, 2);
    expect(r.annualSS).toBeCloseTo(184500 * 0.062, 6); // 11,439
    expect(r.annualMedicare).toBeCloseTo(250000 * 0.0145 + 50000 * 0.009, 6); // 4,075
  });

  it("income below the standard deduction owes no federal income tax", () => {
    expect(calcFederalTax(0, "single")).toBe(0);
    expect(calcPaycheck(14000, "single", "monthly")!.annualFederalTax).toBe(0);
  });

  it("additional withholding is subtracted per paycheck", () => {
    const base = calcPaycheck(75000, "single", "biweekly")!;
    const extra = calcPaycheck(75000, "single", "biweekly", 50)!;
    expect(base.netPerPaycheck - extra.netPerPaycheck).toBeCloseTo(50, 6);
  });

  it("rejects empty / non-positive salary", () => {
    expect(calcPaycheck(NaN, "single", "biweekly")).toBeNull();
    expect(calcPaycheck(0, "single", "biweekly")).toBeNull();
  });
});
