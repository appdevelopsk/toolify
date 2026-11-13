/**
 * Privacy-safe SPA page_view dimensions.
 *
 * Toolify's URL can contain user-entered search text (?q=) and serialized
 * calculator state (?s=). They must never be sent to GA4 as page_location or
 * page_path. Keep a small whitelist of fixed, bounded campaign tags so our
 * social UTM attribution is retained. All other query parameters and hashes
 * are intentionally excluded.
 */
const CAMPAIGN_KEYS = ["utm_source", "utm_medium", "utm_campaign"] as const;
const SAFE_CAMPAIGN = /^[a-z0-9][a-z0-9._-]{0,63}$/i;

export function safePageViewUrl(pathname: string, currentHref: string): {
  page_path: string;
  page_location: string;
} {
  const browserUrl = new URL(currentHref);
  const safe = new URL(pathname.startsWith("/") ? pathname : browserUrl.pathname, browserUrl.origin);
  for (const key of CAMPAIGN_KEYS) {
    const values = browserUrl.searchParams.getAll(key);
    const value = values[0];
    if (values.length === 1 && typeof value === "string" && SAFE_CAMPAIGN.test(value)) {
      safe.searchParams.set(key, value);
    }
  }
  return { page_path: safe.pathname, page_location: safe.toString() };
}
