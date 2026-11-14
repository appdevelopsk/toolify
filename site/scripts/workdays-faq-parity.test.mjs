import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const root = new URL("../src/tools/workdays-calculator/", import.meta.url);
const locales = ["en","ja","es","de","fr","it","pt-BR","ar","zh-CN","zh-TW","ko","hi","id","ru","th","tr","vi"];
const read = name => readFileSync(new URL(name, root), "utf8");

test("all 17 workday locales have an exclusive-date label and correct boundary FAQ", () => {
  for (const lang of locales) {
    const value = JSON.parse(read("messages/" + lang + ".json"));
    const faq = value.faq[lang === "en" ? 2 : 0];
    const label = value.input.excludeEndpoints;
    assert.equal(typeof label, "string", lang + " missing input label");
    assert.ok(label.length >= 6, lang + " input label too short");
    assert.ok(faq.a.includes(label), lang + " FAQ must mention the actual control");
    for (const v of ["0", "1", "2"]) assert.ok(faq.a.includes(v), lang + " FAQ needs 0/1/2 boundary handling");
    assert.ok(value.mode.range && value.mode.add, lang + " two modes must remain");
    assert.ok(value.input.holidays && value.input.includeSat && value.input.includeSun, lang + " original input keys missing");
  }
});

test("English copy uses the existing N-workdays mode and does not suggest manual holiday offsets", () => {
  const english = JSON.parse(read("messages/en.json"));
  assert.match(english.description, /N workdays from a date/);
  assert.match(english.faq[1].a, /on this calculator/);
  assert.match(english.faq[1].a, /All listed custom holidays are applied here/);
  assert.doesNotMatch(english.faq[1].a, /use the Date Calculator|move that result forward one workday/i);
  assert.match(english.article.sections[1].paragraphs[1], /Friday–Saturday weekend is not modeled directly/);
});

test("range UI renders zero-result exclusive counts and restores the checkbox from shared state", () => {
  const component = read("Component.tsx");
  assert.match(component, /useState\(false\);[\s\S]*?\[excludeEndpoints, setExcludeEndpoints\]/);
  assert.match(component, /d\.excludeEndpoints/);
  assert.match(component, /checked=\{excludeEndpoints\}/);
  assert.match(component, /t\("input\.excludeEndpoints"\)/);
  assert.match(component, /countWorkdays\(sd, ed, weekend, hSet, excludeEndpoints\)/);
  assert.match(component, /result && start <= end/);
  assert.match(component, /mode === "range" && excludeEndpoints \? "\+exclusive"/);
});
