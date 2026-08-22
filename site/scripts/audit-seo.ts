#!/usr/bin/env tsx
/**
 * Audit SEO basics for every tool message file.
 *
 * 長さは**文字数ではなく SERP 表示幅**で測る（East Asian Width W/F を 2 幅として数える）。
 * こうすると ja/zh/ko と Latin を同じ閾値で扱えるので、ロケール分岐そのものが不要になる。
 *   titles 20-70 / metaDesc 70-170（Google/Bing の SERP ピクセル予算に対応）
 *
 * ★2026-08-22: 以前は th を CJK 扱いして title 40「文字」上限を当てていた。タイ文字は
 * East Asian Width が Neutral で**幅1**なので、これは英語に40字制限を課すのと同じ。
 * この誤った門番を通すために翻訳データ側が語中で切られており、Bing のエラーの一因だった。
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

/** SERP は文字数ではなく表示幅で切れる。全角(East Asian Width W/F)は2幅。 */
const WIDE = /[\u1100-\u115F\u2E80-\uA4CF\uAC00-\uD7A3\uF900-\uFAFF\uFE30-\uFE4F\uFF00-\uFF60\uFFE0-\uFFE6]/;
function serpWidth(text: string): number {
  let w = 0;
  for (const c of text) w += WIDE.test(c) ? 2 : 1;
  return w;
}

function audit(file: string): string[] {
  const data = JSON.parse(fs.readFileSync(file, "utf8")) as ToolMsg;
  const errs: string[] = [];

  const titleMin = 20;
  const titleMax = 70;
  const mdMin = 70;
  // 出口の buildMetadata() が 160 コードポイントでクランプするため、ここは幅 170 まで許容。
  const mdMax = 170;

  const t = data.title ?? "";
  const tw = serpWidth(t);
  if (tw < titleMin || tw > titleMax) errs.push(`title width ${tw} (want ${titleMin}-${titleMax})`);
  const md = data.metaDescription ?? "";
  const mdw = serpWidth(md);
  if (mdw < mdMin || mdw > mdMax) errs.push(`metaDescription width ${mdw} (want ${mdMin}-${mdMax})`);
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
        const errs = audit(path.join(dir, f));
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
