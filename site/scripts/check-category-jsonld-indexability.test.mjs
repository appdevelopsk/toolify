import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = path => readFileSync(new URL("../" + path, import.meta.url), "utf8");

test("category JSON-LD includes only tools indexed for the active locale", () => {
  const page = read("src/app/[locale]/tools/category/[cat]/page.tsx");
  const registry = read("src/lib/tools/registry.ts");
  assert.match(page, /const indexableTools = tools\.filter\(\(m\) => isIndexableIn\(locale, m\.slug\)\);/);
  assert.match(page, /numberOfItems: indexableTools\.length/);
  assert.match(page, /itemListElement: indexableTools\.map\(/);
  assert.match(page, /\{indexableTools\.length > 0 && \(/);
  assert.match(page, /tools\.map\(\(m\) => \(/); // visitor-facing cards are unchanged
  assert.match(registry, /export function isIndexableIn\(locale: string, slug: string\)/);
  assert.doesNotMatch(page, /numberOfItems: tools\.length/);
});
