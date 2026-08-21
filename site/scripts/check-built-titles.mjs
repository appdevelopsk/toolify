/**
 * ビルド出力の <title> をデプロイ前に検査する門番。(toolify365)
 *
 * なぜソースではなく出力を見るか (2026-08-04):
 *   この日に見つけた不具合は「ソースを読んでも分からない」形だった。
 *     - `/ea/cross-broker` の全17ページが `<title>crossBrokerPage.meta_title | FXEA</title>`
 *       になっていた。next-intl は欠落キーで throw せず getMessageFallback が
 *       キー文字列を返すため、`try { t(k) } catch { fallback }` が永久に発火しない。
 *     - index対象 2,708 ページ中 1,869 の <title> が表示幅60を超えて SERP で切れていた。
 *     - `/ea/nanpin` は本文まで翻訳キーが並んでいた（eaPages.nanpin が空 {}）。
 *   いずれも画面を見ても気づけないので、出来上がった HTML を検査する。
 *
 * 使い方: node scripts/check-built-titles.mjs [.next/server/app]
 */
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIR = process.argv[2] ?? join(ROOT, ".next/server/app");
if (!existsSync(DIR)) {
  console.error(`ビルド出力が無い: ${DIR}\n先に npm run build を実行すること。`);
  process.exit(1);
}

const WIDE = /[ᄀ-ᅟ⺀-꓏가-힣豈-﫿︰-﹏＀-｠￠-￦]/;
const width = (t) => [...t].reduce((n, c) => n + (WIDE.test(c) ? 2 : 1), 0);
const LIMIT = 60;
const unescapeHtml = (s) => s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
  .replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&#39;/g, "'");

const files = [];
(function walk(d) {
  for (const e of readdirSync(d)) {
    const p = join(d, e);
    if (statSync(p).isDirectory()) walk(p);
    else if (e.endsWith(".html")) files.push(p);
  }
})(DIR);

const wide = [], raw = [], empty = [], dbl = [];
const byPath = new Map();
const LOCALES = new Set(["en","zh-CN","zh-TW","ko","ar","de","es","fr","hi","id","it","pt-BR","ru","th","tr","vi","ja"]);

for (const f of files) {
  const html = readFileSync(f, "utf8");
  const rb = html.match(/<meta name="robots" content="([^"]*)"/);
  if (rb && /noindex/.test(rb[1])) continue;
  const m = html.match(/<title>([\s\S]*?)<\/title>/);
  if (!m) continue;
  const title = unescapeHtml(m[1].replace(/\s+/g, " ").trim());
  const rel = f.slice(DIR.length + 1).replace(/\.html$/, "");
  if (!title) { empty.push(rel); continue; }
  if (width(title) > LIMIT) wide.push(`${width(title)}  ${rel}  ${title}`);
  if (/^[a-z][A-Za-z0-9_]*(\.[A-Za-z0-9_]+)+(\s|$|\|)/.test(title)) raw.push(`${rel}  ${title}`);
  // ★ブランドの二重付与。部分文字列で見ると "FXEA365 … | FXEA" の "FXEA365" が
  //   "FXEA" を含むだけで誤検知する。`|` で切った**セグメント単位**で比べる。
  const segs = title.split("|").map((x) => x.trim()).filter(Boolean);
  if (segs.length >= 2) {
    const last = segs[segs.length - 1];
    const dup = segs.slice(0, -1).some(
      (s) => !s.includes(" ") && (s === last || s.startsWith(last) || last.startsWith(s)),
    );
    if (dup) dbl.push(`${rel}  ${title}`);
  }

  const seg = rel.split("/");
  const loc = LOCALES.has(seg[0]) ? seg[0] : "ja";
  const rest = LOCALES.has(seg[0]) ? seg.slice(1).join("/") : rel;
  if (!byPath.has(rest)) byPath.set(rest, new Map());
  byPath.get(rest).set(loc, title);
}

// 非日本語ロケールが5つ以上あって全て同じ文字列 = metadata が未翻訳
const untranslated = [];
for (const [rest, byLoc] of byPath) {
  const nonJa = [...byLoc].filter(([l]) => l !== "ja").map(([, t]) => t);
  if (nonJa.length < 5) continue;
  if (new Set(nonJa).size === 1) untranslated.push(`${nonJa.length}ロケール  /${rest}  ${nonJa[0]}`);
}

// 重大度を2段に分ける（2026-08-21）。
// 空 / 生キー / ブランド二重 / 未翻訳 は「壊れている・重複判定を食らう」＝出荷を止める。
// 幅超過は SERP で末尾が切れるだけで、ページは正しく機能しインデックスもされる。
// 実際 ar/tr/fr は幅超過のタイトルのまま順位 1.4〜3.7 を取っていた（GSC 04-01〜06-18）。
// これを致命にすると、全17言語ぶんのタイトル短縮が終わるまで一切出荷できず、
// 収益に直結する noindex 解除まで人質に取られる。よって警告（非致命）に降格し、
// 件数は必ず出し続けてバックログとして可視化する。
const checks = [
  ["<title> が空", empty],
  ["<title> に生の翻訳キーが出ている", raw],
  ["<title> にブランドが二重に付いている", dbl],
  ["<title> が非日本語ロケール全部で同一（metadata が未翻訳）", untranslated],
];

let failed = 0;
console.log(`検査対象: ${files.length} ファイル (${DIR.replace(ROOT + "/", "")})`);
for (const [label, list] of checks) {
  if (!list.length) { console.log(`  ✓ ${label}: 0`); continue; }
  failed += list.length;
  console.error(`  ✗ ${label}: ${list.length}`);
  for (const x of list.slice(0, 8)) console.error(`      ${x}`);
  if (list.length > 8) console.error(`      … 他 ${list.length - 8} 件`);
}
if (wide.length) {
  console.warn(`  ⚠ <title> の表示幅が ${LIMIT} 超（SERPで切れる）: ${wide.length}【警告・出荷は止めない】`);
  for (const x of wide.slice(0, 8)) console.warn(`      ${x}`);
  if (wide.length > 8) console.warn(`      … 他 ${wide.length - 8} 件`);
}
if (failed) { console.error(`\n❌ ${failed} 件。出荷しない。`); process.exit(1); }
console.log("\n✓ ビルド出力の <title> 検査を通過");
