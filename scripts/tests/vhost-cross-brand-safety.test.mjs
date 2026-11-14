import test from "node:test";
import assert from "node:assert/strict";
import {existsSync, readFileSync, readdirSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {join, resolve} from "node:path";

const root = fileURLToPath(new URL("../../", import.meta.url));
const workflows = resolve(root, ".github/workflows");
const load = (filename) => readFileSync(join(workflows, filename), "utf8");

test("a Toolify workflow cannot remove or redirect the canonical Toolify domain into FXEA", () => {
  for (const forbidden of ["setup-toolify365-redirect.yml", "setup-fxea365.yml"]) {
    assert.equal(existsSync(join(workflows, forbidden)), false,
      forbidden + " must not be executable from Toolify");
  }
});

test("emergency Toolify restore never edits FXEA virtual-host configuration", () => {
  const source = load("restore-toolify365.yml");
  assert.match(source, /name: Restore toolify365\.com app vhost only/);
  assert.match(source, /workflow_dispatch:/);
  assert.match(source, /server_name toolify365\.com www\.toolify365\.com/);
  assert.doesNotMatch(source, /fxea365\.com/i);
  assert.doesNotMatch(source, /\bon:\s*\n\s+(?:push|schedule):/i);
});

test("no Toolify automation rewrites or deletes a foreign business domain", () => {
  const files = readdirSync(workflows).filter(name => /\.ya?ml$/.test(name));
  assert.ok(files.length >= 1);
  for (const filename of files) {
    const source = load(filename);
    assert.doesNotMatch(source, /return\s+30[1278]\s+https:\/\/fxea365\.com/i,
      filename + " must not redirect Toolify into FXEA");
    assert.doesNotMatch(source, /(?:sudo\s+)?rm\s+(?:-[A-Za-z]+\s+)*[^\n]*fxea365\.com/i,
      filename + " must not delete the FXEA virtual host");
    assert.doesNotMatch(source, /sudo\s+(?:tee|cp|mv|ln)\s+[^\n]*fxea365\.com/i,
      filename + " must not rewrite the FXEA virtual host");
  }
});

test("brand isolation checks run before build and before the VPS SSH stage", () => {
  for (const file of ["ci.yml", "deploy.yml"]) {
    const source = load(file);
    const gate = source.indexOf("node --test ../scripts/tests/vhost-cross-brand-safety.test.mjs");
    assert.ok(gate >= 0, "missing domain safety gate in " + file);
    const build = source.indexOf("npm run build");
    assert.ok(build > gate, "build must follow domain safety gate in " + file);
  }
});

test("production origin is fixed before all release tests, not only during build", () => {
  // 2026-11-14: deploy Vitest read the example.pages.dev fallback because
  // NEXT_PUBLIC_SITE_URL was injected only for the subsequent build step.
  // Keep canonical/robots/sitemap assertions strict, not mocked or skipped.
  for (const file of ["ci.yml", "deploy.yml"]) {
    const workflow = load(file);
    const jobHeader = workflow.split("\n    steps:\n", 1)[0];
    assert.match(jobHeader, /^      NEXT_PUBLIC_SITE_URL: https:\/\/toolify365\.com\s*$/m,
      file + " must set canonical origin at job level before npm test");
    assert.match(workflow, /- name: Unit tests\n\s+run: npm test/,
      file + " must retain real unit tests");
  }
  const config = readFileSync(resolve(root, "site/src/lib/config.ts"), "utf8");
  assert.match(config, /url: process\.env\.NEXT_PUBLIC_SITE_URL/,
    "siteConfig must derive its canonical URL from the guarded job environment");
});
