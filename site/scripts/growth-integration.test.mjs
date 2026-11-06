import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';

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
  assert.ok(restore.includes('dispatchEvent(new Event("input", { bubbles: true }))'));
});
