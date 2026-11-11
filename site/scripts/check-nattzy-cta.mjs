/** Read-only assertion that a single curated Nattzy CTA appears ahead of prompt content. */
export const TARGET = 'https://nattzy.com/t/how-do-you-write-prompts-that-stop-ai-chatbots-from-giving-generic-empty-answers/149';

export function checkNattzyCta(html) {
  if (typeof html !== 'string' || !html.trim()) return { ok: false, errors: ['empty HTML'] };
  const clean = html.replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<(script|style|template|noscript)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, '');
  const matches = [...clean.matchAll(/<a\b[^>]*\shref\s*=\s*(["'])(.*?)\1[^>]*>/gi)];
  const destination = new URL(TARGET);
  const candidates = [];
  for (const match of matches) {
    try {
      const url = new URL(match[2].replace(/&amp;/g, '&'), 'https://toolify365.com');
      if (url.hostname === destination.hostname && url.pathname === destination.pathname) {
        candidates.push({ index: match.index, url });
      }
    } catch { /* invalid href is never a valid CTA */ }
  }
  const errors = [];
  if (candidates.length !== 1) errors.push('expected 1 topic CTA, found ' + candidates.length);
  if (candidates.length === 1) {
    const { index, url } = candidates[0];
    if (url.protocol !== 'https:' || url.origin !== destination.origin) errors.push('unexpected forum origin');
    const q = url.searchParams;
    if (q.get('utm_source') !== 'toolify365' ||
        q.get('utm_medium') !== 'editorial' ||
        q.get('utm_campaign') !== 'prompt_discussion') errors.push('missing expected UTM');
    const pre = clean.search(/<pre\b/i);
    if (pre < 0) errors.push('prompt preview missing');
    else if (index > pre) errors.push('CTA appears after long prompt');
  }
  return { ok: errors.length === 0, errors };
}

/** Validate the indexed timezone tool's single, optional follow-up link. */
export const TIMEZONE_TARGET = 'https://nattzy.com/t/working-from-home-how-do-you-stay-focused-when-nobody-is-watching/147';

export function checkNattzyTimezoneCta(html) {
  if (typeof html !== 'string' || !html.trim()) return { ok: false, errors: ['empty HTML'] };
  const clean = html.replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<(script|style|template|noscript)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, '');
  const expected = new URL(TIMEZONE_TARGET);
  const targets = [];
  for (const match of clean.matchAll(/<a\b[^>]*\shref\s*=\s*(["'])(.*?)\1[^>]*>/gi)) {
    try {
      const url = new URL(match[2].replace(/&amp;/g, '&'), 'https://toolify365.com');
      if (url.hostname === expected.hostname && url.pathname === expected.pathname) {
        targets.push({ index: match.index, url });
      }
    } catch { /* malformed links cannot qualify */ }
  }
  const errors = [];
  if (targets.length !== 1) errors.push('expected 1 timezone topic CTA, found ' + targets.length);
  if (targets.length === 1) {
    const { url, index } = targets[0];
    if (url.origin !== expected.origin) errors.push('unexpected forum origin');
    const q = url.searchParams;
    if (q.get('utm_source') !== 'toolify365' ||
        q.get('utm_medium') !== 'editorial' ||
        q.get('utm_campaign') !== 'remote_work_timezone') errors.push('missing expected timezone UTM');
    const workspace = clean.search(/<section\b[^>]*class=["'][^"']*\btool-workspace\b/i);
    if (workspace < 0) errors.push('tool workspace missing');
    else if (index < workspace) errors.push('CTA appears before tool workspace');
    const explainer = clean.search(/<section\b[^>]*class=["'][^"']*\bprose\b/i);
    if (explainer < 0) errors.push('tool explainer missing');
    else if (index > explainer) errors.push('CTA appears after long tool article');
  }
  return { ok: errors.length === 0, errors };
}

/** Reuse the same read-only response gate for an explicitly chosen public page. */
export async function auditPublicTimezoneCta(
  url = 'https://toolify365.com/en/tools/timezone-converter', fetchFn = fetch,
) {
  const parsed = new URL(url);
  if (parsed.protocol !== 'https:' && parsed.hostname !== 'localhost') throw Error('HTTPS required');
  const response = await fetchFn(url, { redirect: 'follow', signal: AbortSignal.timeout(12000) });
  const errors = [];
  if (!response.ok) errors.push('HTTP ' + response.status);
  const final = new URL(response.url);
  if (final.origin !== parsed.origin || final.pathname !== parsed.pathname) errors.push('unexpected redirect');
  if (!(response.headers.get('content-type') || '').includes('text/html')) errors.push('not HTML');
  const result = checkNattzyTimezoneCta(await response.text());
  return { ok: errors.length === 0 && result.ok, errors: [...errors, ...result.errors], url };
}

export async function auditPublicCta(url = 'https://toolify365.com/en/prompts/blog-outline', fetchFn = fetch) {
  const parsed = new URL(url);
  if (parsed.protocol !== 'https:' && parsed.hostname !== 'localhost') throw Error('HTTPS required');
  const response = await fetchFn(url, { redirect: 'follow', signal: AbortSignal.timeout(12000) });
  const errors = [];
  if (!response.ok) errors.push('HTTP ' + response.status);
  const final = new URL(response.url);
  if (final.origin !== parsed.origin || final.pathname !== parsed.pathname) errors.push('unexpected redirect');
  if (!(response.headers.get('content-type') || '').includes('text/html')) errors.push('not HTML');
  const body = await response.text();
  const result = checkNattzyCta(body);
  return { ok: errors.length === 0 && result.ok, errors: [...errors, ...result.errors], url };
}

if (process.argv[1] && import.meta.url === new URL('file://' + process.argv[1]).href) {
  const timezoneMode = process.argv[2] === '--timezone';
  const url = timezoneMode ? (process.argv[3] ?? 'https://toolify365.com/en/tools/timezone-converter')
    : (process.argv[2] ?? 'https://toolify365.com/en/prompts/blog-outline');
  try {
    const result = timezoneMode ? await auditPublicTimezoneCta(url) : await auditPublicCta(url);
    console.log(JSON.stringify(result, null, 2));
    if (!result.ok) process.exitCode = 1;
  } catch (err) {
    console.error('BLOCK: ' + err.message);
    process.exitCode = 2;
  }
}
