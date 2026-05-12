/**
 * A8.net — 正しいURLを探してログイン + プログラム検索・申請
 * node scripts/asp-a8.mjs
 */

import { chromium } from "playwright";
import { mkdirSync, existsSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadCreds } from "./asp-creds.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const userDataDir = path.join(homedir(), ".cache/toolify-playwright/a8-profile");
const outDir = path.join(__dirname, "asp-output");
if (!existsSync(userDataDir)) mkdirSync(userDataDir, { recursive: true });
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

const CREDS = loadCreds("a8");

const TARGETS = [
  "楽天証券",
  "楽天カード",
  "SBI証券",
  "マイプロテイン",
  "iHerb",
  "あすけん",
  "ConoHa WING",
  "三井住友カード",
];

const ctx = await chromium.launchPersistentContext(userDataDir, {
  headless: false,
  viewport: { width: 1280, height: 900 },
  userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
  ignoreDefaultArgs: ["--enable-automation"],
  args: ["--disable-blink-features=AutomationControlled", "--no-first-run"],
});
await ctx.addInitScript(() => {
  Object.defineProperty(navigator, "webdriver", { get: () => undefined });
});

const page = ctx.pages()[0] ?? (await ctx.newPage());

// ── A8.net ホームページを確認 ──
console.log("1. A8.net ホームページを確認...");
await page.goto("https://www.a8.net/", { waitUntil: "domcontentloaded", timeout: 30000 });
await page.waitForTimeout(2000);
console.log("  URL:", page.url());
const homeText = await page.evaluate(() => document.body.innerText.slice(0, 300));
console.log("  テキスト:", homeText.replace(/\n/g, " ").slice(0, 200));

// ログインリンクを探す
const loginLinks = await page.evaluate(() =>
  Array.from(document.querySelectorAll("a")).filter(a =>
    a.textContent?.includes("ログイン") || a.href?.includes("login")
  ).map(a => ({ text: a.textContent?.trim(), href: a.href }))
);
console.log("  ログインリンク:", JSON.stringify(loginLinks.slice(0, 5)));

// ── パブリッシャーログインページ ──
console.log("\n2. パブリッシャーログイン...");
// 新しい可能性のあるURL
const loginUrls = [
  "https://pub.a8.net/login",
  "https://www.a8.net/affiliate/login/publisher/",
  "https://pub.a8.net/",
];

let loggedIn = false;
for (const url of loginUrls) {
  console.log(`  試行: ${url}`);
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 });
    await page.waitForTimeout(1500);
    const currentUrl = page.url();
    const pageText = await page.evaluate(() => document.body.innerText.slice(0, 200));
    console.log(`    → ${currentUrl}`);
    console.log(`    テキスト: ${pageText.replace(/\n/g, " ").slice(0, 150)}`);

    // ログインフォームがあれば入力
    const loginId = page.locator('input[name="login_id"], input[name="id"], input[name="email"], input[type="email"], input[type="text"]').first();
    if (await loginId.count() > 0) {
      console.log("  ✓ ログインフォーム発見");
      await loginId.fill(CREDS.username);
      const pw = page.locator('input[name="password"], input[type="password"]').first();
      await pw.fill(CREDS.password);
      const submit = page.locator('input[type="submit"], button[type="submit"]').first();
      if (await submit.count() > 0) {
        await submit.click();
        await page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 15000 }).catch(() => {});
        console.log("  ログイン後 URL:", page.url());
        loggedIn = true;
        break;
      }
    }
  } catch (e) {
    console.log(`    エラー: ${e.message.slice(0, 80)}`);
  }
}

// マイページを確認
const mypageUrls = [
  "https://pub.a8.net/",
  "https://pub.a8.net/top",
  "https://www.a8.net/affiliate/publisher/",
];

for (const url of mypageUrls) {
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 });
    await page.waitForTimeout(1500);
    const currentUrl = page.url();
    if (!currentUrl.includes("login") && !currentUrl.includes("error")) {
      console.log("✓ マイページ:", currentUrl);
      const text = await page.evaluate(() => document.body.innerText.slice(0, 300));
      console.log("  テキスト:", text.replace(/\n/g, " ").slice(0, 200));
      break;
    }
  } catch (e) {
    console.log(`  エラー (${url}): ${e.message.slice(0, 50)}`);
  }
}

// 全ページのリンクを確認
const allLinks = await page.evaluate(() =>
  Array.from(document.querySelectorAll("a")).map(a => ({
    text: a.textContent?.trim().replace(/\s+/g, " ").slice(0, 60),
    href: a.href,
  })).filter(l => l.text && l.href?.includes("a8.net"))
);
console.log("\n  ページ内のA8リンク:");
allLinks.slice(0, 20).forEach(l => console.log(`    "${l.text}" → ${l.href.replace("https://", "").slice(0, 70)}`));

writeFileSync(path.join(outDir, "a8-page-links.json"), JSON.stringify(allLinks, null, 2), "utf-8");

console.log("\n終了するには Ctrl+C (ブラウザを確認してください)");
await new Promise(() => {});
