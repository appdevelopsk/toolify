/**
 * もしもアフィリエイト — 提携中プログラム一覧 + アフィリエイトリンク取得
 * node scripts/asp-moshimo-check.mjs
 *
 * shop_site_id=671899 が tools.appdevelopsk.com の正しいメディアID
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
const SHOP_SITE_ID = "671899"; // tools.appdevelopsk.com

const ctx = await chromium.launchPersistentContext(userDataDir, {
  headless: false,
  viewport: { width: 1280, height: 900 },
  userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
  ignoreDefaultArgs: ["--enable-automation"],
  args: ["--disable-blink-features=AutomationControlled", "--no-first-run"],
});

const page = ctx.pages()[0] ?? (await ctx.newPage());

// ── ログイン ──
console.log("🔑 ログイン中...");
await page.goto("https://af.moshimo.com/af/shop/login", { waitUntil: "networkidle" });
if (await page.locator("input[name=password]").count() > 0) {
  await page.locator("input[name=account]").fill(CREDS.username);
  await page.locator("input[name=password]").fill(CREDS.password);
  await page.locator("input[name=login]").click();
  await page.waitForNavigation({ waitUntil: "networkidle", timeout: 20000 }).catch(() => {});
}
console.log("✓ セッション確立:", page.url());

// ── 提携中プログラム一覧 (apply_status=2) ──
console.log("\n📋 提携中プログラム一覧を取得中...");
await page.goto(
  `https://af.moshimo.com/af/shop/promotion/search?apply_status=2&shop_site_id=${SHOP_SITE_ID}`,
  { waitUntil: "networkidle" }
);
await page.waitForTimeout(2000);
await page.screenshot({ path: path.join(outDir, "moshimo-partner-list.png"), fullPage: true });

const listText = await page.evaluate(() => document.body.innerText);
writeFileSync(path.join(outDir, "moshimo-partner-list.txt"), listText, "utf-8");

// 提携中プログラムのIDを抽出 (広告リンクへ or 詳細条件へ リンク)
const partnerPrograms = await page.evaluate(() => {
  // 各プログラムカードを取得
  const rows = Array.from(document.querySelectorAll("[class*='program'], [class*='item'], tr, .row, li"));

  // promotion_id を持つリンクをすべて取得
  const allPromoLinks = Array.from(document.querySelectorAll("a[href*='promotion_id']")).map(a => ({
    text: a.textContent?.trim().replace(/\s+/g, " ").slice(0, 80),
    href: a.href,
    id: a.href.match(/promotion_id=(\d+)/)?.[1],
  })).filter(l => l.id);

  // ユニークなIDごとにグループ化してプログラム名を取得
  const byId = {};
  for (const link of allPromoLinks) {
    if (!byId[link.id]) byId[link.id] = { id: link.id, links: [], names: [] };
    byId[link.id].links.push({ text: link.text, href: link.href });
    if (link.text && link.text.length > 3) byId[link.id].names.push(link.text);
  }

  return Object.values(byId);
});

console.log(`\n  提携中プログラム数: ${partnerPrograms.length}件`);
partnerPrograms.forEach(p => {
  const names = [...new Set(p.names)].filter(n => !["一括提携申請へ","広告サンプルへ","広告リンクへ","詳細条件へ","どこでもリンクへ"].includes(n));
  console.log(`  [ID:${p.id}] ${names.join(" / ") || "(名称不明)"}`);
});

writeFileSync(path.join(outDir, "moshimo-partner-ids.json"), JSON.stringify(partnerPrograms, null, 2), "utf-8");

// ── 各プログラムの詳細ページでアフィリエイトリンクを取得 ──
const uniqueIds = [...new Set(partnerPrograms.map(p => p.id))];
console.log(`\n🔗 ${uniqueIds.length}件の詳細ページを確認中...`);

const details = [];
for (const id of uniqueIds) {
  const url = `https://af.moshimo.com/af/shop/promotion/detail?promotion_id=${id}&shop_site_id=${SHOP_SITE_ID}`;
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);

  const info = await page.evaluate(() => {
    const h1 = document.querySelector("h1")?.innerText?.trim() || document.title;
    const status = document.body.innerText.match(/(提携中|申請中|否認|未申請)/)?.[0] || "不明";

    // input/textareaからURLを収集
    const urlValues = Array.from(document.querySelectorAll("input, textarea"))
      .map(el => el.value || "")
      .filter(v => v.startsWith("http"))
      .slice(0, 5);

    // 広告リンクページへのリンク
    const adLinkHrefs = Array.from(document.querySelectorAll("a"))
      .filter(a => a.textContent?.includes("広告リンク") || a.textContent?.includes("リンク素材") || a.href?.includes("ad_link") || a.href?.includes("material"))
      .map(a => ({ text: a.textContent?.trim(), href: a.href }))
      .slice(0, 5);

    const bodyText = document.body.innerText.slice(0, 1000);
    return { h1, status, urlValues, adLinkHrefs, bodyText };
  });

  console.log(`\n  [ID:${id}] "${info.h1}" — ${info.status}`);
  if (info.urlValues.length > 0) {
    console.log(`    ✓ アフィリリンク: ${info.urlValues[0].slice(0, 120)}`);
  } else {
    console.log(`    ✗ リンクなし`);
    if (info.adLinkHrefs.length > 0) {
      console.log(`    広告リンクページ: ${info.adLinkHrefs[0].href}`);
    }
  }

  details.push({ id, url, ...info });
}

writeFileSync(path.join(outDir, "moshimo-partner-details.json"), JSON.stringify(details, null, 2), "utf-8");
console.log(`\n\n✅ 完了: ${details.length}件 → asp-output/moshimo-partner-details.json`);
console.log("終了するには Ctrl+C");
await new Promise(() => {});
