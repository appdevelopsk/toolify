import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { checkNattzyCta, TARGET, auditPublicCta } from './check-nattzy-cta.mjs';

const href = TARGET + '?utm_source=toolify365&amp;utm_medium=editorial&amp;utm_campaign=prompt_discussion';
const top = '<h1>Blog outline</h1><a href="' + href + '">Discuss</a><pre>long prompt</pre><section>Comments & questions</section>';

test('single early link passes', () => assert.deepEqual(checkNattzyCta(top), { ok: true, errors: [] }));
test('link after prompt fails', () => assert.ok(checkNattzyCta('<pre>content</pre><a href="' + href + '">Discuss</a>').errors.includes('CTA appears after long prompt')));
test('duplicate anchor fails', () => assert.ok(checkNattzyCta(top + '<a href="' + href + '">duplicate</a>').errors.some(x => x.includes('found 2'))));
test('link in script/comment is excluded', () => assert.ok(checkNattzyCta('<script><a href="' + href + '"></a></script><!-- <a href="' + href + '"></a> -->' + top).ok));
test('missing UTM fails', () => assert.ok(checkNattzyCta('<a href="' + TARGET + '">Discuss</a><pre>prompt</pre>').errors.includes('missing expected UTM')));
test('phishing lookalike is rejected', () => assert.ok(checkNattzyCta('<a href="https://nattzy.com.evil.test/t/a/149">X</a><pre>prompt</pre>').errors.some(x => x.includes('found 0'))));
test('data-href is not counted as anchor destination', () => assert.ok(checkNattzyCta('<a data-href="' + href + '">Fake</a><pre>prompt</pre>').errors.some(x => x.includes('found 0'))));
test('no prompt element is not a valid release', () => assert.ok(checkNattzyCta('<a href="' + href + '">Discuss</a>').errors.includes('prompt preview missing')));
test('empty response fails', () => assert.ok(!checkNattzyCta('').ok));
test('read-only audit rejects redirects even with good HTML', async () => {
  const mock = async () => ({
    ok: true, status: 200, url: 'https://other.example/en/prompts/blog-outline',
    headers: new Map([['content-type', 'text/html']]), text: async () => top,
  });
  const result = await auditPublicCta('https://toolify365.com/en/prompts/blog-outline', mock);
  assert.equal(result.ok, false);
  assert.ok(result.errors.includes('unexpected redirect'));
});
