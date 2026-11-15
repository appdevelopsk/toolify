import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = path => readFileSync(new URL(path, import.meta.url), "utf8");
const hub = read("../src/app/[locale]/pregnancy/page.tsx");
const tools = read("../src/lib/tools/registry.ts");
const locales = read("../src/lib/i18n/locales.ts");
const sitemap = read("../src/app/sitemap.ts");

test("pregnancy hub keeps all seven actual utility steps for visitors", () => {
  const match = hub.match(/const CLUSTER = \[([\s\S]*?)\] as const;/);
  assert.ok(match, "tool journey CLUSTER missing");
  const slugs = [...match[1].matchAll(/"([a-z-]+)"/g)].map(m => m[1]);
  assert.deepEqual(slugs, [
    "menstrual-cycle-calculator", "ovulation-calculator",
    "conception-date-calculator", "due-date-calculator",
    "pregnancy-week-calculator", "pregnancy-weight-gain-calculator",
    "hcg-calculator",
  ]);
  assert.match(hub, /tools\.map\(\(m, i\) =>/); // Visible journey is not pruned.
});

test("published pregnancy ItemList only describes locally indexable URLs", () => {
  assert.match(hub, /import \{ getTool, isIndexableIn \} from "@\/lib\/tools\/registry";/);
  assert.match(hub, /const indexableTools = tools\.filter\(\(tool\) => isIndexableIn\(locale, tool\.slug\)\);/);
  assert.match(hub, /numberOfItems: indexableTools\.length/);
  assert.match(hub, /itemListElement: indexableTools\.map\(/);
  assert.match(hub, /\{indexableTools\.length > 0 && \(/);
  assert.match(tools, /export function isIndexableIn\(locale: string, slug: string\): boolean/);
});

test("locale-indexing policy and sitemap use the same source of truth", () => {
  assert.match(locales, /export const INDEXED_LOCALES: Locale\[\] = \["en", "ja"\];/);
  assert.match(tools, /if \(INDEXED_SLUGS\.has\(slug\) && isIndexedLocale\(locale\)\) return true;/);
  assert.match(tools, /INDEX_EXCEPTIONS\[locale\]\?\.includes\(slug\)/);
  assert.match(sitemap, /indexableLocalesFor\(tool\.slug\)/);
  assert.match(sitemap, /listIndexableByCategory\(c\)\.length > 0/);
});
