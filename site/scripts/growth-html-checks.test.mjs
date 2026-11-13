import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { hasNoindex, canonicalHref, hasSoftwareAnchor, hasAttributedSocialShare, isHealthySearchIndex } from './growth-html-checks.mjs';

test('robots and googlebot directives independent of attribute order', () => {
  assert.equal(hasNoindex('<meta name="robots" content="noindex,follow">'), true);
  assert.equal(hasNoindex("<meta content='follow, noindex' name='googlebot'>"), true);
  assert.equal(hasNoindex('<meta name="robots" content="index, follow">'), false);
  assert.equal(hasNoindex('<meta name="description" content="noindex">'), false);
  assert.equal(hasNoindex('<meta name="robots" content="noindexing">'), false);
  assert.equal(hasNoindex("", "noindex, nofollow"), true);
  assert.equal(hasNoindex("", "googlebot: noindex, follow"), true);
  assert.equal(hasNoindex("", "noindexing"), false);
  assert.equal(hasNoindex("", "index, follow"), false);
  assert.equal(hasNoindex('<!-- <meta name="robots" content="noindex"> -->'), false);
  assert.equal(hasNoindex('<script>"<meta name=\\"robots\\" content=\\"noindex\\">"</script>'), false);
});
test('canonical regardless of attribute order', () => {
  assert.equal(canonicalHref('<link href="https://toolify365.com/en/tools/foo" rel="canonical">'), 'https://toolify365.com/en/tools/foo');
  assert.equal(canonicalHref('<link rel="canonical" href="https://toolify365.com/en/tools/foo">'), 'https://toolify365.com/en/tools/foo');
  assert.equal(canonicalHref('<link rel="alternate" href="foo">'), null);
  assert.equal(canonicalHref('<!-- <link rel="canonical" href="/wrong"> --><link rel="canonical" href="/right">'), '/right');
});
test('CTA must be an anchor, not an inert script string', () => {
  assert.equal(hasSoftwareAnchor('<a href="/en/software/json-studio">Open</a>', 'json-studio', 'en'), true);
  assert.equal(hasSoftwareAnchor('<script>"/en/software/json-studio"</script>', 'json-studio', 'en'), false);
  assert.equal(hasSoftwareAnchor('<script>const x = `<a href="/en/software/json-studio">Open</a>`;</script>', 'json-studio', 'en'), false);
  assert.equal(hasSoftwareAnchor('<style>/* <a href="/en/software/json-studio"> */</style>', 'json-studio', 'en'), false);
  assert.equal(hasSoftwareAnchor('<!-- <a href="/en/software/json-studio"> -->', 'json-studio', 'en'), false);
  assert.equal(hasSoftwareAnchor('<a href="/en/software/json-studio-evil">Open</a>', 'json-studio', 'en'), false);
  assert.equal(hasSoftwareAnchor('<a href="/en/software/json-studio">Open</a>', 'json-studio', 'ja'), false);
  assert.equal(hasSoftwareAnchor('<a href="https://other.example/en/software/json-studio">Open</a>', 'json-studio', 'en'), false);
  assert.equal(hasSoftwareAnchor('<a href="https://staging.example/en/software/json-studio">Open</a>', 'json-studio', 'en', 'https://staging.example'), true);
});

test('share attribution is read only from rendered anchor hrefs', () => {
  const target = 'https://toolify365.com/es/tools/json-formatter';
  const link = new URL('https://www.linkedin.com/sharing/share-offsite/');
  const attributed = new URL(target);
  attributed.searchParams.set('utm_source', 'linkedin');
  attributed.searchParams.set('utm_medium', 'social');
  attributed.searchParams.set('utm_campaign', 'tool_share');
  link.searchParams.set('url', attributed.toString());

  const html = '<a href="' + link.toString().replace(/&/g, '&amp;') + '">Share</a>';
  assert.equal(hasAttributedSocialShare(html, 'linkedin', '/es/tools/json-formatter'), true);
  assert.equal(hasAttributedSocialShare('<script>' + html + '</script>', 'linkedin', '/es/tools/json-formatter'), false);
  assert.equal(hasAttributedSocialShare('<!-- ' + html + ' -->', 'linkedin', '/es/tools/json-formatter'), false);
  assert.equal(hasAttributedSocialShare(html, 'linkedin', '/ja/tools/json-formatter'), false);
  assert.equal(hasAttributedSocialShare(html, 'telegram', '/es/tools/json-formatter'), false);
  assert.equal(hasAttributedSocialShare(html.replace('utm_campaign%3Dtool_share', 'utm_campaign%3Dwrong'), 'linkedin', '/es/tools/json-formatter'), false);
});

test('Telegram share intents preserve localized canonical path and attribution', () => {
  const target = new URL('https://toolify365.com/ar/tools/word-counter');
  for (const [key,value] of Object.entries({utm_source:'telegram',utm_medium:'social',utm_campaign:'tool_share'})) {
    target.searchParams.set(key,value);
  }
  const intent = new URL('https://t.me/share/url');
  intent.searchParams.set('url', target.toString());
  intent.searchParams.set('text', 'Word Counter');
  assert.equal(hasAttributedSocialShare('<a href="' + intent.toString().replace(/&/g, '&amp;') + '">Telegram</a>', 'telegram', '/ar/tools/word-counter'), true);
});

test('international search index smoke validates actual catalog rather than HTTP 200 only', () => {
  const tools = [
    { slug: 'workdays-calculator', title: 'Working Days' },
    { slug: 'json-formatter', title: 'JSON Formatter' },
    ...Array.from({ length: 98 }, (_, i) => ({ slug: 'tool-' + i, title: 'Tool ' + i })),
  ];
  const data = { version: 1, locale: 'fr', count: tools.length, tools };
  assert.equal(isHealthySearchIndex(data, 'fr'), true);
  assert.equal(isHealthySearchIndex(data, 'ar'), false);
  assert.equal(isHealthySearchIndex({ ...data, version: 2 }, 'fr'), false);
  assert.equal(isHealthySearchIndex({ ...data, count: 223 }, 'fr'), false);
  assert.equal(isHealthySearchIndex({ ...data, tools: [] }, 'fr'), false);
  assert.equal(isHealthySearchIndex({ ...data, tools: tools.slice(1) }, 'fr'), false);
  assert.equal(isHealthySearchIndex({ ...data, tools: [...tools.slice(0,99), tools[0]] }, 'fr'), false);
  assert.equal(isHealthySearchIndex({ ...data, tools: [...tools.slice(0,99), { slug: 'bad', title: '' }] }, 'fr'), false);
  assert.equal(isHealthySearchIndex(null, 'fr'), false);
});
