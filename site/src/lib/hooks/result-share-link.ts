/**
 * On-demand, fragment-only sharing for tool result inputs.
 *
 * Browser URLs are not rewritten on every keystroke. A result link is
 * assembled only for an explicit "Copy result link" action.
 * URL fragments are not sent in HTTP requests or HTTP referrer headers.
 * Third-party scripts may still inspect fragments; do not include secrets.
 */
export const RESULT_LINK_REQUEST = "toolify:result-link-request";

export type ResultLinkRequest = {
  slug: string;
  respond: (url: string | null) => void;
};

export function readResultShareState(href: string): string | null {
  const url = new URL(href);
  // New links use #s=..., but existing ?s=... links still restore.
  const fragment = url.hash.startsWith("#s=") ? url.hash.slice(3) : null;
  return fragment || url.searchParams.get("s");
}

export function createResultShareLink(href: string, encoded: string, maxLength: number): string | null {
  if (!encoded || maxLength < 1 || encoded.length > maxLength || !/^[\w-]+$/.test(encoded)) {
    return null;
  }
  const url = new URL(href);
  url.searchParams.delete("s");
  url.hash = `s=${encoded}`;
  return url.toString();
}

/**
 * Convert old ?s= links to #s= after hydration without dropping attribution
 * parameters. Existing links still hit the server once on first navigation.
 */
export function migrateLegacyShareQuery(href: string): string | null {
  const url = new URL(href);
  const raw = url.searchParams.get("s");
  if (raw === null) return null;
  url.searchParams.delete("s");
  // Never carry arbitrary invalid query values into a new shared fragment.
  if (!url.hash.startsWith("#s=") && /^[\\w-]+$/.test(raw)) url.hash = `s=${raw}`;
  return url.toString();
}

/** Discard obsolete shared values after a user edits a restored result. */
export function clearStaleResultShareState(href: string): string | null {
  const url = new URL(href);
  const containsQuery = url.searchParams.has("s");
  const containsFragment = url.hash.startsWith("#s=");
  if (!containsQuery && !containsFragment) return null;
  url.searchParams.delete("s");
  if (containsFragment) url.hash = "";
  return url.toString();
}
