import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (locale) => JSON.parse(readFileSync(
  new URL(`../src/tools/percentage-calculator/messages/${locale}.json`, import.meta.url), "utf8"
));
const en = read("en");
const ja = read("ja");

test("english and Japanese percentage calculator articles both contain four useful sections", () => {
  assert.equal(en.article.sections.length, 4);
  assert.equal(ja.article.sections.length, 4);
  assert.ok(en.article.sections.every((s) => s.heading && s.paragraphs.length >= 2));
  assert.ok(en.metaDescription.length <= 160);
});

test("worked example results agree with percentage math", () => {
  assert.equal(3480 * 0.15, 522);
  assert.equal(3480 - (3480 * 0.15), 2958);
  assert.equal((42 / 56) * 100, 75);
  assert.equal(((1380 - 1150) / 1150) * 100, 20);
  assert.ok(Math.abs(((1150 - 1380) / 1380) * 100 - (-16.6667)) < 0.01);
});

test("worked examples contain correct values and matching tool modes", () => {
  const copy = en.article.sections.at(-1).paragraphs.join(" ");
  for (const s of ["3,480", "522", "2,958", "42", "56", "75%", "1,150", "1,380", "20%", "16.67%", "Subtract X% from Y", "Change from A to B"]) {
    assert.ok(copy.includes(s), `English worked example missing ${s}`);
  }
  assert.match(ja.article.sections.at(-1).heading, /計算例/);
});

test("existing English FAQ, title and search intent remain unchanged", () => {
  assert.match(en.title, /Percentage Calculator/);
  assert.ok(en.faq.length >= 6);
  assert.ok(en.article.howTo.length >= 4);
});
