import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { hasNoindex, canonicalHref, hasSoftwareAnchor } from './growth-html-checks.mjs';

test('robots and googlebot directives independent of attribute order', () => {
  assert.equal(hasNoindex('<meta name="robots" content="noindex,follow">'), true);
  assert.equal(hasNoindex("<meta content='follow, noindex' name='googlebot'>"), true);
  assert.equal(hasNoindex('<meta name="robots" content="index, follow">'), false);
  assert.equal(hasNoindex('<meta name="robots" content="none">'), true);
  assert.equal(hasNoindex('<meta name="googlebot" content="nofollow, none">'), true);
  assert.equal(hasNoindex('<meta name="robots" content="nonetheless">'), false);
  assert.equal(hasNoindex('<meta name="description" content="noindex">'), false);
  assert.equal(hasNoindex('<meta name="robots" content="noindexing">'), false);
  assert.equal(hasNoindex("", "noindex, nofollow"), true);
  assert.equal(hasNoindex("", "googlebot: noindex, follow"), true);
  assert.equal(hasNoindex("", "noindexing"), false);
  assert.equal(hasNoindex("", "index, follow"), false);
  assert.equal(hasNoindex("", "none"), true);
  assert.equal(hasNoindex("", "googlebot: none, follow"), true);
  assert.equal(hasNoindex("", "nonewhat"), false);
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
