function renderedMarkup(html) {
  // Ignore comments and serialized hydration/script payloads that can contain fake tags.
  return html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '');
}
export function hasNoindex(html, xRobotsTag = "") {
  // X-Robots-Tag may be repeated/comma-delimited, and can target a specific crawler.
  if (/(?:^|[,\s:])noindex(?:$|[,\s])/i.test(xRobotsTag)) return true;
  return [...renderedMarkup(html).matchAll(/<meta[^>]*>/gi)].some(([tag]) => {
    const name = tag.match(/\bname\s*=\s*["'](robots|googlebot)["']/i);
    const value = tag.match(/\bcontent\s*=\s*["']([^"']+)["']/i)?.[1] ?? '';
    return Boolean(name) && /(?:^|[,\s])noindex(?:$|[,\s])/i.test(value);
  });
}
export function canonicalHref(html) {
  const tag = [...renderedMarkup(html).matchAll(/<link[^>]*>/gi)].map(([v]) => v).find(t => /\brel\s*=\s*["']canonical["']/i.test(t));
  return tag?.match(/\bhref\s*=\s*["']([^"']+)["']/i)?.[1]?.replace(/&amp;/g, '&') ?? null;
}
export function hasSoftwareAnchor(html, slug, locale, origin = 'https://toolify365.com') {
  const markup = renderedMarkup(html);
  const destination = `/software/${slug}`;
  return [...markup.matchAll(/<a\b[^>]*>/gi)].some(([tag]) => {
    const href = tag.match(/\bhref\s*=\s*["']([^"']+)["']/i)?.[1]?.replace(/&amp;/g, '&');
    if (!href) return false;
    try {
      const url = new URL(href, origin);
      return url.origin === new URL(origin).origin && url.pathname.replace(/\/$/, '') === `/${locale}${destination}`;
    } catch { return false; }
  });
}

/**
 * Check the rendered, user-clickable social share link rather than hydration
 * strings. This verifies the final localized URL and source UTM together.
 */
export function hasAttributedSocialShare(html, source, path, origin = 'https://toolify365.com') {
  const destinations = {
    x: ['twitter.com', '/intent/tweet', 'url'],
    facebook: ['www.facebook.com', '/sharer/sharer.php', 'u'],
    line: ['social-plugins.line.me', '/lineit/share', 'url'],
    reddit: ['www.reddit.com', '/submit', 'url'],
    linkedin: ['www.linkedin.com', '/sharing/share-offsite/', 'url'],
    telegram: ['t.me', '/share/url', 'url'],
  };
  const config = destinations[source];
  if (!config) return false;
  let expected;
  try { expected = new URL(path, origin); } catch { return false; }
  return [...renderedMarkup(html).matchAll(/<a\b[^>]*>/gi)].some(([tag]) => {
    const href = tag.match(/\bhref\s*=\s*["']([^"']+)["']/i)?.[1]?.replace(/&amp;/g, '&');
    if (!href) return false;
    try {
      const intent = new URL(href);
      if (intent.protocol !== 'https:' || intent.hostname !== config[0] || intent.pathname !== config[1]) return false;
      const target = new URL(intent.searchParams.get(config[2]));
      return target.origin === expected.origin
        && target.pathname.replace(/\/$/, '') === expected.pathname.replace(/\/$/, '')
        && target.searchParams.get('utm_source') === source
        && target.searchParams.get('utm_medium') === 'social'
        && target.searchParams.get('utm_campaign') === 'tool_share';
    } catch { return false; }
  });
}

/** Validate the public catalog that powers lazy international search. */
export function isHealthySearchIndex(data, locale) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return false;
  if (data.version !== 1 || data.locale !== locale || !Array.isArray(data.tools)) return false;
  if (data.tools.length < 100 || data.count !== data.tools.length) return false;
  const bySlug = new Map();
  for (const item of data.tools) {
    if (!item || typeof item !== 'object' ||
        typeof item.slug !== 'string' || typeof item.title !== 'string' ||
        !item.title.trim() || bySlug.has(item.slug)) return false;
    bySlug.set(item.slug, item);
  }
  return ['workdays-calculator', 'json-formatter'].every(slug => bySlug.has(slug));
}
