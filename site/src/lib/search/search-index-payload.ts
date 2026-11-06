import type { SearchItem } from "./matcher";

const VALID_CATEGORIES = new Set([
  "health", "math", "converter", "datetime", "text", "color", "finance", "image",
]);
const VALID_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Reject malformed index data before building navigation links or labels. */
export function parseSearchIndexPayload(payload: unknown): SearchItem[] {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return [];
  const tools = (payload as { tools?: unknown }).tools;
  if (!Array.isArray(tools)) return [];
  const unique = new Set<string>();
  return tools.filter((item): item is SearchItem => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return false;
    const data = item as Record<string, unknown>;
    if (typeof data.slug !== "string" || data.slug.length > 100 || !VALID_SLUG.test(data.slug)) return false;
    if (typeof data.title !== "string" || !data.title.trim() || data.title.length > 200) return false;
    if (typeof data.category !== "string" || !VALID_CATEGORIES.has(data.category)) return false;
    if (unique.has(data.slug)) return false;
    unique.add(data.slug);
    return true;
  });
}
