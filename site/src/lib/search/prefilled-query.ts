/**
 * Extract a browser/OpenSearch supplied query from /{locale}/tools?q=...
 * without making arbitrary URL parameters part of the search.
 *
 * Keep queries in component state only: the search string is never emitted in
 * GA4 custom events, persisted, or copied into destination tool URLs.
 */
export function prefilledToolQuery(search: string): string {
  if (!search || search.length > 4096) return "";
  try {
    const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
    const raw = params.get("q");
    if (!raw) return "";
    const cleaned = raw.replace(/[\u0000-\u001f\u007f]/g, " ").trim();
    // Unicode code points, not UTF-16 units: do not split emoji/surrogate pairs.
    return Array.from(cleaned).slice(0, 100).join("");
  } catch {
    return "";
  }
}
