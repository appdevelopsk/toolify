/**
 * Minimal session-only attribution for intent-led tool journeys.
 * Stores fixed navigation identifiers, never input values/results/search terms.
 * Expires after 10 minutes, matches the exact clicked destination slug,
 * and is consumed after the first trusted tool interaction.
 */
const KEY = "toolify:journey-attribution:v1";
const MAX_AGE_MS = 10 * 60 * 1000;
export type JourneyAttribution = { journey_id: string; destination_tool: string; step_position: number; at: number };
const SAFE_ID = /^[a-z0-9-]{1,64}$/;

export function parseJourneyAttribution(raw: string | null, now: number, destination: string): JourneyAttribution | undefined {
  if (!raw) return;
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object") return;
    const data = value as Record<string, unknown>;
    if (typeof data.journey_id !== "string" || !SAFE_ID.test(data.journey_id)) return;
    if (typeof data.destination_tool !== "string" || !SAFE_ID.test(data.destination_tool)) return;
    if (data.destination_tool !== destination) return;
    if (!Number.isInteger(data.step_position) || (data.step_position as number) < 1 || (data.step_position as number) > 3) return;
    if (typeof data.at !== "number" || !Number.isFinite(data.at) || now < data.at || now - data.at > MAX_AGE_MS) return;
    return { journey_id: data.journey_id, destination_tool: data.destination_tool, step_position: data.step_position as number, at: data.at };
  } catch { return; }
}

export function rememberJourneyClick(journey: string, destination: string, position: number): void {
  if (typeof window === "undefined" || !SAFE_ID.test(journey) || !SAFE_ID.test(destination) || !Number.isInteger(position) || position < 1 || position > 3) return;
  try {
    const data: JourneyAttribution = { journey_id: journey, destination_tool: destination, step_position: position, at: Date.now() };
    window.sessionStorage.setItem(KEY, JSON.stringify(data));
  } catch { /* Storage disabled: navigation remains functional. */ }
}

export function consumeJourneyForTool(destination: string): JourneyAttribution | undefined {
  if (typeof window === "undefined") return;
  try {
    const raw = window.sessionStorage.getItem(KEY);
    const data = parseJourneyAttribution(raw, Date.now(), destination);
    // Clear matching, malformed, or expired data. A different tool may be
    // visited briefly before the clicked destination.
    if (data || (raw && !parseJourneyAttribution(raw, Date.now(), destinationFromRaw(raw)))) {
      window.sessionStorage.removeItem(KEY);
    }
    return data;
  } catch { return; }
}

function destinationFromRaw(raw: string): string {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && "destination_tool" in parsed) {
      const slug = (parsed as { destination_tool?: unknown }).destination_tool;
      return typeof slug === "string" ? slug : "";
    }
  } catch { /* ignored */ }
  return "";
}
