/**
 * Shared amortization math for the finance tools
 * (mortgage / loan / car-loan / loan-amortization-schedule).
 * Standard annuity formula: M = P·r / (1 − (1+r)^−n), r = annual rate / 12.
 */

export interface AmortizationRow {
  /** 1-based month number */
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

/** Hard cap so pathological inputs (e.g. 10,000 years) cannot freeze the tab. */
const MAX_MONTHS = 1200;

export function monthlyPayment(principal: number, annualRatePct: number, months: number): number {
  const r = annualRatePct / 100 / 12;
  return r === 0 ? principal / months : (principal * r) / (1 - Math.pow(1 + r, -months));
}

export function buildAmortizationRows(principal: number, annualRatePct: number, months: number): AmortizationRow[] {
  if (![principal, annualRatePct, months].every(Number.isFinite)) return [];
  if (principal <= 0 || months <= 0 || months > MAX_MONTHS || annualRatePct < 0) return [];
  const n = Math.round(months);
  const r = annualRatePct / 100 / 12;
  const payment = monthlyPayment(principal, annualRatePct, n);
  const rows: AmortizationRow[] = [];
  let balance = principal;
  for (let m = 1; m <= n; m++) {
    const interest = balance * r;
    // Absorb floating-point drift in the final installment so the balance lands exactly on zero.
    const principalPaid = m === n ? balance : payment - interest;
    balance = Math.max(0, balance - principalPaid);
    rows.push({ month: m, payment: interest + principalPaid, principal: principalPaid, interest, balance });
  }
  return rows;
}
