import { describe, expect, it } from "vitest";
import { calcFederalTax, calcPaycheck, STANDARD_DEDUCTIONS, SS_WAGE_BASE, TAX_YEAR } from "./calc";

// Fixed cases worked out by hand from the 2024 IRS tables. If TAX_YEAR changes,
// every expected number here must be recomputed — the first test fails on purpose.

describe("paycheck-calculator (tax year 2024)", () => {
  it("is pinned to tax year 2024 with the 2024 constants", () => {
    expect(TAX_YEAR).toBe(2024);
    expect(STANDARD_DEDUCTIONS).toEqual({ single: 14600, mfj: 29200, hoh: 21900 });
    expect(SS_WAGE_BASE).toBe(168600);
  });

  it("single $75,000 biweekly — the worked example in the article", () => {
    // taxable 60,400 = 1,160 (10%) + 4,266 (12%) + 2,915 (22%) = 8,341
    const r = calcPaycheck(75000, "single", "biweekly")!;
    expect(r.annualFederalTax).toBeCloseTo(8341, 2);
    expect(r.annualSS).toBeCloseTo(4650, 2);
    expect(r.annualMedicare).toBeCloseTo(1087.5, 2);
    expect(r.annualStateTax).toBeCloseTo(3750, 2);
    // (75,000 − 8,341 − 3,750 − 4,650 − 1,087.50) / 26
    expect(r.netPerPaycheck).toBeCloseTo(57171.5 / 26, 6);
    expect(r.annualNet).toBeCloseTo(57171.5, 6);
  });

  it("married filing jointly $100,000 monthly", () => {
    // taxable 70,800 = 2,320 (10%) + 5,712 (12%) = 8,032
    const r = calcPaycheck(100000, "mfj", "monthly")!;
    expect(r.annualFederalTax).toBeCloseTo(8032, 2);
    expect(r.federalTaxPerPaycheck).toBeCloseTo(8032 / 12, 6);
  });

  it("head of household $50,000 weekly", () => {
    // taxable 28,100 = 1,655 (10%) + 1,386 (12% of 11,550) = 3,041
    const r = calcPaycheck(50000, "hoh", "weekly")!;
    expect(r.annualFederalTax).toBeCloseTo(3041, 2);
  });

  it("single $250,000 — Social Security cap and Additional Medicare Tax", () => {
    // taxable 235,400 = 1,160 + 4,266 + 11,742.50 + 21,942 + 13,904 = 53,014.50
    const r = calcPaycheck(250000, "single", "semimonthly")!;
    expect(r.annualFederalTax).toBeCloseTo(53014.5, 2);
    expect(r.annualSS).toBeCloseTo(168600 * 0.062, 6); // 10,453.20
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
