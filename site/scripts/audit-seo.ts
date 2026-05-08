#!/usr/bin/env tsx
/**
 * Audit SEO basics for every tool message file.
 *
 * Length thresholds are locale-aware:
 *  - Latin scripts (en/de/es/fr/...): titles 30-70, metaDesc 70-170 (Google's SERP pixel budget)
 *  - CJK scripts (ja/zh/ko/th):       titles 15-40, metaDesc 50-100 (CJK chars take ~2× pixel width)
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(__dirname, "..");
const SCAN_DIRS = [path.join(ROOT, "src/tools"), path.join(ROOT, "src/prompts")];

interface ToolMsg {
  title?: string;
  metaDescription?: string;
  keywords?: string[];
  faq?: { q: string; a: string }[];
  article?: { sections?: { heading?: string; paragraphs?: string[] }[] };
}

const CJK = new Set(["ja", "zh-CN", "zh-TW", "ko", "th"]);

function isCjk(filename: string): boolean {
  const locale = filename.replace(/\.json$/, "");
  return CJK.has(locale);
}

function audit(file: string, filename: string): string[] {
  const data = JSON.parse(fs.readFileSync(file, "utf8")) as ToolMsg;
  const cjk = isCjk(filename);
  const errs: string[] = [];

  const titleMin = cjk ? 15 : 20;
  const titleMax = cjk ? 40 : 70;
  const mdMin = cjk ? 50 : 70;
  const mdMax = cjk ? 100 : 170;

  const t = data.title ?? "";
  if (t.length < titleMin || t.length > titleMax) errs.push(`title length ${t.length} (want ${titleMin}-${titleMax})`);
  const md = data.metaDescription ?? "";
  if (md.length < mdMin || md.length > mdMax) errs.push(`metaDescription length ${md.length} (want ${mdMin}-${mdMax})`);
  const kw = data.keywords ?? [];
  if (kw.length < 3 || kw.length > 10) errs.push(`keywords count ${kw.length} (want 3-10)`);
  const faq = data.faq ?? [];
  if (faq.length < 5) errs.push(`faq count ${faq.length} (want >=5 for HCU)`);
  const sections = data.article?.sections ?? [];
  if (sections.length < 2) errs.push(`article.sections ${sections.length} (want >=2)`);
  for (const s of sections) {
    if (!s.heading) errs.push("section missing heading");
    if (!s.paragraphs || s.paragraphs.length < 1) errs.push(`section "${s.heading}" empty`);
  }
  return errs;
}

function main() {
  let totalIssues = 0;
  for (const root of SCAN_DIRS) {
    if (!fs.existsSync(root)) continue;
    const label = path.basename(root);
    for (const slug of fs.readdirSync(root)) {
      const dir = path.join(root, slug, "messages");
      if (!fs.existsSync(dir)) continue;
      for (const f of fs.readdirSync(dir).filter((n) => n.endsWith(".json"))) {
        const errs = audit(path.join(dir, f), f);
        if (errs.length > 0) {
          totalIssues += errs.length;
          console.error(`\n[${label}/${slug}/${f}]`);
          errs.forEach((e) => console.error(`  - ${e}`));
        }
      }
    }
  }
  if (totalIssues > 0) {
    console.error(`\n✗ ${totalIssues} SEO issue(s) found`);
    process.exit(1);
  }
  console.log("✓ SEO audit passed");
}

main();
