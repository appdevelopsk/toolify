import test from 'node:test';
import assert from 'node:assert/strict';
import { validateSiteUrl } from './check-site-url.mjs';

test('accepts canonical HTTPS production host', () => {
  assert.equal(validateSiteUrl('https://toolify365.com'), 'https://toolify365.com');
  assert.equal(validateSiteUrl('https://www.toolify365.com'), 'https://www.toolify365.com');
});
for (const value of [undefined, '', 'https://example.pages.dev', 'https://toolify.pages.dev', 'http://toolify365.com', 'https://eviltoolify365.com', 'https://toolify365.com/foo', 'https://toolify365.com/?x=1', 'https://user:password@toolify365.com', 'https://toolify365.com:8443', 'not-a-url']) {
  test(`rejects unsafe host: ${value}`, () => assert.throws(() => validateSiteUrl(value)));
}
