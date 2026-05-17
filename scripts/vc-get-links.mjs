/**
 * ValueCommerce — 管理画面から提携プログラム + 広告リンク取得
 * node scripts/vc-get-links.mjs
 *
 * aff.valuecommerce.ne.jp にログインして:
 *   1. 提携中プログラム一覧を取得
 *   2. 各プログラムのテキストリンクURLを抽出
 */

import { chromium } from "playwright";
import { mkdirSync, existsSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const userDataDir = path.join(homedir(), ".cache/toolify-playwright/vc-profile");
const outDir = path.join(__dirname, "asp-output");

// Chrome Profile 14 (app.develop.sk@gmail.com) のCookieをPlaywrightプロファイルにコピー
import { copyFileSync } from "node:fs";
const chromeSrc = path.join(
  homedir(),
  "Library/Application Support/Google/Chrome/Profile 14"
);
const cookieSrc = path.join(chromeSrc, "Cookies");
const cookieDst = path.join(userDataDir, "Default", "Cookies");

if (existsSync(cookieSrc)) {
  mkdirSync(path.join(userDataDir, "Default"), { recursive: true });
  try {
    copyFileSync(cookieSrc, cookieDst);
    console.log("✓ Chromeクッキーをコピー:", cookieDst);
  } catch (e) {
    console.log("⚠️  クッキーコピー失敗（Chromeが開いている場合は閉じてください）:", e.message);
  }
} else {
  console.log("⚠️  Chrome Profile 14 が見つかりません");
}
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

// 本物のChromeを使用（VCのボット検出を回避）
const ctx = await chromium.launchPersistentContext(userDataDir, {
  channel: "chrome",   // システムのGoogle Chromeを使用
  headless: false,
  viewport: { width: 1280, height: 900 },
  ignoreDefaultArgs: ["--enable-automation"],
  args: [
    "--disable-blink-features=AutomationControlled",
    "--no-first-run",
    "--new-window",
  ],
});
await ctx.addInitScript(() => {
  Object.defineProperty(navigator, "webdriver", { get: () => undefined });
  window.chrome = { runtime: {} };
});

const page = ctx.pages()[0] ?? (await ctx.newPage());

// ── 1. VC ログインページへ ──
console.log("🔐 ValueCommerce ログインページへ移動...");
await page.goto("https://aff.valuecommerce.ne.jp/login", {
  waitUntil: "networkidle",
  timeout: 30000,
}).catch(() => {});
await page.waitForTimeout(3000);

const currentUrl = page.url();
console.log("  現在のURL:", currentUrl);

// ログイン済みかチェック（ダッシュボードにリダイレクトされたか）
const alreadyLoggedIn = !currentUrl.includes("/login");

if (alreadyLoggedIn) {
  console.log("✓ ログイン済み（セッション有効）");
} else {
  console.log("\n⚠️  ブラウザでValueCommerceにログインしてください。");
  console.log("   ログイン後、自動で続行します（最大5分待機）...\n");

  // macOSでブラウザウィンドウを前面に
  const { execSync } = await import("node:child_process");
  try {
    execSync('osascript -e \'tell application "Google Chrome for Testing" to activate\' 2>/dev/null || true');
    execSync('osascript -e \'tell application "Chromium" to activate\' 2>/dev/null || true');
  } catch {}

  // ログイン後のリダイレクトを待つ（最大5分）
  await page.waitForURL(/^(?!.*\/login).*$/, { timeout: 300000 });
  await page.waitForTimeout(3000);
  console.log("✓ ログイン完了 →", page.url());
}

const topHtml = await page.content();
writeFileSync(path.join(outDir, "vc-top-loggedin.html"), topHtml, "utf-8");

// ── 1b. ダッシュボードから正しいURLを特定 ──
const dashUrl = page.url();
console.log("  ダッシュボードURL:", dashUrl);

// ページ内のナビリンクを収集して正しいパスを把握
const navLinks = await page.$$eval("a[href]", els =>
  els.map(el => ({ text: el.innerText.trim().slice(0, 30), href: el.href }))
    .filter(e => e.href.includes("valuecommerce") && e.text.length > 0)
    .slice(0, 40)
);
writeFileSync(path.join(outDir, "vc-dashboard-nav.json"), JSON.stringify(navLinks, null, 2), "utf-8");
console.log(`  ナビリンク ${navLinks.length} 件取得`);

// ── 2. ナビから提携プログラムページを探す ──
console.log("\n📋 提携中プログラム一覧...");

// ダッシュボードのナビから「プログラム」「広告」「提携」系のリンクを探す
const programPageLink = navLinks.find(l =>
  l.text.includes("プログラム") || l.text.includes("広告") || l.text.includes("提携") || l.text.includes("Program")
);
console.log("  プログラム系リンク候補:", programPageLink);

// 全ページを探索してプログラム一覧を見つける
let programsFound = false;
const candidateUrls = [
  ...(programPageLink ? [programPageLink.href] : []),
  ...navLinks.filter(l => l.href.includes("program") || l.href.includes("ad") || l.href.includes("partner"))
             .map(l => l.href),
];

for (const url of [...new Set(candidateUrls)].slice(0, 8)) {
  console.log(`  → ${url} を確認中...`);
  await page.goto(url, { waitUntil: "networkidle", timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(1500);
  const text = await page.evaluate(() => document.body.innerText);
  const html = await page.content();

  if (!text.includes("ページが見つかりません") && text.length > 800) {
    console.log(`  ✓ ヒット: ${page.url()}`);
    writeFileSync(path.join(outDir, "vc-programs-page.html"), html, "utf-8");
    programsFound = true;
    break;
  }
}

if (!programsFound) {
  // ダッシュボードのHTMLを全保存してURL構造を確認
  console.log("  プログラムページ未発見 → ダッシュボードを保存");
  await page.goto(dashUrl, { waitUntil: "networkidle", timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(2000);
  writeFileSync(path.join(outDir, "vc-dashboard-full.html"), await page.content(), "utf-8");
}

// プログラム名とIDを抽出
const programs = await page.$$eval('a[href*="pid="], a[href*="program_id="], a[href*="sid="]', els =>
  els.map(el => ({ text: el.innerText.trim(), href: el.href }))
    .filter(e => e.text.length > 0 && !e.href.includes("sid=2999025"))
);
console.log(`  ${programs.length} プログラムリンク発見`);
writeFileSync(path.join(outDir, "vc-program-links.json"), JSON.stringify(programs.slice(0, 50), null, 2), "utf-8");

// ── 3. 全VCリンクを収集 ──
console.log("\n🔗 VCリンク収集...");
const allLinks2 = await page.$$eval('a[href]', els =>
  els.map(el => el.href).filter(h => h.includes("ck.jp.ap.valuecommerce") || (h.includes("valuecommerce") && h.includes("pid=")))
);
const vcLinks = [...new Set(allLinks2)];
console.log(`  ${vcLinks.length} VCクリックリンク`);
vcLinks.slice(0, 10).forEach(u => console.log(`   ${u}`));

// ── 4. ページ全体のテキストを保存 ──
const pageText = await page.evaluate(() => document.body.innerText);
writeFileSync(path.join(outDir, "vc-page-text.txt"), pageText, "utf-8");

// ── 5. 結果保存 ──
const result = {
  dashboardUrl: dashUrl,
  navLinks: navLinks.slice(0, 20),
  programs: programs.slice(0, 30),
  vcLinks: vcLinks.slice(0, 20),
};
writeFileSync(path.join(outDir, "vc-results.json"), JSON.stringify(result, null, 2), "utf-8");

console.log("\n\n===== 完了 =====");
console.log(`ダッシュボードURL: ${dashUrl}`);
console.log(`ナビリンク: ${navLinks.length}`);
console.log(`プログラムリンク: ${programs.length}`);
console.log(`VCリンク: ${vcLinks.length}`);
console.log("📄 保存: scripts/asp-output/vc-*.html / vc-results.json");

await ctx.close();
