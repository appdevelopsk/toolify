#!/usr/bin/env node
// One-off fixer: convert article.sections[].body → paragraphs[], and faq.items[] → faq[].
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const TARGETS = [
  "mortgage-refinance-calculator",
  "lease-vs-buy-calculator",
  "cost-of-living-comparison",
  "investment-fee-impact-calculator",
];

const ROOT = path.resolve(process.cwd(), "src/tools");

let touched = 0;
for (const slug of TARGETS) {
  const dir = path.join(ROOT, slug, "messages");
  for (const f of readdirSync(dir).filter((n) => n.endsWith(".json"))) {
    const file = path.join(dir, f);
    const data = JSON.parse(readFileSync(file, "utf8"));
    let changed = false;

    if (data.article?.sections) {
      for (const s of data.article.sections) {
        if (typeof s.body === "string" && !s.paragraphs) {
          s.paragraphs = [s.body];
          delete s.body;
          changed = true;
        }
      }
    }

    if (data.faq && !Array.isArray(data.faq) && Array.isArray(data.faq.items)) {
      data.faq = data.faq.items;
      changed = true;
    }

    if (changed) {
      writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
      touched++;
      console.log(`✓ ${slug}/${f}`);
    }
  }
}
console.log(`\nFixed ${touched} files.`);
