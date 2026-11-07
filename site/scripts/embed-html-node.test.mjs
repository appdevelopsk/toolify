// Dependency-free release regression: executes the actual TypeScript helper on Node >=22.
// Use: node --experimental-strip-types --test scripts/embed-html-node.test.mjs
import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { buildToolEmbedSnippet as build, escapeHtml } from '../src/lib/tools/embed-html.ts';

test('escape localized HTML text and quoted attributes', () => {
  assert.equal(escapeHtml(`A&B <"C"> 'D'`), 'A&amp;B &lt;&quot;C&quot;&gt; &#39;D&#39;');
});

test('preserve legitimate query parameters without HTML attribute injection', () => {
  const html = build('A&B "Calculator"', 'https://toolify365.com/en/embed?a=1&b=2', 'https://toolify365.com/en/tools?a=1&b=2');
  assert.ok(html.includes('title="A&amp;B &quot;Calculator&quot;"'));
  assert.ok(html.includes('src="https://toolify365.com/en/embed?a=1&amp;b=2"'));
  assert.ok(html.includes('href="https://toolify365.com/en/tools?a=1&amp;b=2"'));
});

test('untrusted text cannot create scripts or event-handler attributes', () => {
  const html = build('"><script>alert(1)</script>', 'https://toolify365.com/embed" onload="bad()', "https://toolify365.com/tool' onclick='bad()");
  assert.ok(!html.includes('<script>'));
  assert.ok(!html.includes('src="https://toolify365.com/embed" onload='));
  assert.ok(!html.includes("href=\"https://toolify365.com/tool' onclick="));
  assert.ok(html.includes('&lt;script&gt;'));
});

test('reject active, opaque, relative and remote HTTP URLs', () => {
  for (const value of ['javascript:alert(1)', 'data:text/html,<script>bad()</script>', '/relative/embed', 'http://evil.example/iframe']) {
    const html = build('Safe', value, value);
    assert.ok(html.includes('src="about:blank"'), value);
    assert.ok(html.includes('href="https://toolify365.com"'), value);
  }
});

test('reject URL credentials, control characters and surrounding whitespace', () => {
  for (const value of [
    'https://user:pass@toolify365.com/en/embed',
    'https://user@toolify365.com/en/embed',
    '\nhttps://toolify365.com/en/embed',
    'https://toolify365.com/en/embed\t',
    ' https://toolify365.com/en/embed',
    'https://toolify365.com/en/embed\0',
  ]) {
    const html = build('Safe', value, value);
    assert.ok(html.includes('src="about:blank"'), JSON.stringify(value));
    assert.ok(html.includes('href="https://toolify365.com"'), JSON.stringify(value));
  }
});

test('distributed widget attribution links are visible and qualified as nofollow', () => {
  const html = build('My Tool', 'https://toolify365.com/embed/en/test', 'https://toolify365.com/en/tools/test');
  const links = [...html.matchAll(/<a\b[^>]*>/g)].map(m => m[0]);
  assert.equal(links.length, 2);
  for (const link of links) {
    assert.ok(link.includes('rel="noopener noreferrer nofollow"'));
    assert.ok(link.includes('target="_blank"'));
  }
  assert.ok(html.includes('>My Tool</a>'));
  assert.ok(html.includes('>toolify365</a>'));
});

test('allow HTTPS and local development addresses', () => {
  assert.ok(build('Safe','https://toolify365.com/en/embed','https://toolify365.com/en/tools').includes('src="https://toolify365.com/en/embed"'));
  assert.ok(build('Safe','http://localhost:3000/en/embed','http://127.0.0.1:3000/en/tools').includes('src="http://localhost:3000/en/embed"'));
});
