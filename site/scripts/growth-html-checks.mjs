export function hasNoindex(html) {
  return [...html.matchAll(/<meta[^>]*>/gi)].some(([tag]) => {
    const name = tag.match(/\bname\s*=\s*["'](robots|googlebot)["']/i);
    const value = tag.match(/\bcontent\s*=\s*["']([^"']+)["']/i)?.[1] ?? '';
    return Boolean(name) && /(?:^|[,\s])noindex(?:$|[,\s])/i.test(value);
  });
}
export function canonicalHref(html) {
  const tag = [...html.matchAll(/<link[^>]*>/gi)].map(([v]) => v).find(t => /\brel\s*=\s*["']canonical["']/i.test(t));
  return tag?.match(/\bhref\s*=\s*["']([^"']+)["']/i)?.[1]?.replace(/&amp;/g, '&') ?? null;
}
export function hasSoftwareAnchor(html, slug, locale) {
  const destination = `/software/${slug}`;
  return [...html.matchAll(/<a\b[^>]*>/gi)].some(([tag]) => {
    const href = tag.match(/\bhref\s*=\s*["']([^"']+)["']/i)?.[1]?.replace(/&amp;/g, '&');
    if (!href) return false;
    try {
      const path = new URL(href, 'https://toolify365.com').pathname.replace(/\/$/, '');
      return path === `/${locale}${destination}`;
    } catch { return false; }
  });
}
