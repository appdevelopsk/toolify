/**
 * もしもアフィリエイト — 提携中プログラム詳細確認 & リンク取得
 * node scripts/asp-moshimo.mjs
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

const ctx = await chromium.launchPersistentContext(userDataDir, {
  headless: false,
  viewport: { width: 1280, height: 900 },
  userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
  ignoreDefaultArgs: ["--enable-automation"],
  args: ["--disable-blink-features=AutomationControlled", "--no-first-run"],
});

const page = ctx.pages()[0] ?? (await ctx.newPage());

// ── ログイン ──
await page.goto("https://af.moshimo.com/af/shop/login", { waitUntil: "networkidle" });
if (await page.locator("input[name=password]").count() > 0) {
  await page.locator("input[name=account]").fill(CREDS.username);
  await page.locator("input[name=password]").fill(CREDS.password);
  await page.locator("input[name=login]").click();
  await page.waitForNavigation({ waitUntil: "networkidle", timeout: 20000 }).catch(() => {});
}

// ── 提携中プログラムを詳細ページで確認 ──
const detailUrls = [
  "https://af.moshimo.com/af/shop/promotion/detail?promotion_id=6672&shop_site_id=671111",
  "https://af.moshimo.com/af/shop/promotion/detail?promotion_id=6331&shop_site_id=671111",
  "https://af.moshimo.com/af/shop/promotion/detail?promotion_id=3787&shop_site_id=671111",
  "https://af.moshimo.com/af/shop/promotion/detail?promotion_id=1225&shop_site_id=671111",
  "https://af.moshimo.com/af/shop/promotion/detail?promotion_id=54&shop_site_id=671111",
  "https://af.moshimo.com/af/shop/promotion/detail?promotion_id=170",
];

const programs = [];
for (const url of detailUrls) {
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  const info = await page.evaluate(() => {
    const title = document.querySelector("h1, h2, .program-name, [class*='title']")?.innerText?.trim() || document.title;
    const status = document.body.innerText.match(/(提携中|申請中|否認|未申請)/)?.[0] || "不明";
    // アフィリエイトリンクを探す
    const linkInputs = Array.from(document.querySelectorAll("input[readonly], textarea[readonly]"))
      .map((el) => el.value)
      .filter((v) => v && v.includes("http"))
      .slice(0, 2);
    const bodyText = document.body.innerText.slice(0, 300);
    return { title, status, linkInputs, bodyText };
  });
  console.log(`\n[ID:${url.match(/promotion_id=(\d+)/)?.[1]}]`);
  console.log(`  タイトル: ${info.title}`);
  console.log(`  ステータス: ${info.status}`);
  console.log(`  リンク: ${JSON.stringify(info.linkInputs)}`);
  console.log(`  テキスト: ${info.bodyText.slice(0, 150).replace(/\n/g, " ")}`);
  programs.push({ url, ...info });
}

writeFileSync(path.join(outDir, "moshimo-program-details.json"), JSON.stringify(programs, null, 2), "utf-8");

// ── もしも「かんたんリンク」機能でリンク生成を試みる ──
console.log("\n\n🔗 かんたんリンク機能を確認...");
await page.goto(
  "https://af.moshimo.com/af/shop/service/easy-link-card?shop_site_id=671111",
  { waitUntil: "networkidle" }
);
await page.waitForTimeout(2000);
await page.screenshot({ path: path.join(outDir, "moshimo-easy-link.png"), fullPage: false });
const easyLinkText = await page.evaluate(() => document.body.innerText.slice(0, 400));
console.log("かんたんリンクページ:", easyLinkText.slice(0, 200));

console.log("\n✅ 確認完了。scripts/asp-output/moshimo-program-details.json を参照してください。");
console.log("終了: Ctrl+C");
await new Promise(() => {});
