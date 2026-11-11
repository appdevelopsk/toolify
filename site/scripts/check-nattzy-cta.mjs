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
  const url = process.argv[2] ?? 'https://toolify365.com/en/prompts/blog-outline';
  try {
    const result = await auditPublicCta(url);
    console.log(JSON.stringify(result, null, 2));
    if (!result.ok) process.exitCode = 1;
  } catch (err) {
    console.error('BLOCK: ' + err.message);
    process.exitCode = 2;
  }
}
