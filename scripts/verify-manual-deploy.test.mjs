import { test } from "node:test";
import { strict as assert } from "node:assert";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { verifyManualDeployWorkflow, verifyWorkflowPath } from "./verify-manual-deploy.mjs";

const allowed = [
  "name: Deploy to VPS",
  "",
  "# Owner-managed deploy",
  "on:",
  "  workflow_dispatch: {}",
  "",
  "jobs:",
  "  deploy:",
  "    runs-on: ubuntu-latest",
  "",
].join("\n");

test("accepts the sole manual dispatch trigger with ordinary jobs and comments", () => {
  assert.equal(verifyManualDeployWorkflow(allowed), true);
  assert.equal(verifyManualDeployWorkflow(allowed.replace(/\n/g, "\r\n")), true);
});

test("rejects every alternative GitHub Actions event form", () => {
  const bad = [
    "on: push",
    "on: [push]",
    "on: {push: {branches: [main]}}",
    "on:\n  push:\n    branches: [main]",
    "on:\n  push: {}",
    "on:\n  workflow_dispatch: {}\n  push: {}",
    "on:\n  workflow_dispatch: {}\n  pull_request: {}",
    "on:\n  workflow_dispatch: {}\n  schedule: []",
    "on:\n  workflow_dispatch: {}\n  workflow_dispatch: {}",
    "'on': push",
    "\"on\": [push]",
    "jobs:\n  deploy:\n    runs-on: ubuntu-latest",
  ];
  for (const yaml of bad) {
    assert.throws(() => verifyManualDeployWorkflow(yaml), Error, yaml);
  }
});

test("does not accept inline or ambiguous manual-only trigger representations", () => {
  for (const yaml of [
    "on: {workflow_dispatch: {}}",
    "on: [workflow_dispatch]",
    "on: workflow_dispatch",
    "'on':\n  workflow_dispatch: {}",
    "on:\n    workflow_dispatch: {}",
    "on:\n  workflow_dispatch:",
    "on:\n  workflow_dispatch: {inputs: {}}",
    "on:\n  workflow_dispatch: {}\n'on': push",
  ]) {
    assert.throws(() => verifyManualDeployWorkflow(yaml), Error, yaml);
  }
});

test("CLI exits 0 for manual-only and 4 for automatic deploy", () => {
  const directory = mkdtempSync(join(tmpdir(), "toolify-manual-"));
  const workflow = join(directory, "deploy.yml");
  const cli = fileURLToPath(new URL("./verify-manual-deploy.mjs", import.meta.url));
  try {
    writeFileSync(workflow, allowed);
    const ok = spawnSync(process.execPath, [cli, workflow], { encoding: "utf8" });
    assert.equal(ok.status, 0, ok.stderr);
    writeFileSync(workflow, allowed.replace("  workflow_dispatch: {}", "  push: {}"));
    const rejected = spawnSync(process.execPath, [cli, workflow], { encoding: "utf8" });
    assert.equal(rejected.status, 4, rejected.stdout);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("validates every .yml and .yaml workflow in a directory", () => {
  const dir = mkdtempSync(join(tmpdir(), "toolify-workflows-"));
  try {
    writeFileSync(join(dir, "deploy.yml"), allowed);
    writeFileSync(join(dir, "ci.yaml"), allowed);
    writeFileSync(join(dir, "README.txt"), "on: push");
    assert.equal(verifyWorkflowPath(dir), 2);

    writeFileSync(join(dir, "ci.yaml"), "on:\\n  pull_request: {}\\n");
    assert.throws(() => verifyWorkflowPath(dir), /ci\\.yaml/);

    rmSync(join(dir, "ci.yaml"));
    rmSync(join(dir, "deploy.yml"));
    assert.throws(() => verifyWorkflowPath(dir), /No YAML workflows/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("directory CLI rejects an automatic CI workflow even if deploy.yml is manual-only", () => {
  const dir = mkdtempSync(join(tmpdir(), "toolify-workflows-cli-"));
  const cli = fileURLToPath(new URL("./verify-manual-deploy.mjs", import.meta.url));
  try {
    writeFileSync(join(dir, "deploy.yml"), allowed);
    writeFileSync(join(dir, "ci.yml"), allowed);
    let result = spawnSync(process.execPath, [cli, dir], { encoding: "utf8" });
    assert.equal(result.status, 0, result.stderr);

    writeFileSync(join(dir, "ci.yml"), "on:\\n  push: {}\\n");
    result = spawnSync(process.execPath, [cli, dir], { encoding: "utf8" });
    assert.equal(result.status, 4, result.stdout);
    assert.match(result.stderr, /ci\\.yml/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
