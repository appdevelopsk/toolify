/**
 * もしもアフィリエイト — 楽天カード/あすけんを申請 + リンク取得
 * node scripts/asp-moshimo-final.mjs
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

// 確認済みプログラム
const PROGRAMS = [
  { id: "7276", name: "楽天カード", catalogId: "rakuten-card-jp", reward: "2800円/発行" },
  { id: "3787", name: "あすけん", catalogId: "asken-jp", reward: "15000円/体験" },
  { id: "54", name: "楽天市場", catalogId: "rakuten-market-jp", reward: "一般" },
  { id: "170", name: "Amazon", catalogId: "amazon-jp", reward: "一般" },
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

const results = [];

for (const prog of PROGRAMS) {
  console.log(`\n━━ [ID:${prog.id}] ${prog.name} (${prog.reward}) ━━`);

  // ── 詳細ページを確認 ──
  const detailUrl = `https://af.moshimo.com/af/shop/promotion/detail?promotion_id=${prog.id}&shop_site_id=${SHOP_SITE_ID}`;
  await page.goto(detailUrl, { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  const detail = await page.evaluate(() => {
    const title = document.title?.replace("プロモーション詳細(", "").replace(") ｜ もしもアフィリエイト", "").trim();
    const urlValues = Array.from(document.querySelectorAll("input, textarea"))
      .map(el => el.value || "").filter(v => v.startsWith("http")).slice(0, 5);
    // ページ全体テキストから自分の提携ステータスを探す
    const innerText = document.body.innerText;
    // サイドバーの「申請中」「提携中」ではなく、メインコンテンツの提携状態を探す
    // もしもの詳細ページでは "提携状態：提携中" のような記載がある
    const statusMatch = innerText.match(/提携状態[：:]\s*(提携中|申請中|否認|未申請)/);
    const fallbackMatch = innerText.match(/(提携中|申請中|否認|未申請)/);
    const status = statusMatch?.[1] || fallbackMatch?.[1] || "不明";

    // "提携申請する" ボタンの有無
    const allTexts = Array.from(document.querySelectorAll("a, button, input[type=submit]"))
      .map(el => el.textContent?.trim() || el.value || "")
      .filter(t => t.length > 0);

    return { title, urlValues, status, allButtonTexts: allTexts.slice(0, 30), innerText: innerText.slice(0, 1000) };
  });

  console.log(`  タイトル: ${detail.title}`);
  console.log(`  ステータス: ${detail.status}`);
  console.log(`  ボタン: ${detail.allButtonTexts.filter(t => t.includes("申請") || t.includes("提携") || t.includes("リンク")).join(", ")}`);

  // 申請ボタンがあれば申請
  const applyBtn = page.locator("a, button").filter({ hasText: /^提携申請する$/ }).first();
  const hasApply = await applyBtn.count() > 0;

  if (hasApply && !detail.status.includes("提携中") && !detail.status.includes("申請中")) {
    console.log("  📝 提携申請を実行...");
    await applyBtn.click();
    await page.waitForTimeout(3000);
    // 確認ダイアログや次のステップがあれば確定
    const confirmBtn = page.locator("input[type=submit], button").filter({ hasText: /^(申請|確定|OK|はい)/ }).first();
    if (await confirmBtn.count() > 0) {
      await confirmBtn.click();
      await page.waitForTimeout(2000);
    }
    console.log("  ✓ 申請完了 URL:", page.url());
  }

  // ── リンクソースページを確認 ──
  const sourceUrl = `https://af.moshimo.com/af/shop/promotion/source?promotion_id=${prog.id}&shop_site_id=${SHOP_SITE_ID}`;
  await page.goto(sourceUrl, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  console.log("  ソースページURL:", page.url());

  const links = await page.evaluate(() => {
    const urlValues = Array.from(document.querySelectorAll("input, textarea"))
      .map(el => el.value || "").filter(v => v.startsWith("http")).slice(0, 10);
    const iframeLinks = Array.from(document.querySelectorAll("iframe[src]"))
      .map(el => el.src).filter(s => s.includes("http")).slice(0, 5);
    const codeBlocks = Array.from(document.querySelectorAll("textarea, code, pre"))
      .map(el => el.textContent?.trim() || "").filter(t => t.length > 0).slice(0, 5);
    const innerText = document.body.innerText.slice(0, 500);
    return { urlValues, iframeLinks, codeBlocks, innerText };
  });

  console.log(`  URLリンク: ${links.urlValues.length}件`);
  links.urlValues.forEach(l => console.log(`    ${l.slice(0, 100)}`));
  console.log(`  コードブロック: ${links.codeBlocks.length}件`);
  links.codeBlocks.slice(0, 2).forEach(c => console.log(`    ${c.slice(0, 150)}`));

  results.push({
    id: prog.id,
    name: prog.name,
    catalogId: prog.catalogId,
    reward: prog.reward,
    title: detail.title,
    detailUrl,
    sourceUrl,
    affiliateLinks: links.urlValues,
    codeSamples: links.codeBlocks.slice(0, 2),
    innerTextSnippet: links.innerText,
  });
}

// ── かんたんリンクでAmazon/楽天のリンクを生成 ──
console.log("\n\n=== かんたんリンク機能 ===");
await page.goto(
  `https://af.moshimo.com/af/shop/service/easy-link-card?shop_site_id=${SHOP_SITE_ID}`,
  { waitUntil: "networkidle" }
);
await page.waitForTimeout(2000);
console.log("  URL:", page.url());
const easyLinkText = await page.evaluate(() => document.body.innerText.slice(0, 600));
console.log("  テキスト:", easyLinkText.replace(/\n/g, " ").slice(0, 400));

writeFileSync(path.join(outDir, "moshimo-final-results.json"), JSON.stringify(results, null, 2), "utf-8");
console.log("\n✅ 完了: asp-output/moshimo-final-results.json");

console.log("\n終了するには Ctrl+C");
await new Promise(() => {});
