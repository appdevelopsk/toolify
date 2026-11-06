import { scenarioResult, type PercentageMode } from "./scenario-comparison";

const MODES = new Set<PercentageMode>(["pct_of", "what_pct", "pct_change", "pct_add", "pct_sub"]);

/** Validate untrusted ?s= payloads as one coherent state, never partially restore. */
export function parseSharedPercentageState(value: unknown): { mode: PercentageMode; a: string; b: string } | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const candidate = value as Record<string, unknown>;
  if (typeof candidate.mode !== "string" || !MODES.has(candidate.mode as PercentageMode)) return null;
  if (typeof candidate.a !== "string" || typeof candidate.b !== "string") return null;
  if (candidate.a.length > 40 || candidate.b.length > 40) return null;
  if (scenarioResult(candidate.mode as PercentageMode, candidate.a, candidate.b) === null) return null;
  return { mode: candidate.mode as PercentageMode, a: candidate.a, b: candidate.b };
}
