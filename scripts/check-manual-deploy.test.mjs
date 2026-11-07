import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { assertManualDeployOnly } from './check-manual-deploy.mjs';

test('allow manual only', () => {
  assert.equal(assertManualDeployOnly('name: Deploy\non:\n  workflow_dispatch: {}\njobs:\n  deploy:\n    runs-on: ubuntu-latest\n'), true);
  assert.equal(assertManualDeployOnly('"on":\n  # review\n  workflow_dispatch: {}\n'), true);
});
test('block push and scheduled triggers, even if manual dispatch is also present', () => {
  for (const on of [
    '  push:\n    branches: [main]\n  workflow_dispatch: {}',
    '  workflow_dispatch: {}\n  schedule:\n    - cron: "0 9 * * *"',
    '  workflow_dispatch: {}\n  workflow_run:\n    workflows: [Build]'
  ]) assert.throws(() => assertManualDeployOnly('on:\n'+on+'\njobs:\n'), /Only workflow_dispatch/);
});
test('fail closed for missing, duplicate or inline events', () => {
  for (const content of ['name: Deploy\n', 'on: [workflow_dispatch]\n', 'on: [push]\n', 'on: workflow_dispatch\n', 'on:\n  workflow_dispatch: {}\non:\n  push:\n']) {
    assert.throws(() => assertManualDeployOnly(content), /Expected exactly one/);
  }
});
test('reject malformed or unexpected event syntax', () => {
  assert.throws(() => assertManualDeployOnly('on:\n workflow_dispatch: {}\n'), /Unexpected/);
  assert.throws(() => assertManualDeployOnly('on:\n  workflow_dispatch: {}\n  pull_request:\n'), /Only workflow_dispatch/);
});
