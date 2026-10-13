// Pure conversion logic for the salary converter. The UI and every locale's
// copy (description, assumption line, article, FAQ) must describe exactly this
// basis: 8 h/day, 40 h/week, 52 weeks/year = 2,080 h/year, 2,080/12 h/month.
// Country-specific legal hours (35 h France, 44 h Brazil, 45 h Türkiye…) may be
// mentioned in copy only as an adjustment the reader applies — never as what
// the calculator uses.

export type Period = "hourly" | "daily" | "weekly" | "monthly" | "annual";

export const PERIODS: Period[] = ["hourly", "daily", "weekly", "monthly", "annual"];

export interface Basis {
  hoursPerDay: number;
  hoursPerWeek: number;
  weeksPerYear: number;
}

export const DEFAULT_BASIS: Basis = { hoursPerDay: 8, hoursPerWeek: 40, weeksPerYear: 52 };

/** Hours contained in one unit of each period. Monthly is annual / 12 (not a rounded 173.33). */
export function hoursIn(basis: Basis = DEFAULT_BASIS): Record<Period, number> {
  const annual = basis.hoursPerWeek * basis.weeksPerYear;
  return {
    hourly: 1,
    daily: basis.hoursPerDay,
    weekly: basis.hoursPerWeek,
    monthly: annual / 12,
    annual,
  };
}

export type Conversion = Record<Period, number>;

/** Convert an amount paid per `period` into every period. Returns null for invalid input. */
export function convertSalary(amount: number, period: Period, basis: Basis = DEFAULT_BASIS): Conversion | null {
  if (!Number.isFinite(amount) || amount < 0) return null;
  const h = hoursIn(basis);
  if (![h.daily, h.weekly, h.annual].every((x) => Number.isFinite(x) && x > 0)) return null;
  const hourly = amount / h[period];
  return {
    hourly,
    daily: hourly * h.daily,
    weekly: hourly * h.weekly,
    monthly: hourly * h.monthly,
    annual: hourly * h.annual,
  };
}

/** Round to cents the way the UI displays (2 decimals). */
export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}
