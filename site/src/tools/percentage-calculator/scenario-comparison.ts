export type PercentageMode = "pct_of" | "what_pct" | "pct_change" | "pct_add" | "pct_sub";

/** Pure calculation shared by the live result and A/B comparison. */
export function scenarioResult(mode: PercentageMode, a: string, b: string): number | null {
  const x = Number.parseFloat(a);
  const y = Number.parseFloat(b);
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
  let value: number;
  switch (mode) {
    case "pct_of": value = (x / 100) * y; break;
    case "what_pct": if (y === 0) return null; value = (x / y) * 100; break;
    case "pct_change": if (x === 0) return null; value = ((y - x) / x) * 100; break;
    case "pct_add": value = y * (1 + x / 100); break;
    case "pct_sub": value = y * (1 - x / 100); break;
  }
  return Number.isFinite(value) ? value : null;
}
