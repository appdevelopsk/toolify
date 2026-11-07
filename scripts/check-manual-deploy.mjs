/** Fail-closed policy for the VPS deploy workflow: only manual dispatch may trigger it. */
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

export function assertManualDeployOnly(yaml) {
  const lines = yaml.split(/\r?\n/);
  const onStart = [];
  for (let i = 0; i < lines.length; i++) {
    if (/^(?:on|["']on["']):(?:\s*(?:#.*)?)?$/.test(lines[i])) onStart.push(i);
  }
  if (onStart.length !== 1) throw new Error('Expected exactly one top-level on: mapping');
  const events = [];
  let inside = false;
  for (let i = onStart[0] + 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim() || /^\s*#/.test(line)) continue;
    if (!/^\s/.test(line)) break;
    const event = line.match(/^  ([A-Za-z_][\w-]*):(?:\s|$)/);
    if (event) {
      events.push(event[1]);
      inside = true;
      continue;
    }
    if (!inside || /^\s{1,2}\S/.test(line) || /^\t/.test(line)) {
      throw new Error('Unexpected indentation or event syntax in on: mapping');
    }
  }
  if (events.length !== 1 || events[0] !== 'workflow_dispatch') {
    throw new Error('Only workflow_dispatch is allowed; found: ' + (events.join(', ') || 'none'));
  }
  return true;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const path = process.argv[2];
  if (!path) {
    console.error('Usage: node scripts/check-manual-deploy.mjs .github/workflows/deploy.yml');
    process.exitCode = 2;
  } else {
    try {
      assertManualDeployOnly(readFileSync(path, 'utf8'));
      console.log('[postmerge] PASS: VPS workflow is manual-dispatch-only');
    } catch (err) {
      console.error('[postmerge] ERROR:', err.message);
      process.exitCode = 4;
    }
  }
}
