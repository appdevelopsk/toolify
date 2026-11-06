import type { SearchItem } from "./matcher";

/** Keep a broken or unexpected search-index response out of client navigation. */
export function parseSearchIndexPayload(payload: unknown): SearchItem[] {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return [];
  const tools = (payload as { tools?: unknown }).tools;
  if (!Array.isArray(tools)) return [];
  return tools.filter((item): item is SearchItem =>
    !!item &&
    typeof item === "object" &&
    !Array.isArray(item) &&
    typeof item.slug === "string" &&
    item.slug.length > 0 &&
    typeof item.title === "string" &&
    item.title.length > 0 &&
    typeof item.category === "string"
  );
}
