/**
 * ビルド出力の canonical / hreflang をデプロイ前に検査する門番。(toolify365)
 *
 * なぜ (2026-08-17):
 *   GSC カバレッジで toolify365 は「クロール済み - 未登録」1,304ページを抱える。
 *   この種の不具合は **HTTP 200 のまま**起きるので外部クロール監査では見えない。
 *   既存の postbuild 門番 (check-built-titles.mjs) は <title> しか見ておらず、
 *   canonical / hreflang は無検査だった。routing.ts の alternateLinks:false のように
 *   「hreflang クラスタが noindex ロケールを指す」事故は過去に実際に起きている。
 *   ソースを読んでも型は通り画面も正常なので、出来上がった HTML を検査する。
 *
 * 検査内容（致命 = デプロイ中止）:
 *   1. index 対象ページに canonical が無い
 *   2. canonical / hreflang が二重ロケール接頭辞 (/en/en/... など)
 *   3. canonical が自己参照でない
 *   4. hreflang クラスタが noindex ロケールを指す（間引き戦略の打ち消し）
 *
 * 検査対象外:
 *   - `noindex` ページ。INDEXED_LOCALES(en/ja/ar/th/tr/fr/ru) 以外の10言語は意図的に noindex。
 *   - 隣の `.meta` が status 404 のプリレンダーページ。404 で配信されるので canonical は無意味。
 *     ★404 判定に HTML 本文を使ってはいけない: not-found 境界のマークアップは全ページの
 *     RSC ペイロードに埋まるため、本文判定にすると全ページが 404 扱いになり検査が空振りする。
 *   - `_` で始まるフレームワーク内部ページ。
 *
 * 使い方: node scripts/check-built-canonical.mjs [.next/server/app]
 */
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = process.env.NEXT_DIST_DIR || ".next";
const DIR = process.argv[2] ?? join(ROOT, DIST, "server/app");
if (!existsSync(DIR)) {
  console.error(`ビルド出力が無い: ${DIR}\n先に npm run build を実行すること。`);
  process.exit(1);
}

const ALL_LOCALES = [
  "en", "ja", "zh-CN", "zh-TW", "ko", "es", "pt-BR", "fr", "de",
  "it", "ru", "ar", "hi", "id", "th", "vi", "tr",
];
// locales.ts の INDEXED_LOCALES と一致させること（片方だけ動かすと検査が嘘をつく）
const INDEXED = ["en", "ja", "ar", "th", "tr", "fr", "ru"];
const NOINDEX_LOCALES = ALL_LOCALES.filter((l) => !INDEXED.includes(l));
const DOUBLE = new RegExp(`/(${ALL_LOCALES.join("|")})/(${ALL_LOCALES.join("|")})(/|$)`);

const files = [];
(function walk(d) {
  for (const e of readdirSync(d)) {
    const p = join(d, e);
    if (statSync(p).isDirectory()) walk(p);
    else if (e.endsWith(".html")) files.push(p);
  }
})(DIR);

const unescapeHtml = (s) => s.replace(/&amp;/g, "&");
const strip = (p) => (p.replace(/\/$/, "") || "/");

function pagePath(file) {
  let p = "/" + relative(DIR, file).replace(/\\/g, "/").replace(/\.html$/, "");
  p = p.replace(/\/index$/, "");
  return p || "/";
}
// localePrefix:"always" なので、ロケール接頭辞の無いページは検査対象外
const isFrameworkPage = (p) => !ALL_LOCALES.includes(p.slice(1).split("/")[0]);
function isNotFoundPage(file) {
  const meta = file.replace(/\.html$/, ".meta");
  if (!existsSync(meta)) return false;
  try { return JSON.parse(readFileSync(meta, "utf-8")).status === 404; } catch { return false; }
}

const missing = [], dblCanonical = [], notSelf = [], dblHreflang = [], badCluster = [];
let skipped = 0, checked = 0;

for (const f of files) {
  const path = pagePath(f);
  if (isFrameworkPage(path) || isNotFoundPage(f)) { skipped++; continue; }
  const html = readFileSync(f, "utf-8");
  if (/<meta[^>]+name="robots"[^>]*content="[^"]*noindex/i.test(html)) { skipped++; continue; }
  checked++;

  const canonTag = html.match(/<link[^>]+rel="canonical"[^>]*>/i);
  if (!canonTag) { missing.push(path); continue; }
  const href = unescapeHtml(canonTag[0].match(/href="([^"]+)"/i)?.[1] ?? "");
  let canonPath = href;
  try { canonPath = new URL(href).pathname; } catch {}

  if (DOUBLE.test(canonPath)) dblCanonical.push({ path, href });
  else if (strip(canonPath) !== strip(path)) notSelf.push({ path, href });

  for (const m of html.matchAll(/<link[^>]+rel="alternate"[^>]+hreflang="([^"]+)"[^>]*>/gi)) {
    const code = m[1];
    const h = unescapeHtml(m[0].match(/href="([^"]+)"/i)?.[1] ?? "");
    let hp = h;
    try { hp = new URL(h).pathname; } catch {}
    if (DOUBLE.test(hp)) { dblHreflang.push({ path, href: h }); break; }
    if (NOINDEX_LOCALES.includes(code)) { badCluster.push({ path, code }); break; }
  }
}

const show = (label, arr, fmt) => {
  if (!arr.length) return;
  console.error(`\n❌ ${label}: ${arr.length}件`);
  for (const x of arr.slice(0, 15)) console.error(`   ${fmt(x)}`);
  if (arr.length > 15) console.error(`   ...他 ${arr.length - 15} 件`);
};
show("canonical が無い", missing, (x) => x);
show("canonical が二重ロケール接頭辞", dblCanonical, (x) => `${x.path} -> ${x.href}`);
show("canonical が自己参照でない", notSelf, (x) => `${x.path} -> ${x.href}`);
show("hreflang が二重ロケール接頭辞", dblHreflang, (x) => `${x.path} -> ${x.href}`);
show("hreflang が noindex ロケールを指す", badCluster, (x) => `${x.path} -> hreflang=${x.code}`);

const fatal = missing.length + dblCanonical.length + notSelf.length + dblHreflang.length + badCluster.length;
if (fatal) {
  console.error(`\n検査 ${checked} ページ / 致命的な問題 ${fatal} 件。デプロイ中止。`);
  process.exit(1);
}
console.log(`✅ canonical/hreflang 検査 OK（検査 ${checked} ページ / 対象外 ${skipped} ページ(noindex・404・内部)）`);
