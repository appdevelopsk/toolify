import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const frame = read('../src/components/tools/ToolFrame.tsx');
const events = read('../src/lib/analytics/events.ts');
const workbench = read('../src/components/software/SoftwareWorkbench.tsx');
const recent = read('../src/components/tools/ContinueWithRecent.tsx');
const recs = read('../src/lib/software/recommendations.ts');

test('growth and engagement navigation coexist ahead of advertising', () => {
  for (const name of ['ToolInteractionTracker', 'ContinueWithRecent', 'ToolSoftwareRecommendations', 'AdBelowResult']) {
    assert.ok(frame.includes('<' + name), 'missing ' + name);
  }
  const order = ['<ToolInteractionTracker', '<ContinueWithRecent', '<ToolSoftwareRecommendations', '<AdBelowResult'].map(s => frame.indexOf(s));
  assert.ok(order.every(i => i >= 0));
  assert.ok(order.every((v, i) => i === 0 || order[i - 1] < v), 'navigation must precede ads');
});

test('all five integration analytics functions coexist', () => {
  for (const name of ['trackRecentToolClick', 'trackScenarioAction', 'trackSoftwareClick', 'trackSoftwareProcess', 'trackSoftwareDownload']) {
    assert.match(events, new RegExp('export function ' + name + '\\('));
  }
  assert.ok(workbench.includes('trackSoftwareProcess('));
  assert.ok(workbench.includes('trackSoftwareDownload('));
  assert.ok(recent.includes('trackRecentToolClick('));
});

test('catalog-gated software CTA mappings are present', () => {
  assert.ok(recs.includes('AVAILABLE_SOFTWARE'));
  assert.ok(recs.includes('availableRecommendations'));
  assert.ok(frame.includes('slug={meta.slug} locale={locale}'));
});

test('synthetic restoration events cannot inflate active tool engagement', () => {
  const tracker = read('../src/components/tools/ToolInteractionTracker.tsx');
  const restore = read('../src/lib/hooks/useAutoShareableState.ts');
  assert.ok(tracker.includes('if (!e.isTrusted || sent.current.calculate) return'));
  assert.ok(tracker.includes('if (!e.isTrusted) return'));
  assert.ok(tracker.includes('sent.current = { calculate: false, copy: false, preset: false }'));
  assert.ok(tracker.includes('if (disposed) return'));
  assert.ok(tracker.includes('window.clearTimeout(calculateDelay)'));
  assert.ok(tracker.includes('}, [slug, locale, category])'));
  assert.ok(restore.includes('dispatchEvent(new Event("input", { bubbles: true }))'));
});

test('automatic share URLs exclude sensitive named and autofilled fields', () => {
  const policy = read('../src/lib/hooks/share-input-policy.ts');
  const hook = read('../src/lib/hooks/useAutoShareableState.ts');
  assert.ok(policy.includes('SENSITIVE_IDENTIFIER'));
  assert.ok(policy.includes('SENSITIVE_AUTOCOMPLETE'));
  assert.ok(policy.includes('SENSITIVE_IDENTIFIER.test(normalizedIdentifier)'));
  assert.ok(policy.includes('explicitTextOptIn = false'));
  assert.ok(policy.includes('freeTextType && !explicitTextOptIn'));
  assert.ok(hook.includes('const identifier ='));
  assert.ok(hook.includes('const explicitTextOptIn = el.getAttribute("data-share") === "on"'));
  assert.ok(hook.includes('isShareableField(el.type, el.autocomplete, privateField, identifier, explicitTextOptIn)'));
  assert.ok(hook.includes('isShareableField("textarea", el.autocomplete, privateField, identifier, explicitTextOptIn)'));
  assert.ok(hook.includes('isShareableField("select", el.getAttribute("autocomplete") ?? "", privateField, identifier, explicitTextOptIn)'));
});

test('shared URL restoration validates untrusted input and clears stale oversized state', () => {
  const policy = read('../src/lib/hooks/share-input-policy.ts');
  const hook = read('../src/lib/hooks/useAutoShareableState.ts');
  assert.ok(policy.includes('export function isValidRestoredFieldValue('));
  assert.ok(policy.includes('Number.isFinite(Number(value))'));
  assert.ok(hook.includes('if (!isValidRestoredFieldValue(kind, v)) continue'));
  assert.ok(hook.includes('Array.from(el.options).some((option) => option.value === v)'));
  assert.ok(hook.includes('el.type === "radio" && el.value !== v'));
  assert.ok(hook.includes('stale.searchParams.delete("s")'));
  assert.ok(hook.includes('window.dispatchEvent(new Event("toolify:share-state-change"))'));
});

test('embedded tool HTML escapes title and attribute values', () => {
  const share = read('../src/components/tools/ShareBar.tsx');
  const html = read('../src/lib/tools/embed-html.ts');
  assert.ok(share.includes('buildToolEmbedSnippet'));
  assert.ok(html.includes('export function escapeHtml(value: string)'));
  assert.ok(html.includes('const safeTitle = escapeHtml(title)'));
  assert.ok(html.includes("const safeEmbedSrc = escapeHtml(safeEmbedUrl(embedUrl, 'about:blank'))"));
  assert.ok(html.includes("const safeToolUrl = escapeHtml(safeEmbedUrl(toolUrl, 'https://toolify365.com'))"));
  assert.ok(html.includes('rel="noopener"'));
  assert.ok(html.includes('if (parsed.protocol === "https:" || localDev) return value'));
  assert.ok(html.includes('if (parsed.username || parsed.password) return fallback'));
  assert.ok(html.includes('value.trim() !== value'));
});

test('postmerge release requires fresh main and manual-only deployment', () => {
  const gate = read('../../scripts/check-postmerge-embed-release.sh');
  const workflow = read('../../.github/workflows/deploy.yml');
  assert.ok(gate.includes('fetch --no-tags origin main:refs/remotes/origin/main'));
  assert.ok(gate.includes('merge-base --is-ancestor refs/remotes/origin/main HEAD'));
  assert.ok(gate.includes('latest origin/main is not merged'));
  assert.ok(gate.includes('main push auto-deploy must be disabled'));
  assert.ok(gate.includes("grep -Fq 'branches: [main]'"));
  assert.ok(workflow.includes('workflow_dispatch: {}'));
  assert.ok(!workflow.includes('branches: [main]'), 'must not automatically deploy on main');
  assert.ok(workflow.includes('Acquire VPS deploy lock (shared with local deploy)'));
  assert.ok(workflow.includes('Verify live release SHA'));
  assert.ok(workflow.includes('Verify public release endpoint'));
});

test('main push trigger guard detects the real YAML syntax', () => {
  const blocked = spawnSync('grep', ['-Fq', 'branches: [main]'], {
    input: ['on:', '  push:', '    branches: [main]', ''].join(String.fromCharCode(10)),
    encoding: 'utf8',
  });
  assert.equal(blocked.status, 0, 'an on-main-push deploy must be rejected');
  const allowed = spawnSync('grep', ['-Fq', 'branches: [main]'], {
    input: ['on:', '  workflow_dispatch: {}', ''].join(String.fromCharCode(10)),
    encoding: 'utf8',
  });
  assert.equal(allowed.status, 1, 'manual-only deploy must be allowed');
});
