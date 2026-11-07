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
