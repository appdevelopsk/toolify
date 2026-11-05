import type { PercentageMode } from "./scenario-comparison";

export const SCENARIO_STORAGE_KEY = "toolify_percentage_draft_v1";
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const VALID_MODES = new Set<PercentageMode>(["pct_of", "what_pct", "pct_change", "pct_add", "pct_sub"]);

export type SavedPercentageScenario = { mode: PercentageMode; a: string; b: string; savedAt: number };

/** Only short numerical inputs, never free text or generated output. */
export function parseSavedScenario(raw: string | null, now: number): SavedPercentageScenario | null {
  if (!raw || raw.length > 512) return null;
  try {
    const d: unknown = JSON.parse(raw);
    if (!d || typeof d !== "object") return null;
    const o = d as Record<string, unknown>;
    if (typeof o.mode !== "string" || !VALID_MODES.has(o.mode as PercentageMode)) return null;
    if (typeof o.a !== "string" || typeof o.b !== "string") return null;
    if (o.a.length > 40 || o.b.length > 40) return null;
    if (!/^[+\-\d.eE ]*$/.test(o.a) || !/^[+\-\d.eE ]*$/.test(o.b)) return null;
    if (typeof o.savedAt !== "number" || !Number.isFinite(o.savedAt)) return null;
    if (o.savedAt > now || now - o.savedAt > MAX_AGE_MS) return null;
    return { mode: o.mode as PercentageMode, a: o.a, b: o.b, savedAt: o.savedAt };
  } catch { return null; }
}

export function serializeSavedScenario(mode: PercentageMode, a: string, b: string, now: number): string | null {
  if (a.length > 40 || b.length > 40) return null;
  if (!/^[+\-\d.eE ]*$/.test(a) || !/^[+\-\d.eE ]*$/.test(b)) return null;
  return JSON.stringify({ mode, a, b, savedAt: now });
}
