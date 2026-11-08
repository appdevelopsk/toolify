import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { hasNoindex, canonicalHref, hasSoftwareAnchor, hasSitemapLocation, hasWorkflowStepAnchor, hasWorkflowGuideAnchor } from './growth-html-checks.mjs';

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

test('sitemap target requires exact loc match, not URL prefix', () => {
  const target = 'https://toolify365.com/en/tools/character-frequency';
  const xml = '<urlset><url><loc>' + target + '-fake</loc></url></urlset>';
  assert.equal(hasSitemapLocation(xml, target), false);
  assert.equal(hasSitemapLocation('<urlset><url><loc>' + target + '</loc></url></urlset>', target), true);
  assert.equal(hasSitemapLocation('<loc>https://toolify365.com/en/tools/character-frequency?ref=x</loc>', target), false);
  assert.equal(hasSitemapLocation('<loc>https://wrong.example/en/tools/character-frequency</loc>', target), false);
  assert.equal(hasSitemapLocation('<loc>invalid relative address</loc>', target), false);
  assert.equal(hasSitemapLocation('<loc>https://toolify365.com/en/tools/character-frequency', target), false);
  assert.equal(hasSitemapLocation('<!-- <loc>' + target + '</loc> -->', target), false);
  assert.equal(hasSitemapLocation('<![CDATA[<loc>' + target + '</loc>]]>', target), false);
  assert.equal(hasSitemapLocation('<!-- <loc>' + target + '</loc> --><loc>' + target + '</loc>', target), true);
});

test('SEO and CTA checks require real attribute names, never lookalike data-*', () => {
  assert.equal(hasNoindex('<meta data-name="robots" content="noindex">'), false);
  assert.equal(hasNoindex('<meta name="robots" data-content="noindex" content="index">'), false);
  assert.equal(hasNoindex('<meta data-note="name=robots" content="noindex">'), false);
  assert.equal(hasNoindex('<meta name="robots" content="noindex" data-content="index">'), true);

  assert.equal(canonicalHref('<link data-rel="canonical" href="/fake">'), null);
  assert.equal(canonicalHref('<link rel="canonical" data-href="/fake" href="/real">'), '/real');
  assert.equal(canonicalHref('<link data-meta="rel=canonical" rel="stylesheet" href="/fake">'), null);
  assert.equal(canonicalHref('<link rel="alternate canonical" href="/real">'), '/real');

  assert.equal(hasSoftwareAnchor('<a data-href="/en/software/json-studio">Open</a>', 'json-studio', 'en'), false);
  assert.equal(hasSoftwareAnchor('<a href="/wrong" data-href="/en/software/json-studio">Open</a>', 'json-studio', 'en'), false);
  assert.equal(hasSoftwareAnchor('<a data-note="href=/en/software/json-studio" href="/wrong">Open</a>', 'json-studio', 'en'), false);
  assert.equal(hasSoftwareAnchor('<a data-href="/wrong" href="/en/software/json-studio">Open</a>', 'json-studio', 'en'), true);
});


test('guided link validation requires exact rendered destinations and fixed query keys', () => {
  const target = { locale: 'en', slug: 'json-formatter', workflow: 'data', step: 2 };
  assert.equal(hasWorkflowStepAnchor('<a href="/en/tools/json-formatter?wf=data&amp;ws=2">Open</a>', target), true);
  assert.equal(hasWorkflowStepAnchor('<a href="/en/tools/json-formatter?wf=data&ws=2&s=private">Open</a>', target), false);
  assert.equal(hasWorkflowStepAnchor('<a href="/en/tools/json-formatter?wf=data&ws=2&wf=data">Open</a>', target), false);
  assert.equal(hasWorkflowStepAnchor('<a href="/en/tools/json-formatter?wf=data&ws=2&ws=2">Open</a>', target), false);
  assert.equal(hasWorkflowStepAnchor('<a href="/en/tools/json-formatter?wf=writing&ws=2">Open</a>', target), false);
  assert.equal(hasWorkflowStepAnchor('<a href="/en/tools/json-formatter?wf=data&ws=3">Open</a>', target), false);
  assert.equal(hasWorkflowStepAnchor('<a href="https://outside.example/en/tools/json-formatter?wf=data&ws=2">Open</a>', target), false);
  assert.equal(hasWorkflowStepAnchor('<a data-href="/en/tools/json-formatter?wf=data&ws=2">Open</a>', target), false);
  assert.equal(hasWorkflowStepAnchor('<script>const html = \x60<a href="/en/tools/json-formatter?wf=data&ws=2">Open</a>\x60</script>', target), false);
  assert.equal(hasWorkflowStepAnchor('<!-- <a href="/en/tools/json-formatter?wf=data&ws=2">Open</a> -->', target), false);
});

test('terminal guide return links must match locale, fragment and same origin', () => {
  const target = { locale: 'ja', workflow: 'scheduling' };
  assert.equal(hasWorkflowGuideAnchor('<a href="/ja/workflows#scheduling">More</a>', target), true);
  assert.equal(hasWorkflowGuideAnchor('<a href="/en/workflows#scheduling">More</a>', target), false);
  assert.equal(hasWorkflowGuideAnchor('<a href="/ja/workflows#shopping">More</a>', target), false);
  assert.equal(hasWorkflowGuideAnchor('<a href="/ja/workflows?s=private#scheduling">More</a>', target), false);
  assert.equal(hasWorkflowGuideAnchor('<a data-href="/ja/workflows#scheduling">More</a>', target), false);
  assert.equal(hasWorkflowGuideAnchor('<!-- <a href="/ja/workflows#scheduling">More</a> -->', target), false);
});
