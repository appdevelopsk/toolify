/** Match full HTML attributes, not data-name/data-rel/data-href or quoted text. */
function attributeValue(tag, wanted) {
  const pattern = /(?:^|\s)([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>]+)))?/g;
  for (const match of tag.matchAll(pattern)) {
    if (match[1].toLowerCase() === wanted) {
      return match[2] ?? match[3] ?? match[4] ?? '';
    }
  }
  return null;
}

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
    const name = attributeValue(tag, 'name')?.toLowerCase();
    const value = attributeValue(tag, 'content') ?? '';
    return (name === 'robots' || name === 'googlebot') && /(?:^|[,\s])(?:noindex|none)(?:$|[,\s])/i.test(value);
  });
}
export function canonicalHref(html) {
  const tag = [...renderedMarkup(html).matchAll(/<link[^>]*>/gi)].map(([v]) => v).find(t => (attributeValue(t, 'rel') ?? '').toLowerCase().split(/\s+/).includes('canonical'));
  return attributeValue(tag ?? '', 'href')?.replace(/&amp;/g, '&') ?? null;
}
export function hasSoftwareAnchor(html, slug, locale, origin = 'https://toolify365.com') {
  const markup = renderedMarkup(html);
  const destination = `/software/${slug}`;
  return [...markup.matchAll(/<a\b[^>]*>/gi)].some(([tag]) => {
    const href = attributeValue(tag, 'href')?.replace(/&amp;/g, '&');
    if (!href) return false;
    try {
      const url = new URL(href, origin);
      return url.origin === new URL(origin).origin && url.pathname.replace(/\/$/, '') === `/${locale}${destination}`;
    } catch { return false; }
  });
}

/** Match complete <loc> values, never URL prefixes that may identify a different page. */
export function hasSitemapLocation(xml, target) {
  // Comments and CDATA may contain convincing but non-indexable <loc> text.
  const liveXml = xml.replace(/<!--[\s\S]*?-->/g, '').replace(/<!\[CDATA\[[\s\S]*?\]\]>/g, '');
  return [...liveXml.matchAll(/<loc(?:\s[^>]*)?>([^<]+)<\/loc\s*>/gi)].some(([, value]) => {
    try {
      return new URL(value.trim().replace(/&amp;/g, '&')).href === new URL(target).href;
    } catch { return false; }
  });
}

/**
 * Validate a real rendered guided-workflow anchor, not a hydration string or
 * a lookalike data-href. No additional query parameters (including ?s= user
 * input state) may be smuggled into the generated guided destination.
 */
export function hasWorkflowStepAnchor(html, { locale, slug, workflow, step }, origin = "https://toolify365.com") {
  const markup = renderedMarkup(html);
  return [...markup.matchAll(/<a\b[^>]*>/gi)].some(([tag]) => {
    const href = attributeValue(tag, "href")?.replace(/&amp;/g, "&");
    if (!href) return false;
    try {
      const url = new URL(href, origin);
      const params = [...url.searchParams.entries()];
      return url.origin === new URL(origin).origin
        && url.pathname === `/${locale}/tools/${slug}`
        && !url.hash
        && params.length === 2
        && url.searchParams.getAll("wf").length === 1
        && url.searchParams.get("wf") === workflow
        && url.searchParams.getAll("ws").length === 1
        && url.searchParams.get("ws") === String(step);
    } catch { return false; }
  });
}

/** The last step of every journey should offer an actual same-site guide link. */
export function hasWorkflowGuideAnchor(html, { locale, workflow }, origin = "https://toolify365.com") {
  const markup = renderedMarkup(html);
  return [...markup.matchAll(/<a\b[^>]*>/gi)].some(([tag]) => {
    const href = attributeValue(tag, "href")?.replace(/&amp;/g, "&");
    if (!href) return false;
    try {
      const url = new URL(href, origin);
      return url.origin === new URL(origin).origin
        && url.pathname === `/${locale}/workflows`
        && url.hash === `#${workflow}`
        && !url.search;
    } catch { return false; }
  });
}
