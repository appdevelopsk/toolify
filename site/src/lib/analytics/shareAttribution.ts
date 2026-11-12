/**
 * Campaign attribution for user-initiated social shares.
 * Only social destinations receive UTMs; canonical URLs and copied links stay clean.
 */
export function socialShareUrl(canonicalUrl: string, source: string): string {
  const url = new URL(canonicalUrl);
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error("Social sharing requires an HTTP(S) URL");
  }
  url.searchParams.set("utm_source", source);
  url.searchParams.set("utm_medium", "social");
  url.searchParams.set("utm_campaign", "tool_share");
  return url.toString();
}

/** Escape both attribute and text contexts in optional embed HTML. */
export function escapeEmbedHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
