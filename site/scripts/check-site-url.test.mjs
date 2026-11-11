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

test('CLI really runs from a checkout path containing spaces', async () => {
  const { mkdtempSync, copyFileSync, rmSync } = await import('node:fs');
  const { tmpdir } = await import('node:os');
  const { join } = await import('node:path');
  const { spawnSync } = await import('node:child_process');
  const { fileURLToPath } = await import('node:url');
  const root = mkdtempSync(join(tmpdir(), 'toolify space path '));
  const target = join(root, 'site url gate.mjs');
  try {
    copyFileSync(fileURLToPath(new URL('./check-site-url.mjs', import.meta.url)), target);
    const invalid = spawnSync(process.execPath, [target], {
      env: { ...process.env, NEXT_PUBLIC_SITE_URL: 'https://example.pages.dev' },
      encoding: 'utf8',
    });
    assert.equal(invalid.status, 1);
    assert.match(invalid.stderr, /must use the verified Toolify365 canonical host/);
    const valid = spawnSync(process.execPath, [target], {
      env: { ...process.env, NEXT_PUBLIC_SITE_URL: 'https://toolify365.com' },
      encoding: 'utf8',
    });
    assert.equal(valid.status, 0);
    assert.match(valid.stdout, /Canonical origin: https:\/\/toolify365.com/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});
