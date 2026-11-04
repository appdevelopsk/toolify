import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL("../" + path, import.meta.url), "utf8");

test("tool breadcrumbs skip nonindexable category hubs in locale exceptions", () => {
  const page = read("src/app/[locale]/tools/[slug]/page.tsx");
  const sitemap = read("src/app/sitemap.ts");
  const locales = read("src/lib/i18n/locales.ts");
  assert.match(page, /isIndexedLocale\(locale\) \? \[\{/);
  assert.match(page, /tools\/category\/\$\{tool\.category\}/);
  assert.match(page, /breadcrumbJsonLd\(\[/);
  assert.match(sitemap, /const IDX = LOCALES\.filter\(isIndexedLocale\)/);
  assert.match(locales, /INDEXED_LOCALES: Locale\[\] = \["en", "ja"\]/);
  for (const locale of ["en", "ja", "th", "ru", "tr", "ar", "fr", "es"]) {
    const indexed = ["en", "ja"].includes(locale);
    const path = indexed ? `/${locale}/tools/category/math` : null;
    assert.equal(Boolean(path), indexed);
  }
});
