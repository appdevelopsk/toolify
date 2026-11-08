/**
 * Sharing state may contain user-selected data, even if it was explicitly
 * copied as #s=. A third-party affiliate script has access to window.location
 * when it loads; on a direct shared-link visit, do not load it.
 *
 * The policy is only an initial-load mitigation. A vendor script previously
 * loaded during an SPA session remains in memory across later navigations.
 */
export function shouldLoadImpactTracking(href: string): boolean {
  try {
    const url = new URL(href);
    if (url.protocol !== "https:" && url.protocol !== "http:") return false;
    return !url.searchParams.has("s") && !url.hash.startsWith("#s=");
  } catch {
    return false;
  }
}
