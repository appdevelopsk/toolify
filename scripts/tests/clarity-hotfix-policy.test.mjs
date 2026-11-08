import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";
import { canLoadClarity } from "../../site/src/lib/analytics/clarity-policy.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");
const read = (file) => readFileSync(join(ROOT, file), "utf8");

test("Clarity vendor is disabled when the ID is present but review is absent", () => {
  for (const approval of [undefined, "", "true", "false", "approved", "pending", "CONFIRMED"]) {
    assert.equal(canLoadClarity("existing-production-project", approval), false);
  }
});

test("Clarity vendor requires a nonblank ID and explicit opt-in", () => {
  for (const id of ["", " ", "\t\n"]) {
    assert.equal(canLoadClarity(id, "confirmed"), false);
  }
  assert.equal(canLoadClarity("existing-production-project", "confirmed"), true);
});

test("Next.js Clarity script is gated by the explicit build-time setting", () => {
  const src = read("site/src/lib/analytics/clarity.tsx");
  assert.ok(src.includes('import { canLoadClarity } from "./clarity-policy"'));
  assert.ok(src.includes("if (!canLoadClarity(id, process.env.NEXT_PUBLIC_CLARITY_URL_PRIVACY_APPROVED)) return null;"));
  assert.ok(src.includes('id="clarity-init"'));
  assert.ok(!src.includes("if (!id) return null"));
});

test("the default environment does not implicitly enable Clarity recording", () => {
  const env = read("site/.env.example");
  assert.match(env, /^NEXT_PUBLIC_CLARITY_PROJECT_ID=$/m);
  assert.match(env, /^NEXT_PUBLIC_CLARITY_URL_PRIVACY_APPROVED=$/m);
});
