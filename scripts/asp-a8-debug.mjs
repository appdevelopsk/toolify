/**
 * A8.net — 認証デバッグ (www.a8.net ログインフォーム版)
 * login form: www.a8.net, POST to pub.a8.net/a8v2/asLoginAction.do
 * field names: login (ID), passwd (password), login_as_btn (submit)
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

// ── 1. www.a8.net ログインフォーム ──
console.log("1. www.a8.net ログインページ...");
await page.goto("https://www.a8.net/", {
  waitUntil: "domcontentloaded",
  timeout: 30000,
});
await page.waitForTimeout(2000);
console.log("  URL:", page.url());

const inputs = await page.evaluate(() =>
  Array.from(document.querySelectorAll("input, form")).map(el => ({
    tag: el.tagName,
    type: el.getAttribute("type") || "",
    name: el.getAttribute("name") || "",
    id: el.getAttribute("id") || "",
    action: el.getAttribute("action") || "",
  }))
);
console.log("  フォーム要素:", JSON.stringify(inputs, null, 2));

// ── 2. ログイン実行 ──
console.log("\n2. ログイン実行...");
const loginInput = page.locator('input[name="login"]').first();
const passwdInput = page.locator('input[name="passwd"]').first();
const submitBtn = page.locator('input[name="login_as_btn"]').first();

const loginCount = await loginInput.count();
const passwdCount = await passwdInput.count();
const submitCount = await submitBtn.count();
console.log(`  login input: ${loginCount}, passwd: ${passwdCount}, submit: ${submitCount}`);

if (loginCount > 0 && passwdCount > 0) {
  await loginInput.fill(CREDS.username);
  await passwdInput.fill(CREDS.password);
  if (submitCount > 0) {
    await submitBtn.click();
  } else {
    await passwdInput.press("Enter");
  }
  await page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(3000);
  console.log("  ログイン後 URL:", page.url());
} else {
  // すでにログイン済みの可能性
  console.log("  フォームなし (セッション残存?) URL:", page.url());
}

// ── 3. ダッシュボード確認 ──
console.log("\n3. ダッシュボード確認...");
const currentUrl = page.url();
const dashText = await page.evaluate(() => document.body.innerText.slice(0, 1000));
console.log("  テキスト:", dashText.replace(/\n/g, " ").slice(0, 500));
writeFileSync(path.join(outDir, "a8-top.txt"), dashText, "utf-8");

// ナビリンクを収集
const navLinks = await page.evaluate(() =>
  Array.from(document.querySelectorAll("a[href]")).map(a => ({
    text: a.textContent?.trim().slice(0, 60),
    href: a.href,
  })).filter(l => l.text && l.href.includes("a8.net"))
);
console.log("\n  ナビリンク (上位20件):");
navLinks.slice(0, 20).forEach(l => console.log(`    "${l.text}" → ${l.href}`));
writeFileSync(path.join(outDir, "a8-nav-links.json"), JSON.stringify(navLinks, null, 2), "utf-8");

// ── 4. プログラム検索ページを探す ──
console.log("\n4. プログラム検索ページ...");
const programLinks = navLinks.filter(l =>
  l.text.includes("プログラム") || l.href.includes("program") || l.href.includes("Program")
);
console.log("  プログラム関連リンク:", JSON.stringify(programLinks.slice(0, 10), null, 2));

const htmlFull = await page.content();
writeFileSync(path.join(outDir, "a8-dashboard.html"), htmlFull, "utf-8");
console.log("  HTML保存: a8-dashboard.html");

console.log("\n終了するには Ctrl+C");
await new Promise(() => {});
