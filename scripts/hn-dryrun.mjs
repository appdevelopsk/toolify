// Dry-run: parse hn-show-content.txt and print what would be filled, without launching a browser.
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONTENT_FILE = path.join(__dirname, "hn-show-content.txt");

if (!existsSync(CONTENT_FILE)) {
  console.error(`✗ Missing: ${CONTENT_FILE}`);
  process.exit(1);
}

const raw = readFileSync(CONTENT_FILE, "utf8");
const [meta, body] = raw.split(/^---\s*$/m);
if (!meta || !body) {
  console.error("✗ File must have 'TITLE:', 'URL:', then '---', then body.");
  process.exit(1);
}

const titleMatch = meta.match(/^TITLE:\s*(.+)$/m);
const urlMatch = meta.match(/^URL:\s*(.+)$/m);
if (!titleMatch || !urlMatch) {
  console.error("✗ Missing TITLE: or URL: line.");
  process.exit(1);
}

const TITLE = titleMatch[1].trim();
const URL = urlMatch[1].trim();
const BODY = body.trim();

console.log("─── Will be filled into HN ───────────────────────────");
console.log();
console.log("Title (≤80 chars HN limit):");
console.log("  " + TITLE);
console.log("  → length: " + TITLE.length + " chars (HN max 80)");
console.log();
console.log("URL:");
console.log("  " + URL);
console.log();
console.log("First comment body (no HN limit but >2000 risks tl;dr):");
console.log("  " + BODY.length + " chars, " + BODY.split("\n").length + " lines");
console.log();
console.log("─── Body preview (first 500 chars) ──────────────────");
console.log(BODY.slice(0, 500) + (BODY.length > 500 ? "…" : ""));
console.log();
console.log("─── Sanity checks ────────────────────────────────────");
const issues = [];
if (TITLE.length > 80) issues.push("Title >80 chars (HN limit)");
if (!TITLE.startsWith("Show HN:")) issues.push("Title doesn't start with 'Show HN:'");
if (!URL.startsWith("https://")) issues.push("URL not https://");
if (BODY.length < 100) issues.push("Body looks too short (<100 chars)");
if (BODY.length > 5000) issues.push("Body very long (>5000 chars) — consider trimming");
if (issues.length === 0) {
  console.log("✓ All checks pass. Run: node scripts/hn-post.mjs");
} else {
  issues.forEach((i) => console.log("  ⚠ " + i));
}
