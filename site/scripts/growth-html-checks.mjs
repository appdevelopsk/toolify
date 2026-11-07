function renderedMarkup(html) {
  // Ignore comments and serialized hydration/script payloads that can contain fake tags.
  return html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '');
}
export function hasNoindex(html, xRobotsTag = "") {
  // X-Robots-Tag may be repeated/comma-delimited, and can target a specific crawler.
  if (/(?:^|[,\s:])(?:noindex|none)(?:$|[,\s])/i.test(xRobotsTag)) return true;
  return [...renderedMarkup(html).matchAll(/<meta[^>]*>/gi)].some(([tag]) => {
    const name = tag.match(/\bname\s*=\s*["'](robots|googlebot)["']/i);
    const value = tag.match(/\bcontent\s*=\s*["']([^"']+)["']/i)?.[1] ?? '';
    return Boolean(name) && /(?:^|[,\s])(?:noindex|none)(?:$|[,\s])/i.test(value);
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
