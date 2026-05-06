#!/usr/bin/env tsx
/**
 * Audit i18n: ensure every locale has every key that en has.
 * Walks all top-level message files and per-tool message files.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "src");

type Json = Record<string, unknown>;

function flatten(obj: Json, prefix = ""): string[] {
  const out: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      out.push(...flatten(v as Json, key));
    } else {
      out.push(key);
    }
  }
  return out;
}

function loadJson(file: string): Json {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function activeLocales(): string[] {
  const src = fs.readFileSync(path.join(SRC, "lib/i18n/locales.ts"), "utf8");
  const matches = [...src.matchAll(/code:\s*"([^"]+)",.*?active:\s*true/g)];
  return matches.map((m) => m[1]!);
}

function auditFolder(folder: string, label: string, locales: string[]): number {
  const enFile = path.join(folder, "en.json");
  if (!fs.existsSync(enFile)) {
    console.warn(`[skip] ${label}: no en.json`);
    return 0;
  }
  const enKeys = new Set(flatten(loadJson(enFile)));
  let issues = 0;
  for (const locale of locales) {
    if (locale === "en") continue;
    const file = path.join(folder, `${locale}.json`);
    if (!fs.existsSync(file)) {
      console.error(`[missing] ${label}: ${locale}.json not found`);
      issues++;
      continue;
    }
    const keys = new Set(flatten(loadJson(file)));
    const missing = [...enKeys].filter((k) => !keys.has(k));
    const extra = [...keys].filter((k) => !enKeys.has(k));
    if (missing.length || extra.length) {
      console.error(`[diff] ${label} (${locale}):`);
      missing.forEach((k) => console.error(`  - missing: ${k}`));
      extra.forEach((k) => console.error(`  + extra:   ${k}`));
      issues++;
    }
  }
  return issues;
}

function main() {
  const locales = activeLocales();
  console.log(`Active locales: ${locales.join(", ")}`);
  let totalIssues = 0;
  totalIssues += auditFolder(path.join(SRC, "messages"), "common", locales);
  const toolsDir = path.join(SRC, "tools");
  for (const slug of fs.readdirSync(toolsDir)) {
    const folder = path.join(toolsDir, slug, "messages");
    if (fs.existsSync(folder)) {
      totalIssues += auditFolder(folder, `tools/${slug}`, locales);
    }
  }
  if (totalIssues > 0) {
    console.error(`\n✗ ${totalIssues} i18n issue(s) found`);
    process.exit(1);
  }
  console.log("\n✓ i18n consistency OK");
}

main();
