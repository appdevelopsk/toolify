/**
 * A8.net — tools.appdevelopsk.com を副サイトとして登録
 * node scripts/asp-a8-register-site.mjs
 *
 * Form: /a8v2/media/siteAction/detail.do?action=detail&no=&mode=1
 * Submit: javascript:submitAction('detailConfirm') → POST /a8v2/media/siteAction/confirm.do
 */

import { chromium } from "playwright";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadCreds } from "./asp-creds.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const userDataDir = path.join(homedir(), ".cache/toolify-playwright/a8-profile");
const outDir = path.join(__dirname, "asp-output");
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

const CREDS = loadCreds("a8");

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

// ── 1. ログイン ──
console.log("1. ログイン...");
await page.goto("https://www.a8.net/", { waitUntil: "domcontentloaded", timeout: 30000 });
await page.waitForTimeout(2000);
const loginInput = page.locator('input[name="login"]').first();
if (await loginInput.count() > 0) {
  await loginInput.fill(CREDS.username);
  await page.locator('input[name="passwd"]').first().fill(CREDS.password);
  await page.locator('input[name="login_as_btn"]').first().click();
  await page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(2000);
}
console.log("  URL:", page.url());

// ── 2. 再認証 ──
console.log("\n2. 再認証...");
await page.goto("https://pub.a8.net/a8v2/media/siteAction.do", {
  waitUntil: "domcontentloaded", timeout: 20000,
});
await page.waitForTimeout(1500);
const idField = page.locator('input[name="id"]').first();
if (await idField.count() > 0) {
  await idField.fill(CREDS.username);
  await page.locator('input[name="pass"]').first().fill(CREDS.password);
  await page.evaluate(() => {
    const form = document.querySelector("form[name='asModifyAuthenticationForm']");
    if (form) form.submit();
  });
  await page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(2000);
  console.log("  再認証後 URL:", page.url());
}

// ── 3. 副サイト登録フォームへ ──
console.log("\n3. 副サイト登録フォーム...");
await page.goto(
  "https://pub.a8.net/a8v2/media/siteAction/detail.do?action=detail&no=&mode=1",
  { waitUntil: "domcontentloaded", timeout: 20000 }
);
await page.waitForTimeout(2000);
console.log("  URL:", page.url());

// フォーム確認
const hasForm = await page.locator('form[name="asSiteForm"]').count() > 0;
console.log(`  登録フォーム: ${hasForm ? "あり" : "なし"}`);
if (!hasForm) {
  const text = await page.evaluate(() => document.body.innerText.slice(0, 500));
  console.log("  テキスト:", text.replace(/\n/g, " ").slice(0, 300));
  console.log("  フォームが見つかりません。終了します。");
  await ctx.close();
  process.exit(1);
}

// ── 4. フォーム入力 ──
console.log("\n4. フォーム入力...");

// Webメディア選択
await page.locator('input[name="melmagaFlg"][value="0"]').check();

// サイト名
await page.locator('input[name="websiteName"]').fill("Toolify | 無料オンラインツール集");

// URL
await page.locator('input[name="url"]').fill("https://tools.appdevelopsk.com");

// カテゴリ: インターネットサービス (value="02")
await page.locator('select[name="asCtgCd"]').selectOption("02");

// 開設年月 (Toolifyは2025年頃に開設)
const openYearSel = page.locator('select[name="openYear"]');
if (await openYearSel.count() > 0) {
  await openYearSel.selectOption("2025");
} else {
  const openYearInput = page.locator('input[name="openYear"]');
  if (await openYearInput.count() > 0) await openYearInput.fill("2025");
}
const openMonthSel = page.locator('select[name="openMonth"]');
if (await openMonthSel.count() > 0) {
  await openMonthSel.selectOption("1");
}

// PV数・訪問者数 (見積もり)
const pvInput = page.locator('input[name="pageviewCount"]');
if (await pvInput.count() > 0) await pvInput.fill("3000");
const uvInput = page.locator('input[name="visiterCount"]');
if (await uvInput.count() > 0) await uvInput.fill("1000");

// reviewTxt (サイト説明) があれば入力
const reviewInput = page.locator('textarea[name="reviewTxt"], input[name="reviewTxt"]');
if (await reviewInput.count() > 0) {
  await reviewInput.fill("ユーザーが日常的に使える無料ツール・計算ツールを集めたサイトです。BMI計算、単位変換、テキスト変換など多数のツールを提供しています。");
}

console.log("  入力完了");
writeFileSync(path.join(outDir, "a8-site-form-filled.html"), await page.content(), "utf-8");

// ── 5. 確認ページへ ──
console.log("\n5. 確認ページへ (submitAction('detailConfirm'))...");
await page.evaluate(() => {
  if (typeof submitAction === "function") {
    submitAction("detailConfirm");
  } else {
    const form = document.querySelector("form[name='asSiteForm']");
    const actionInput = form.querySelector("input[name='action']");
    if (actionInput) actionInput.value = "detailConfirm";
    form.submit();
  }
});
await page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 20000 }).catch(() => {});
await page.waitForTimeout(2000);
console.log("  確認ページ URL:", page.url());

const confirmText = await page.evaluate(() => document.body.innerText.slice(0, 1500));
console.log("  テキスト:", confirmText.replace(/\n/g, " ").slice(0, 600));
writeFileSync(path.join(outDir, "a8-site-confirm.html"), await page.content(), "utf-8");
console.log("  HTML保存: a8-site-confirm.html");

// エラーチェック
if (confirmText.includes("エラー") || confirmText.includes("入力") || confirmText.includes("必須")) {
  console.log("\n  ⚠ バリデーションエラーの可能性あり");
}

// ── 6. 登録確定 ──
// "修正する" = submitAction('detailSave') — confirmation page submit
const registerBtn = page.locator('a[href*="detailSave"], a[href*="detailConfirm"]').first();
const hasRegister = await registerBtn.count() > 0;

console.log(`\n6. 登録ボタン: ${hasRegister ? "あり" : "なし"}`);
if (hasRegister) {
  const btnText = await registerBtn.evaluate(el => el.textContent?.trim() || el.value || "");
  console.log(`  ボタンテキスト: "${btnText}"`);
  console.log("  登録を実行します...");
  await registerBtn.click();
  await page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(2000);
  console.log("  登録後 URL:", page.url());

  const doneText = await page.evaluate(() => document.body.innerText.slice(0, 1000));
  console.log("  テキスト:", doneText.replace(/\n/g, " ").slice(0, 400));
  writeFileSync(path.join(outDir, "a8-site-done.html"), await page.content(), "utf-8");
} else {
  console.log("  登録ボタンが見つかりません。手動で確認してください。");
  const allBtns = await page.evaluate(() =>
    Array.from(document.querySelectorAll("a, button, input[type=submit]")).map(el => ({
      text: (el.textContent?.trim() || el.value || "").slice(0, 40),
      href: el.href || el.getAttribute("onclick") || "",
    })).filter(l => l.text)
  );
  console.log("  ページ上のボタン:", JSON.stringify(allBtns.slice(0, 15), null, 2));
}

console.log("\n終了するには Ctrl+C");
await new Promise(() => {});
