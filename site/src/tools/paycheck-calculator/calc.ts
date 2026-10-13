// Paycheck calculation (pure functions, no React) — kept separate so the
// numbers can be pinned by fixed test cases (calc.test.ts).
//
// TAX YEAR: every constant below is the IRS / SSA figure for tax year 2026
// (Rev. Proc. 2025-32 sections 4.01 and 4.14; SSA contribution and benefit base
// announced 2025-10-24). The UI shows TAX_YEAR, and adds a warning
// (messages: note.taxYearWarning) once the calendar year passes TAX_YEAR. Do not change TAX_YEAR without replacing
// every constant in this file with the official figures for that year
// (IRS Rev. Proc. inflation adjustments + SSA contribution and benefit base)
// and updating calc.test.ts.

export const TAX_YEAR = 2026;

export type FilingStatus = "single" | "mfj" | "hoh";
export type PayFrequency = "weekly" | "biweekly" | "semimonthly" | "monthly";

export const PAY_PERIODS: Record<PayFrequency, number> = {
  weekly: 52,
  biweekly: 26,
  semimonthly: 24,
  monthly: 12,
};

// 2026 US Federal Tax Brackets (IRS Rev. Proc. 2025-32, section 4.01 Tables 1-3)
export const BRACKETS: Record<FilingStatus, Array<{ max: number; rate: number }>> = {
  single: [
    { max: 12400, rate: 0.1 },
    { max: 50400, rate: 0.12 },
    { max: 105700, rate: 0.22 },
    { max: 201775, rate: 0.24 },
    { max: 256225, rate: 0.32 },
    { max: 640600, rate: 0.35 },
    { max: Infinity, rate: 0.37 },
  ],
  mfj: [
    { max: 24800, rate: 0.1 },
    { max: 100800, rate: 0.12 },
    { max: 211400, rate: 0.22 },
    { max: 403550, rate: 0.24 },
    { max: 512450, rate: 0.32 },
    { max: 768700, rate: 0.35 },
    { max: Infinity, rate: 0.37 },
  ],
  hoh: [
    { max: 17700, rate: 0.1 },
    { max: 67450, rate: 0.12 },
    { max: 105700, rate: 0.22 },
    { max: 201750, rate: 0.24 },
    { max: 256200, rate: 0.32 },
    { max: 640600, rate: 0.35 },
    { max: Infinity, rate: 0.37 },
  ],
};

export const STANDARD_DEDUCTIONS: Record<FilingStatus, number> = {
  single: 16100,
  mfj: 32200,
  hoh: 24150,
};

export const SS_WAGE_BASE = 184500;
export const SS_RATE = 0.062;
export const MEDICARE_RATE = 0.0145;
export const ADDL_MEDICARE_RATE = 0.009;
export const ADDL_MEDICARE_THRESHOLD: Record<FilingStatus, number> = {
  single: 200000,
  mfj: 250000,
  hoh: 200000,
};
export const STATE_TAX_RATE = 0.05;

export function calcFederalTax(taxableIncome: number, status: FilingStatus): number {
  if (taxableIncome <= 0) return 0;
  const brackets = BRACKETS[status];
  let tax = 0;
  let prev = 0;
  for (const bracket of brackets) {
    const chunk = Math.min(taxableIncome, bracket.max) - prev;
    if (chunk <= 0) break;
    tax += chunk * bracket.rate;
    prev = bracket.max;
    if (taxableIncome <= bracket.max) break;
  }
  return tax;
}

export interface PaycheckResult {
  grossPerPaycheck: number;
  federalTaxPerPaycheck: number;
  stateTaxPerPaycheck: number;
  ssPerPaycheck: number;
  medicarePerPaycheck: number;
  netPerPaycheck: number;
  annualFederalTax: number;
  annualStateTax: number;
  annualSS: number;
  annualMedicare: number;
  annualNet: number;
}

export function calcPaycheck(
  grossAnnual: number,
  filingStatus: FilingStatus,
  payFrequency: PayFrequency,
  addlWithholding = 0,
): PaycheckResult | null {
  if (!isFinite(grossAnnual) || grossAnnual <= 0) return null;

  const periods = PAY_PERIODS[payFrequency];
  const grossPerPaycheck = grossAnnual / periods;

  const taxableIncome = Math.max(0, grossAnnual - STANDARD_DEDUCTIONS[filingStatus]);
  const annualFederalTax = calcFederalTax(taxableIncome, filingStatus);
  const federalTaxPerPaycheck = annualFederalTax / periods;

  const annualStateTax = grossAnnual * STATE_TAX_RATE;
  const stateTaxPerPaycheck = annualStateTax / periods;

  const annualSS = Math.min(grossAnnual, SS_WAGE_BASE) * SS_RATE;
  const ssPerPaycheck = annualSS / periods;

  const threshold = ADDL_MEDICARE_THRESHOLD[filingStatus];
  const annualMedicare =
    grossAnnual * MEDICARE_RATE + Math.max(0, grossAnnual - threshold) * ADDL_MEDICARE_RATE;
  const medicarePerPaycheck = annualMedicare / periods;

  const extra = isFinite(addlWithholding) ? addlWithholding : 0;
  const netPerPaycheck =
    grossPerPaycheck -
    federalTaxPerPaycheck -
    stateTaxPerPaycheck -
    ssPerPaycheck -
    medicarePerPaycheck -
    extra;

  return {
    grossPerPaycheck,
    federalTaxPerPaycheck,
    stateTaxPerPaycheck,
    ssPerPaycheck,
    medicarePerPaycheck,
    netPerPaycheck,
    annualFederalTax,
    annualStateTax,
    annualSS,
    annualMedicare,
    annualNet: netPerPaycheck * periods,
  };
}
