/**
 * Keep a small, deterministic return path on the tool detail page.
 * Never recommend the current page, duplicate entries, or unrecognized slugs.
 * All history consists of slug identifiers, not calculator inputs.
 */
export function selectRecentRecommendations(
  recent: readonly string[],
  currentSlug: string,
  availableSlugs: ReadonlySet<string>,
  limit = 3,
): string[] {
  if (limit <= 0) return [];
  const seen = new Set<string>([currentSlug]);
  const selected: string[] = [];
  for (const slug of recent) {
    if (seen.has(slug) || !availableSlugs.has(slug)) continue;
    seen.add(slug);
    selected.push(slug);
    if (selected.length >= limit) break;
  }
  return selected;
}
