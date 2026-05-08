// Comprehensive smoke test: every (locale, tool) URL — verifies HTTP 200,
// correct <html lang>, 6 hreflang alternates, structured data presence.

import { readdirSync } from "node:fs";
import path from "node:path";

const ORIGIN = "https://tools.appdevelopsk.com";
const LOCALES = ["en", "ja", "zh-CN", "zh-TW", "ko", "es"];

const TOOLS_DIR = path.join(process.cwd(), "src/tools");
const PROMPTS_DIR = path.join(process.cwd(), "src/prompts");
const slugs = readdirSync(TOOLS_DIR).filter((s) => !s.startsWith("."));
const promptSlugs = readdirSync(PROMPTS_DIR).filter((s) => !s.startsWith("."));

// Categories actually present in prompts (for /prompts/category/[cat] URLs)
const promptCats = new Set();
for (const slug of promptSlugs) {
  try {
    const indexFile = path.join(PROMPTS_DIR, slug, "index.ts");
    const txt = readdirSync(path.join(PROMPTS_DIR, slug)).includes("index.ts")
      ? (await import("node:fs")).readFileSync(indexFile, "utf8")
      : "";
    const m = txt.match(/category:\s*"([^"]+)"/);
    if (m) promptCats.add(m[1]);
  } catch {}
}

const targets = [];
// non-locale-specific
targets.push({ kind: "root-redirect", url: `${ORIGIN}/` });
targets.push({ kind: "sitemap", url: `${ORIGIN}/sitemap.xml` });
targets.push({ kind: "robots", url: `${ORIGIN}/robots.txt` });
targets.push({ kind: "ads", url: `${ORIGIN}/ads.txt` });
// per-locale index pages
for (const L of LOCALES) {
  targets.push({ kind: "locale-home", url: `${ORIGIN}/${L}`, locale: L });
  targets.push({ kind: "locale-tools", url: `${ORIGIN}/${L}/tools`, locale: L });
  targets.push({ kind: "locale-prompts", url: `${ORIGIN}/${L}/prompts`, locale: L });
  targets.push({ kind: "locale-privacy", url: `${ORIGIN}/${L}/privacy`, locale: L });
  targets.push({ kind: "locale-terms", url: `${ORIGIN}/${L}/terms`, locale: L });
  targets.push({ kind: "locale-about", url: `${ORIGIN}/${L}/about`, locale: L });
  targets.push({ kind: "locale-contact", url: `${ORIGIN}/${L}/contact`, locale: L });
  targets.push({ kind: "locale-disclosure", url: `${ORIGIN}/${L}/disclosure`, locale: L });
  for (const slug of slugs) {
    targets.push({ kind: "tool", url: `${ORIGIN}/${L}/tools/${slug}`, locale: L, slug });
  }
  for (const slug of promptSlugs) {
    targets.push({ kind: "prompt", url: `${ORIGIN}/${L}/prompts/${slug}`, locale: L, slug });
  }
  for (const cat of promptCats) {
    targets.push({ kind: "prompt-cat", url: `${ORIGIN}/${L}/prompts/category/${cat}`, locale: L });
  }
}

console.log(`[smoke] Auditing ${targets.length} URLs concurrently (limit 16)…`);

const concurrency = 16;
const issues = [];
let pos = 0;
let done = 0;

async function checkOne(t) {
  try {
    const res = await fetch(t.url, { redirect: "manual" });
    const status = res.status;
    if (t.kind === "root-redirect") {
      if (status < 300 || status >= 400) issues.push({ ...t, issue: `expected redirect, got HTTP ${status}` });
      return;
    }
    if (status !== 200) {
      issues.push({ ...t, issue: `HTTP ${status}` });
      return;
    }
    if (t.kind !== "tool" && t.kind !== "locale-home" && t.kind !== "locale-tools" && !t.kind.startsWith("locale-")) {
      return; // skip HTML checks for non-html
    }
    if (!t.locale) return;
    const html = await res.text();

    // <html lang="...">
    const langMatch = html.match(/<html\s+[^>]*lang="([^"]+)"/);
    if (!langMatch || langMatch[1].toLowerCase() !== t.locale.toLowerCase()) {
      issues.push({ ...t, issue: `wrong html lang (got ${langMatch?.[1]} want ${t.locale})` });
    }

    // hreflang count: 6 locales + x-default = 7
    const hrefLangCount = (html.match(/hrefLang="/g) || []).length;
    if (hrefLangCount < 7) {
      issues.push({ ...t, issue: `hreflang count ${hrefLangCount} < 7` });
    }

    // For tool pages, check SoftwareApplication & FAQPage in JSON-LD
    if (t.kind === "tool") {
      if (!html.includes('"@type":"SoftwareApplication"')) {
        issues.push({ ...t, issue: "missing SoftwareApplication JSON-LD" });
      }
      if (!html.includes('"@type":"FAQPage"')) {
        issues.push({ ...t, issue: "missing FAQPage JSON-LD" });
      }
    }
    // For prompt pages, check Article + FAQPage + BreadcrumbList in JSON-LD
    if (t.kind === "prompt") {
      if (!html.includes('"@type":"Article"')) {
        issues.push({ ...t, issue: "missing Article JSON-LD" });
      }
      if (!html.includes('"@type":"FAQPage"')) {
        issues.push({ ...t, issue: "missing FAQPage JSON-LD" });
      }
      if (!html.includes('"@type":"BreadcrumbList"')) {
        issues.push({ ...t, issue: "missing BreadcrumbList JSON-LD" });
      }
    }
  } catch (err) {
    issues.push({ ...t, issue: `fetch error: ${err.message}` });
  } finally {
    done++;
    if (done % 50 === 0 || done === targets.length) {
      process.stdout.write(`\r[smoke] ${done}/${targets.length} (${Math.round((done/targets.length)*100)}%) — issues: ${issues.length}      `);
    }
  }
}

async function worker() {
  while (pos < targets.length) {
    const t = targets[pos++];
    if (!t) return;
    await checkOne(t);
  }
}

const start = Date.now();
await Promise.all(Array.from({ length: concurrency }, worker));
const elapsed = ((Date.now() - start) / 1000).toFixed(1);

console.log(`\n[smoke] Done in ${elapsed}s\n`);

// Group issues
const byIssue = new Map();
for (const i of issues) {
  const key = i.issue;
  if (!byIssue.has(key)) byIssue.set(key, []);
  byIssue.get(key).push(i);
}

if (issues.length === 0) {
  console.log("✅ ALL PASS — 0 issues across " + targets.length + " URLs");
} else {
  console.log("❌ " + issues.length + " issues found:\n");
  for (const [issue, list] of [...byIssue.entries()].sort((a, b) => b[1].length - a[1].length)) {
    console.log(`  [${list.length}] ${issue}`);
    for (const x of list.slice(0, 3)) console.log(`      ${x.url}`);
    if (list.length > 3) console.log(`      … and ${list.length - 3} more`);
  }
  process.exit(1);
}
