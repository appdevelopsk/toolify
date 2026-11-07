import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { verifyAllManualWorkflows } from './verify-manual-workflows.mjs';

const manual = 'name: Manual\non:\n  workflow_dispatch: {}\njobs:\n  build:\n    runs-on: ubuntu-latest\n';
const withDir = (fn) => {
  const dir = mkdtempSync(join(tmpdir(), 'toolify-manual-all-'));
  try { fn(dir); } finally { rmSync(dir, { recursive: true, force: true }); }
};

test('all manual yml/yaml workflows pass', () => withDir(dir => {
  writeFileSync(join(dir, 'ci.yml'), manual);
  writeFileSync(join(dir, 'deploy.yaml'), manual);
  assert.deepEqual(verifyAllManualWorkflows(dir), ['ci.yml', 'deploy.yaml']);
}));

test('any automatic push, PR or schedule is refused', () => withDir(dir => {
  writeFileSync(join(dir, 'deploy.yml'), manual);
  for (const event of ['push', 'pull_request', 'schedule', 'workflow_run']) {
    writeFileSync(join(dir, 'ci.yml'), `name: Auto\non:\n  workflow_dispatch: {}\n  ${event}: {}\njobs:\n`);
    assert.throws(() => verifyAllManualWorkflows(dir), /ci\.yml:/);
  }
}));

test('empty workflow directory must fail closed', () => withDir(dir => {
  assert.throws(() => verifyAllManualWorkflows(dir), /No GitHub workflow YAML/);
}));

test('malformed or inline event syntax fails closed', () => withDir(dir => {
  writeFileSync(join(dir, 'ci.yml'), 'on: [workflow_dispatch]\njobs:\n');
  assert.throws(() => verifyAllManualWorkflows(dir), /ci\.yml:/);
}));
