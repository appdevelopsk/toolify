import type { ToolMeta } from "./types";
import { CORE_TOOLS_BY_DEMAND, isIndexableIn } from "./registry";

/**
 * Keep real, indexable demand leaders visible near the top of category hubs.
 * Non-indexed tools stay discoverable below; no routes or robots directives change.
 * Stable fallback preserves registry order for equally ranked tools.
 */
export function orderCategoryToolsForLocale(tools: readonly ToolMeta[], locale: string): ToolMeta[] {
  const rank = new Map<string, number>(CORE_TOOLS_BY_DEMAND.map((slug, i) => [slug, i]));
  return tools.map((tool, index) => ({
    tool, index,
    indexed: isIndexableIn(locale, tool.slug),
    demand: rank.get(tool.slug) ?? Number.MAX_SAFE_INTEGER,
  })).sort((a, b) => {
    if (a.indexed !== b.indexed) return a.indexed ? -1 : 1;
    if (a.indexed && b.indexed && a.demand !== b.demand) return a.demand - b.demand;
    return a.index - b.index;
  }).map(({ tool }) => tool);
}
