/**
 * Same-tab, session-only attribution between an intentional search result click
 * and a subsequent real tool input/change. Never persist search query text,
 * typed inputs, result contents or personally identifying information.
 */
const KEY = "toolify:search-attribution:v1";
const MAX_AGE_MS = 10 * 60 * 1000;
const VALID_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const VALID_SOURCES = ["header", "tools_page"] as const;

export type SearchSource = (typeof VALID_SOURCES)[number];
export type SearchAttribution = {
  destination_tool: string;
  search_source: SearchSource;
  result_position: number;
  at: number;
};

export function parseSearchAttribution(
  raw: string | null,
  now: number,
  destination: string,
): SearchAttribution | undefined {
  if (!raw) return;
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object" || Array.isArray(value)) return;
    const data = value as Record<string, unknown>;
    if (typeof data.destination_tool !== "string" ||
        !VALID_SLUG.test(data.destination_tool) ||
        data.destination_tool.length > 100 ||
        data.destination_tool !== destination) return;
    if (data.search_source !== "header" && data.search_source !== "tools_page") return;
    if (!Number.isInteger(data.result_position) ||
        (data.result_position as number) < 1 ||
        (data.result_position as number) > 10) return;
    if (typeof data.at !== "number" || !Number.isFinite(data.at) ||
        now < data.at || now - data.at > MAX_AGE_MS) return;
    return {
      destination_tool: data.destination_tool,
      search_source: data.search_source,
      result_position: data.result_position as number,
      at: data.at,
    };
  } catch { return; }
}

export function rememberSearchClick(
  destination: string,
  source: SearchSource,
  position: number,
): void {
  if (typeof window === "undefined" || !VALID_SLUG.test(destination) ||
      destination.length > 100 || !VALID_SOURCES.includes(source) ||
      !Number.isInteger(position) || position < 1 || position > 10) return;
  try {
    const data: SearchAttribution = {
      destination_tool: destination,
      search_source: source,
      result_position: position,
      at: Date.now(),
    };
    window.sessionStorage.setItem(KEY, JSON.stringify(data));
  } catch { /* Storage disabled: search navigation still works. */ }
}

export function consumeSearchForTool(destination: string): SearchAttribution | undefined {
  if (typeof window === "undefined") return;
  try {
    const raw = window.sessionStorage.getItem(KEY);
    const data = parseSearchAttribution(raw, Date.now(), destination);
    if (data) {
      window.sessionStorage.removeItem(KEY);
    } else if (raw) {
      // Keep an otherwise-valid click if a different tool was visited first.
      // Clear malformed or expired records rather than letting them linger.
      let originalDestination = "";
      try {
        const value: unknown = JSON.parse(raw);
        if (value && typeof value === "object" && "destination_tool" in value) {
          const slug = (value as { destination_tool?: unknown }).destination_tool;
          if (typeof slug === "string") originalDestination = slug;
        }
      } catch { /* invalid JSON; clear below */ }
      if (!parseSearchAttribution(raw, Date.now(), originalDestination)) {
        window.sessionStorage.removeItem(KEY);
      }
    }
    return data;
  } catch { return; }
}
