import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { checkNattzyCta, TARGET, auditPublicCta, checkNattzyTimezoneCta, auditPublicTimezoneCta, TIMEZONE_TARGET } from './check-nattzy-cta.mjs';

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


const timezoneHref = TIMEZONE_TARGET + '?utm_source=toolify365&amp;utm_medium=editorial&amp;utm_campaign=remote_work_timezone';
const timezoneHtml = '<h1>Timezone Converter</h1><section class="tool-workspace"><div>Controls</div></section><a href="' + timezoneHref + '">Remote work</a><section class="prose prose-slate">How it works</section>';

test('timezone CTA after workspace and before article passes', () =>
  assert.deepEqual(checkNattzyTimezoneCta(timezoneHtml), { ok: true, errors: [] }));
test('timezone CTA absent fails closed', () =>
  assert.ok(checkNattzyTimezoneCta(timezoneHtml.replace(/<a\b[^>]*>Remote work<\/a>/, '')).errors.some(x => x.includes('found 0'))));
test('timezone link after article fails placement', () =>
  assert.ok(checkNattzyTimezoneCta('<section class="tool-workspace"></section><section class="prose"></section><a href="' + timezoneHref + '">Remote work</a>').errors.includes('CTA appears after long tool article')));
test('timezone duplicate link rejected', () =>
  assert.ok(checkNattzyTimezoneCta(timezoneHtml + '<a href="' + timezoneHref + '">Duplicate</a>').errors.some(x => x.includes('found 2'))));
test('wrong timezone campaign rejected', () =>
  assert.ok(checkNattzyTimezoneCta(timezoneHtml.replace('remote_work_timezone', 'prompt_discussion')).errors.includes('missing expected timezone UTM')));
test('fake script and comment timezone links ignored', () =>
  assert.ok(checkNattzyTimezoneCta('<script><a href="' + timezoneHref + '">Fake</a></script><!-- <a href="' + timezoneHref + '">Comment</a> -->' + timezoneHtml).ok));
test('timezone link missing real tool workspace rejected', () =>
  assert.ok(checkNattzyTimezoneCta('<a href="' + timezoneHref + '">CTA</a><section class="prose"></section>').errors.includes('tool workspace missing')));
test('timezone public audit reports redirect as failure', async () => {
  const mock = async () => ({
    ok: true, status: 200, url: 'https://other.example/en/tools/timezone-converter',
    headers: new Map([['content-type', 'text/html']]), text: async () => timezoneHtml,
  });
  const result = await auditPublicTimezoneCta('https://toolify365.com/en/tools/timezone-converter', mock);
  assert.equal(result.ok, false);
  assert.ok(result.errors.includes('unexpected redirect'));
});
