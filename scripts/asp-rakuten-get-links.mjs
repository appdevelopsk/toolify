/**
 * 楽天アフィリエイト — iHerb / 楽天証券 / 楽天カードのリンク取得
 * node scripts/asp-rakuten-get-links.mjs
 */

import { chromium } from "playwright";
import { mkdirSync, existsSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const userDataDir = path.join(homedir(), ".cache/toolify-playwright/a8-profile");
const outDir = path.join(__dirname, "asp-output");
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

const TARGETS = [
  { id: "iherb-global",         keyword: "iHerb" },
  { id: "rakuten-securities-jp", keyword: "楽天証券" },
  { id: "rakuten-card-jp",       keyword: "楽天カード" },
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
const results = [];

// ── 1. 楽天アフィリエイト管理画面へ ──
console.log("🔐 楽天アフィリエイト管理画面...");
await page.goto("https://affiliate.rakuten.co.jp/", { waitUntil: "domcontentloaded", timeout: 30000 });
await page.waitForTimeout(2000);

const bodyText = await page.evaluate(() => document.body.innerText);
if (bodyText.includes("ログイン") && !bodyText.includes("ログアウト")) {
  console.log("⚠️  ログインが必要です。ブラウザでログインしてください...");
  await page.waitForFunction(
    () => document.body.innerText.includes("ログアウト"),
    { timeout: 180000 }
  );
  console.log("✓ ログイン完了");
}

// ── 2. 各プログラムのリンクを検索 ──
for (const target of TARGETS) {
  console.log(`\n🔍 ${target.keyword} を検索中...`);

  // 楽天アフィリエイト内でキーワード検索
  await page.goto(
    `https://affiliate.rakuten.co.jp/search_program/?keyword=${encodeURIComponent(target.keyword)}&type=2`,
    { waitUntil: "domcontentloaded", timeout: 30000 }
  );
  await page.waitForTimeout(2000);

  const html = await page.content();
  writeFileSync(path.join(outDir, `rakuten-aff-${target.keyword}.html`), html, "utf-8");

  // アフィリリンクを含むテキストを検索
  const pageText = await page.evaluate(() => document.body.innerText);
  const linkMatches = [...html.matchAll(/https?:\/\/hb\.afl\.rakuten\.co\.jp\/[^\s"'<]+/g)];
  const trackLinks = [...new Set(linkMatches.map(m => m[0]))];

  if (trackLinks.length > 0) {
    console.log(`  ✅ ${target.keyword}: ${trackLinks.length}件のアフィリリンク発見`);
    trackLinks.slice(0, 3).forEach(u => console.log(`   → ${u}`));
    results.push({ id: target.id, keyword: target.keyword, status: "found", urls: trackLinks.slice(0, 5) });
  } else {
    // テキストリンク生成ページを探す
    const textLinkButtons = await page.$$('a:has-text("テキストリンク"), a:has-text("リンク作成"), button:has-text("リンク")');
    if (textLinkButtons.length > 0) {
      console.log(`  ℹ️  ${target.keyword}: リンク作成ボタンあり (手動操作が必要)`);
      results.push({ id: target.id, keyword: target.keyword, status: "manual_needed", pageUrl: page.url() });
    } else {
      console.log(`  ✗ ${target.keyword}: リンク見つからず`);
      results.push({ id: target.id, keyword: target.keyword, status: "not_found", snippet: pageText.slice(0, 300) });
    }
  }
}

writeFileSync(
  path.join(outDir, "rakuten-affiliate-links.json"),
  JSON.stringify(results, null, 2),
  "utf-8"
);

console.log("\n\n===== 結果 =====");
for (const r of results) {
  const icon = r.status === "found" ? "✅" : r.status === "manual_needed" ? "ℹ️" : "❌";
  console.log(`${icon} ${r.keyword}: ${r.status}`);
  r.urls?.forEach(u => console.log(`  → ${u}`));
}
console.log("\n📄 保存: scripts/asp-output/rakuten-affiliate-links.json");
await ctx.close();
