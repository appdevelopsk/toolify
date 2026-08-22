/**
 * ビルド出力の meta description をデプロイ前に検査する門番。(toolify365)
 *
 * なぜ (2026-08-23):
 *   Bing WMT のエラーは実質すべて「メタ説明が長すぎます」だった
 *   ([[bing-errors-are-all-meta-description]])。出口 `buildMetadata()` の
 *   clampDescription() で 160 コードポイントに一括クランプ済みだが、
 *   postbuild の門番は <title> と canonical しか見ておらず description は無検査。
 *   `buildMetadata()` を通さず自前で `export const metadata` を書いたルートが
 *   1本増えるだけで再発し、しかも型は通り画面も正常なので気づけない。
 *   → 出来上がった HTML を検査する。
 *
 *   ★clamp は**コードポイント数**で行う（Bing/Google の切り基準）。
 *     表示幅(全角2)で測ると日本語の適正な160字が「298」に見えて偽陽性になる。
 *     幅は SERP の見た目の話なので警告どまりにする。
 *
 * 致命 (デプロイ中止):
 *   1. index 対象ページに description が無い / 空
 *   2. description / og:description / twitter:description が 160 コードポイント超
 *      = clamp をすり抜けた（buildMetadata() を経由していないルート）
 *   3. description に生の翻訳キーが出ている
 *   4. 3タグの不一致（buildMetadata() は同一値を入れるので、ズレ = 別経路）
 *
 * 警告 (出荷は止めない, [[build-gate-severity-split]]):
 *   - 表示幅が 300 超（SERP で切れるだけ。ページは機能しインデックスもされる）
 *   - 50 コードポイント未満（薄い説明文。順位への実害は未確認）
 *
 * 検査対象外: noindex ページ、隣の .meta が status 404 のプリレンダー、`_` 始まり。
 *
 * 使い方: node scripts/check-built-descriptions.mjs [.next/server/app]
 */
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = process.env.NEXT_DIST_DIR || ".next";
const DIR = process.argv[2] ?? join(ROOT, DIST, "server/app");
if (!existsSync(DIR)) {
  console.error(`ビルド出力が無い: ${DIR}\n先に npm run build を実行すること。`);
  process.exit(1);
}

// buildMetadata() の MAX_DESC と一致させること（片方だけ動かすと門番が嘘をつく）。
const MAX_DESC = 160;
const WARN_WIDTH = 300;
const MIN_DESC = 50;

const WIDE = /[ᄀ-ᅟ⺀-꓏가-힣豈-﫿︰-﹏＀-｠￠-￦]/;
const serpWidth = (t) => [...t].reduce((n, c) => n + (WIDE.test(c) ? 2 : 1), 0);
// ★HTML属性値は必ずアンエスケープしてから数えること。&amp; を5文字で数えると
//   偽陽性になる（[[verify-with-the-gates-own-normalizer]]）。
const unescapeHtml = (s) =>
  s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&#39;/g, "'");

const files = [];
(function walk(d) {
  for (const e of readdirSync(d)) {
    const p = join(d, e);
    if (statSync(p).isDirectory()) walk(p);
    else if (e.endsWith(".html")) files.push(p);
  }
})(DIR);

/** 隣の .meta が 404 のプリレンダーは 404 配信なので検査しない。
 *  ★404 判定に HTML 本文を使うな: not-found 境界のマークアップは全ページの
 *  RSC ペイロードに埋まっており、本文判定にすると全ページが 404 扱いになって
 *  検査が空振りする（check-built-canonical.mjs と同じ罠）。 */
function isNotFound(file) {
  const meta = file.replace(/\.html$/, ".meta");
  if (!existsSync(meta)) return false;
  try {
    return JSON.parse(readFileSync(meta, "utf8")).status === 404;
  } catch {
    return false;
  }
}

// ★1タグ1行とは限らない。属性抽出は行単位 grep ではなく全文の正規表現で行う
//   （[[line-anchored-grep-misses-inline-props]]）。
const TAGS = [
  ["description", /<meta name="description" content="([^"]*)"/],
  ["og:description", /<meta property="og:description" content="([^"]*)"/],
  ["twitter:description", /<meta name="twitter:description" content="([^"]*)"/],
];

const missing = [], empty = [], over = [], rawKey = [], mismatch = [];
const wide = [], thin = [];
let checked = 0;

for (const f of files) {
  const rel = f.slice(DIR.length + 1).replace(/\.html$/, "");
  if (rel.startsWith("_") || rel.split("/").some((s) => s.startsWith("_"))) continue;
  const html = readFileSync(f, "utf8");
  const rb = html.match(/<meta name="robots" content="([^"]*)"/);
  if (rb && /noindex/.test(rb[1])) continue;
  if (isNotFound(f)) continue;
  checked++;

  const vals = {};
  for (const [name, re] of TAGS) {
    const m = html.match(re);
    if (!m) continue;
    vals[name] = unescapeHtml(m[1]).replace(/\s+/g, " ").trim();
  }

  const d = vals["description"];
  if (d === undefined) { missing.push(rel); continue; }
  if (!d) { empty.push(rel); continue; }

  for (const [name, v] of Object.entries(vals)) {
    const n = [...v].length;
    if (n > MAX_DESC) over.push(`${n}字  ${rel}  [${name}]  ${v.slice(0, 60)}…`);
  }
  if (/^[a-z][A-Za-z0-9_]*(\.[A-Za-z0-9_]+)+(\s|$)/.test(d)) rawKey.push(`${rel}  ${d.slice(0, 80)}`);

  const others = Object.entries(vals).filter(([k]) => k !== "description");
  for (const [name, v] of others) {
    if (v !== d) mismatch.push(`${rel}  [${name}] が description と不一致`);
  }

  const w = serpWidth(d);
  if (w > WARN_WIDTH) wide.push(`幅${w}  ${rel}`);
  if ([...d].length < MIN_DESC) thin.push(`${[...d].length}字  ${rel}`);
}

const fatal = [
  [`description が無い`, missing],
  [`description が空`, empty],
  [`description が ${MAX_DESC} コードポイント超（clamp をすり抜けている）`, over],
  [`description に生の翻訳キーが出ている`, rawKey],
  [`description / og / twitter が不一致（buildMetadata() を経由していない）`, mismatch],
];

let failed = 0;
console.log(`検査対象: ${checked} ページ (index対象 / ${files.length} HTML中) — ${DIR.replace(ROOT + "/", "")}`);
for (const [label, list] of fatal) {
  if (!list.length) { console.log(`  ✓ ${label}: 0`); continue; }
  failed += list.length;
  console.error(`  ✗ ${label}: ${list.length}`);
  for (const x of list.slice(0, 8)) console.error(`      ${x}`);
  if (list.length > 8) console.error(`      … 他 ${list.length - 8} 件`);
}
for (const [label, list] of [
  [`description の表示幅が ${WARN_WIDTH} 超（SERPで切れる）`, wide],
  [`description が ${MIN_DESC} コードポイント未満（薄い）`, thin],
]) {
  if (!list.length) continue;
  console.warn(`  ⚠ ${label}: ${list.length}【警告・出荷は止めない】`);
  for (const x of list.slice(0, 8)) console.warn(`      ${x}`);
  if (list.length > 8) console.warn(`      … 他 ${list.length - 8} 件`);
}
if (failed) { console.error(`\n❌ ${failed} 件。出荷しない。`); process.exit(1); }
console.log("\n✓ ビルド出力の meta description 検査を通過");
