/**
 * Bing Webmaster Tools — 現状診断
 * node scripts/bwt-diagnose.mjs
 *
 * フロー:
 *   1. BWT を開いて手動ログインを待つ
 *   2. サイト一覧 / IndexNow ページ / 所有権ページ を順に確認
 *   3. アカウント情報・登録キー・検証コードをダンプ
 */

import { chromium } from "playwright";
import { mkdirSync, existsSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const userDataDir = path.join(homedir(), ".cache/toolify-playwright/bing-profile");
const outDir = path.join(__dirname, "bwt-output");
if (!existsSync(userDataDir)) mkdirSync(userDataDir, { recursive: true });
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

const ctx = await chromium.launchPersistentContext(userDataDir, {
  headless: false,
  viewport: { width: 1280, height: 900 },
  userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
  ignoreDefaultArgs: ["--enable-automation"],
  args: ["--disable-blink-features=AutomationControlled", "--no-first-run"],
});
await ctx.addInitScript(() => {
  Object.defineProperty(navigator, "webdriver", { get: () => undefined });
  window.chrome = { runtime: {} };
});

const page = ctx.pages()[0] ?? (await ctx.newPage());

console.log("🌐 Bing Webmaster Tools を開きます...");
await page.goto("https://www.bing.com/webmasters/", {
  waitUntil: "domcontentloaded",
  timeout: 30000,
});
await page.waitForTimeout(3000);
console.log("  URL:", page.url());

// ログイン状態を確認
async function isLoggedIn() {
  const text = await page.evaluate(() => document.body.innerText).catch(() => "");
  return text.includes("tools.appdevelopsk.com") ||
         text.includes("サイト") && text.includes("ホーム") && !text.includes("サインイン") ||
         text.length > 200 && !text.toLowerCase().includes("sign in");
}

if (!(await isLoggedIn())) {
  console.log("\n📋 ブラウザで Bing Webmaster Tools にサインインしてください");
  console.log("  使用アカウント候補: app.develop.sk@gmail.com / kenichiro.s@cargate.co.jp");
  console.log("  ※ Google ログインで可");
  console.log("\n  ログイン完了を待機中... (最大5分)");

  let waited = 0;
  while (waited < 300 && !(await isLoggedIn())) {
    await page.waitForTimeout(5000);
    waited += 5;
    if (waited % 30 === 0) console.log(`  待機中... ${waited}秒経過`);
  }
  if (waited >= 300) {
    console.log("  ⏱ タイムアウト");
    process.exit(1);
  }
  console.log("  ✅ ログイン検出!");
}

console.log("\n📋 ホーム画面情報を取得...");
await page.waitForTimeout(2000);
const homeText = await page.evaluate(() => document.body.innerText.slice(0, 3000));
writeFileSync(path.join(outDir, "diagnose-home.txt"), homeText, "utf-8");
console.log("  保存: bwt-output/diagnose-home.txt");

// 所有者・アカウント情報を抽出
const accountInfo = await page.evaluate(() => {
  // プロフィールアイコン周辺
  const profileEls = Array.from(document.querySelectorAll('[class*="profile"], [class*="account"], [class*="user"], [aria-label*="account"], [aria-label*="user"]'));
  const texts = profileEls.map(el => el.textContent?.trim().slice(0, 80)).filter(Boolean);
  // メールアドレス
  const emails = [...document.body.innerText.matchAll(/[\w.+-]+@[\w.-]+\.\w+/g)].map(m => m[0]);
  return { texts: [...new Set(texts)], emails: [...new Set(emails)] };
});
console.log("  プロフィール周辺テキスト:", JSON.stringify(accountInfo.texts.slice(0, 5)));
console.log("  メールアドレス:", JSON.stringify(accountInfo.emails));

// サイト一覧を取得
const sites = await page.evaluate(() => {
  const siteEls = document.body.innerText.match(/[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})*/g) || [];
  return [...new Set(siteEls)].filter(s => !s.includes("microsoft") && !s.includes("bing.com"));
});
console.log("  検出ドメイン:", JSON.stringify(sites.slice(0, 5)));

// IndexNow ページに移動
console.log("\n📋 IndexNow ページを開く...");
const indexNowLink = page.locator('a:has-text("IndexNow")').first();
const hasIN = await indexNowLink.count() > 0;
if (hasIN) {
  await indexNowLink.click();
  await page.waitForTimeout(3000);
  console.log("  URL:", page.url());
  const inText = await page.evaluate(() => document.body.innerText.slice(0, 2500));
  writeFileSync(path.join(outDir, "diagnose-indexnow.txt"), inText, "utf-8");
  console.log("  保存: bwt-output/diagnose-indexnow.txt");
  console.log("  テキスト:", inText.replace(/\n/g, " ").slice(0, 600));

  // キー情報を抽出
  const keys = inText.match(/[a-f0-9]{32,}/gi) || [];
  console.log(`  検出キー: ${JSON.stringify(keys)}`);
}

// 所有権の確認ページ
console.log("\n📋 所有権の確認ページ...");
const ownershipLink = page.locator('a:has-text("所有権"), a:has-text("ownership"), a:has-text("サイト設定")').first();
if (await ownershipLink.count() > 0) {
  await ownershipLink.click();
  await page.waitForTimeout(3000);
  console.log("  URL:", page.url());
  const ownText = await page.evaluate(() => document.body.innerText.slice(0, 2500));
  writeFileSync(path.join(outDir, "diagnose-ownership.txt"), ownText, "utf-8");
  console.log("  保存: bwt-output/diagnose-ownership.txt");

  // msvalidate.01 値を抽出
  const metaMatch = ownText.match(/msvalidate\.01[\s\S]{0,100}content[=:]\s*["']([^"']+)/) ||
                    ownText.match(/<meta[^>]+msvalidate\.01[^>]+content=["']([^"']+)/);
  if (metaMatch) {
    console.log(`  🎯 検証コード: ${metaMatch[1]}`);
  } else {
    console.log("  テキスト:", ownText.replace(/\n/g, " ").slice(0, 500));
  }
}

console.log("\n✅ 診断データ収集完了 (scripts/bwt-output/diagnose-*.txt)");
console.log("ブラウザは開いたまま。終了するには Ctrl+C");
await new Promise(() => {});
