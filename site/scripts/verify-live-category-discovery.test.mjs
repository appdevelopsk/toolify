import test from "node:test";
import assert from "node:assert/strict";
import { inspectCategoryHtml } from "./verify-live-category-discovery.mjs";

function fixture(locale, { reversed = false, jsonld = true, tip = true } = {}) {
  const label = locale === "ja" ? "日付・時刻" : "Date & Time";
  const links = [
    `<a href="/${locale}/tools/workdays-calculator">Workdays</a>`,
    `<a href="/${locale}/tools/stopwatch">Stopwatch</a>`,
  ];
  if (reversed) links.reverse();
  return [
    `<nav><span>${label}</span></nav>`,
    jsonld ? `<script type="application/ld+json">{"@type":"BreadcrumbList","itemListElement":[{"name":"${label}"}]}</script>` : "",
    locale === "ja" && tip ? "<aside>ヒント：</aside>" : "",
    ...links,
  ].join("");
}
for (const locale of ["en", "ja"]) {
  test(`accepts correct ${locale} category HTML`, () => assert.doesNotThrow(() => inspectCategoryHtml(fixture(locale), locale)));
  test(`rejects reversed ${locale} demand order`, () => assert.throws(() => inspectCategoryHtml(fixture(locale, { reversed:true }), locale), /demand-ranked/));
  test(`rejects missing ${locale} JSON-LD`, () => assert.throws(() => inspectCategoryHtml(fixture(locale, { jsonld:false }), locale), /BreadcrumbList/));
}
test("rejects missing Japanese tip label", () => assert.throws(() => inspectCategoryHtml(fixture("ja", { tip:false }), "ja"), /tip label/));
test("rejects unsupported locales", () => assert.throws(() => inspectCategoryHtml("", "fr"), /Unsupported locale/));
