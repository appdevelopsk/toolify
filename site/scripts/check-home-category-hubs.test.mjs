import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL("../" + path, import.meta.url), "utf8");

test("homepage links to category hubs only when the category is indexable", () => {
  const home = read("src/app/[locale]/page.tsx");
  const hub = read("src/app/[locale]/tools/category/[cat]/page.tsx");
  const sitemap = read("src/app/sitemap.ts");

  assert.match(home, /listIndexableByCategory/);
  assert.match(home, /href=\{listIndexableByCategory\(cat\)\.length > 0\s*\?\s*`\/tools\/category\/\$\{cat\}`\s*:\s*`\/tools#\$\{cat\}`\}/);
  assert.match(hub, /listIndexableByCategory\(c\)\.length > 0/);
  assert.match(sitemap, /listIndexableByCategory\(c\)\.length > 0/);
  assert.match(hub, /path:\s*`\/tools\/category\/\$\{cat\}`/);
});
