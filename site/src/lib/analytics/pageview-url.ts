/**
 * Public route identity for analytics. Tool input state can be encoded into
 * ?s= by existing share hooks and MUST NOT be sent as a page_location or
 * page_path to GA4. Likewise, workflow attribution tags stay in controlled
 * custom events rather than high-cardinality pageview URLs.
 */
export function sanitizePageViewUrl(href: string): {
  page_path: string;
  page_location: string;
} {
  const parsed = new URL(href);
  return {
    page_path: parsed.pathname,
    page_location: parsed.origin + parsed.pathname,
  };
}

/**
 * GA4 uses document.referrer by default, including any ?s= share-state URL.
 * Preserve same-site navigation path for useful attribution, but never its
 * query/fragment. External referrers are reduced to their origin to avoid
 * forwarding another site's private query or path data to analytics.
 */
export function sanitizePageReferrer(referrer: string, currentHref: string): string {
  if (!referrer) return "";
  try {
    const previous = new URL(referrer);
    const current = new URL(currentHref);
    if (previous.protocol !== "http:" && previous.protocol !== "https:") return "";
    return previous.origin === current.origin
      ? previous.origin + previous.pathname
      : previous.origin;
  } catch {
    return "";
  }
}
