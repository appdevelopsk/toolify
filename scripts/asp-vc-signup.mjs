/**
 * ValueCommerce — 本登録フォーム自動入力
 * node scripts/asp-vc-signup.mjs <signup_url>
 *
 * フォーム構成 (確認済):
 *   - affiliateType (radio): Webサイト・ブログ
 *   - siteName, siteUrl, siteDescription (text/textarea, required)
 *   - smartphoneCategory (checkbox)
 *   - checkCategory[] (複数選択): カテゴリ
 *   - checkOffer[] (任意): Yahoo!ショッピング自動提携
 */

import { chromium } from "playwright";
import { mkdirSync, existsSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const userDataDir = path.join(homedir(), ".cache/toolify-playwright/vc-profile");
const outDir = path.join(__dirname, "asp-output");
if (!existsSync(userDataDir)) mkdirSync(userDataDir, { recursive: true });
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

const SIGNUP_URL = process.argv[2];
if (!SIGNUP_URL) {
  console.error("URL引数が必要: node scripts/asp-vc-signup.mjs <signup_url>");
  process.exit(1);
}

const PROFILE = {
  siteName: "Toolify | 無料オンラインツール集",
  siteUrl: "https://tools.appdevelopsk.com",
  siteDescription: "BMI計算、単位変換、テキスト変換、画像処理など、日常で使える無料のオンラインツールを多数提供する集約型ツールサイト。コンピュータツール・健康計算・金融計算など幅広いカテゴリのツールを公開しています。",
};

// Toolify に関連するカテゴリ
const TARGET_CATEGORIES = [
  "PC・周辺機器",
  "ソフトウェア",
  "IT関連",
  "クレジットカード",
  "銀行・ネットバンク・電子決済",
  "投資・証券・ＦＸ・ＣＦＤ",
  "保険",
  "健康・ダイエット",
  "教育・資格",
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
  window.chrome = { runtime: {} };
});

const page = ctx.pages()[0] ?? (await ctx.newPage());

console.log("📩 ValueCommerce 本登録ページ...");
await page.goto(SIGNUP_URL, { waitUntil: "domcontentloaded", timeout: 30000 });
await page.waitForTimeout(3000);
console.log("  URL:", page.url());

// ── 1. affiliateType = Webサイト・ブログ ──
console.log("\n1️⃣ アフィリエイトタイプ: Webサイト・ブログ");
const webBlogRadio = page.locator('input[name="affiliate_signup_form[affiliateType]"]').first();
await webBlogRadio.check();
await page.waitForTimeout(500);

// ── 2. サイト情報 ──
console.log("\n2️⃣ サイト情報入力...");
await page.locator('input[name="affiliate_signup_form[siteName]"]').fill(PROFILE.siteName);
console.log(`  ✓ サイト名: ${PROFILE.siteName}`);

await page.locator('input[name="affiliate_signup_form[siteUrl]"]').fill(PROFILE.siteUrl);
console.log(`  ✓ サイトURL: ${PROFILE.siteUrl}`);

await page.locator('textarea[name="affiliate_signup_form[siteDescription]"]').fill(PROFILE.siteDescription);
console.log(`  ✓ サイトの内容入力`);

// スマホ対応
const smartphoneCb = page.locator('input[name="affiliate_signup_form[smartphoneCategory]"]').first();
if (await smartphoneCb.count() > 0) {
  await smartphoneCb.check();
  console.log(`  ✓ スマホ対応: チェック`);
}

// ── 3. カテゴリ選択 ──
console.log("\n3️⃣ カテゴリ選択...");
for (const catName of TARGET_CATEGORIES) {
  // label要素から関連checkboxを探す
  const labelLocator = page.locator(`label:has-text("${catName}")`).first();
  const found = await labelLocator.count() > 0;
  if (found) {
    try {
      await labelLocator.click();
      console.log(`  ✓ ${catName}`);
    } catch {
      console.log(`  ✗ ${catName} (clickエラー)`);
    }
  } else {
    console.log(`  - ${catName} (見つからず)`);
  }
}

// ── 4. ヤフーショッピング自動提携 (任意) ──
console.log("\n4️⃣ Yahoo!ショッピング自動提携にチェック...");
const yahooCb = page.locator('input[name="checkOffer[]"]').first();
if (await yahooCb.count() > 0) {
  await yahooCb.check();
  console.log("  ✓ Yahoo!ショッピング 自動提携 ON");
}

// 入力結果のスクリーンショット代替: HTMLを保存
writeFileSync(path.join(outDir, "vc-signup-filled.html"), await page.content(), "utf-8");

// ── 5. 送信前の確認 ──
console.log("\n📋 入力完了。送信ボタンをクリックする前に確認してください:");
console.log("  - サイト名 / URL / 内容");
console.log("  - カテゴリ選択 (PC・ソフト・IT・金融系等)");
console.log("\n⚠ 送信は自動で行いません。ブラウザで内容を確認後、ご自身で「次へ」or「送信」をクリックしてください。");
console.log("\nブラウザは開いたまま。終了するには Ctrl+C");
await new Promise(() => {});
