/**
 * もしもアフィリエイト — 正しい検索フォーム(name=words)で各プログラムを探す
 * node scripts/asp-moshimo-search.mjs
 */

import { chromium } from "playwright";
import { mkdirSync, existsSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadCreds } from "./asp-creds.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const userDataDir = path.join(homedir(), ".cache/toolify-playwright/moshimo-profile3");
const outDir = path.join(__dirname, "asp-output");
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

const CREDS = loadCreds("moshimo");
const SHOP_SITE_ID = "671899";

// 金融カテゴリの candidate IDs (先ほど取得)
const FINANCE_IDS = ["6671", "7059", "7127", "7186", "7196", "7248", "7276", "7301", "7333", "7356"];
// 健康カテゴリの candidate IDs
const HEALTH_IDS = ["3367", "5452", "6784", "7133", "7208", "7246", "7255", "7399", "7415", "7437"];

const TARGETS = [
  { keyword: "楽天証券", catalogId: "rakuten-securities-jp", category: "finance" },
  { keyword: "楽天カード", catalogId: "rakuten-card-jp", category: "finance" },
  { keyword: "SBI証券", catalogId: "sbi-securities-jp", category: "finance" },
  { keyword: "マイプロテイン", catalogId: "myprotein-jp", category: "health" },
  { keyword: "iHerb", catalogId: "iherb-global", category: "health" },
  { keyword: "あすけん", catalogId: "asken-jp", category: "health" },
];

const ctx = await chromium.launchPersistentContext(userDataDir, {
  headless: false,
  viewport: { width: 1280, height: 900 },
  userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
  ignoreDefaultArgs: ["--enable-automation"],
  args: ["--disable-blink-features=AutomationControlled", "--no-first-run"],
});
const page = ctx.pages()[0] ?? (await ctx.newPage());

await page.goto("https://af.moshimo.com/af/shop/login", { waitUntil: "networkidle" });
if (await page.locator("input[name=password]").count() > 0) {
  await page.locator("input[name=account]").fill(CREDS.username);
  await page.locator("input[name=password]").fill(CREDS.password);
  await page.locator("input[name=login]").click();
  await page.waitForNavigation({ waitUntil: "networkidle", timeout: 20000 }).catch(() => {});
}
console.log("✓ ログイン");

// ── カテゴリIDの詳細名称を確認 ──
async function getPromotionName(id) {
  const url = `https://af.moshimo.com/af/shop/promotion/detail?promotion_id=${id}&shop_site_id=${SHOP_SITE_ID}`;
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  return page.evaluate(() => {
    const is404 = document.body.innerText.includes("404") || document.body.innerText.includes("見つかりません");
    if (is404) return null;
    const h1 = document.querySelector("h1")?.innerText?.trim();
    const title = document.title?.replace("プロモーション詳細(", "").replace(") ｜ もしもアフィリエイト", "");
    const status = document.body.innerText.match(/(提携中|申請中|否認|未申請)/)?.[0] || "不明";
    const urlValues = Array.from(document.querySelectorAll("input, textarea"))
      .map(el => el.value || "").filter(v => v.startsWith("http")).slice(0, 3);
    return { h1, title, status, urlValues };
  });
}

// ── 金融プログラムの名称確認 ──
console.log("\n=== 金融カテゴリ プログラム名称確認 ===");
const financeDetails = [];
for (const id of FINANCE_IDS) {
  const info = await getPromotionName(id);
  if (!info) { console.log(`  [${id}] 404`); continue; }
  const name = info.title || info.h1 || "";
  const hasLink = info.urlValues.length > 0 ? "✓リンクあり" : "";
  console.log(`  [${id}] "${name}" — ${info.status} ${hasLink}`);
  financeDetails.push({ id, ...info });
}

// ── 健康プログラムの名称確認 ──
console.log("\n=== 健康カテゴリ プログラム名称確認 ===");
const healthDetails = [];
for (const id of HEALTH_IDS) {
  const info = await getPromotionName(id);
  if (!info) { console.log(`  [${id}] 404`); continue; }
  const name = info.title || info.h1 || "";
  const hasLink = info.urlValues.length > 0 ? "✓リンクあり" : "";
  console.log(`  [${id}] "${name}" — ${info.status} ${hasLink}`);
  healthDetails.push({ id, ...info });
}

// ── キーワード検索 (input[name=words]) ──
console.log("\n=== キーワード検索 (input[name=words]) ===");
const searchResults = {};

for (const target of TARGETS) {
  console.log(`\n  「${target.keyword}」検索中...`);
  await page.goto("https://af.moshimo.com/af/shop/promotion/search", { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);

  const wordsInput = page.locator("input[name=words]").first();
  if (await wordsInput.count() === 0) {
    console.log("  ✗ input[name=words] が見つかりません");
    continue;
  }

  await wordsInput.fill(target.keyword);
  await wordsInput.press("Enter");
  await page.waitForTimeout(3000);
  console.log("  URL:", page.url());

  // プログラムカードからテキストを取得
  const results = await page.evaluate(() => {
    // 各プログラムのカードを探す — promotion_id を持つ要素の親要素
    const promoLinks = Array.from(document.querySelectorAll("a[href*='promotion_id']"));
    const idToCard = new Map();

    for (const link of promoLinks) {
      const id = link.href.match(/promotion_id=(\d+)/)?.[1];
      if (!id || idToCard.has(id)) continue;

      // 親要素をさかのぼってカード全体のテキストを取得
      let parent = link.parentElement;
      for (let i = 0; i < 6; i++) {
        if (!parent) break;
        const text = parent.innerText?.trim();
        if (text && text.length > 30) {
          idToCard.set(id, text.slice(0, 200));
          break;
        }
        parent = parent.parentElement;
      }
      if (!idToCard.has(id)) idToCard.set(id, "(テキストなし)");
    }

    return Array.from(idToCard.entries()).map(([id, text]) => ({ id, text }));
  });

  const unique = Object.values(Object.fromEntries(results.map(r => [r.id, r])));
  console.log(`  ${unique.length}件のプログラム:`);
  unique.forEach(r => console.log(`    [${r.id}] ${r.text.replace(/\n/g, " ").slice(0, 100)}`));
  searchResults[target.keyword] = unique;
}

// ── 結果を保存 ──
const allResults = {
  financePrograms: financeDetails,
  healthPrograms: healthDetails,
  keywordSearchResults: searchResults,
  capturedAt: new Date().toISOString(),
};
writeFileSync(
  path.join(outDir, "moshimo-program-names.json"),
  JSON.stringify(allResults, null, 2),
  "utf-8"
);

console.log("\n✅ 完了: asp-output/moshimo-program-names.json");
console.log("終了するには Ctrl+C");
await new Promise(() => {});
