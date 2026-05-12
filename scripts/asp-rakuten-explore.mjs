/**
 * 楽天アフィリエイト — キャンペーン・プレミアムパートナー調査
 * node scripts/asp-rakuten-explore.mjs
 */

import { chromium } from "playwright";
import { mkdirSync, existsSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadCreds } from "./asp-creds.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const userDataDir = path.join(homedir(), ".cache/toolify-playwright/rakuten-profile");
const outDir = path.join(__dirname, "asp-output");
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

const CREDS = loadCreds("rakuten");

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

// ── 1. ログイン状態確認 ──
console.log("🔑 楽天アフィリエイト...");
await page.goto("https://affiliate.rakuten.co.jp/", {
  waitUntil: "domcontentloaded", timeout: 30000,
});
await page.waitForTimeout(2500);
const isLoggedIn = await page.evaluate(() => document.body.innerText.includes("ログアウト") || document.body.innerText.includes("マイページ"));

if (!isLoggedIn) {
  // SSOログインリンクをクリック
  const loginLink = page.locator('a:has-text("楽天IDでログイン"), a:has-text("ログイン")').first();
  if (await loginLink.count() > 0) {
    await loginLink.click();
    await page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 20000 }).catch(() => {});
    await page.waitForTimeout(2500);
    console.log("  ログインページ URL:", page.url());

    // 楽天IDフォーム入力
    const idInput = page.locator('input[name="u"], input[type="email"], input[type="text"]').first();
    if (await idInput.count() > 0) {
      await idInput.fill(CREDS.username);
      await page.waitForTimeout(500);
      // 「次へ」ボタン
      const nextBtn = page.locator('button[type="submit"], input[type="submit"]').first();
      await nextBtn.click();
      await page.waitForTimeout(3000);

      // パスワード入力
      const pwInput = page.locator('input[type="password"]').first();
      if (await pwInput.count() > 0) {
        await pwInput.fill(CREDS.password);
        const submitBtn = page.locator('button[type="submit"], input[type="submit"]').first();
        await submitBtn.click();
        await page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 20000 }).catch(() => {});
        await page.waitForTimeout(3000);
        console.log("  ログイン後 URL:", page.url());
      }
    }
  }
}
console.log("  ログイン:", page.url());

// ── 2. キャンペーン一覧 ──
console.log("\n📋 キャンペーン一覧...");
await page.goto("https://affiliate.rakuten.co.jp/campaign", {
  waitUntil: "domcontentloaded", timeout: 20000,
});
await page.waitForTimeout(2500);
console.log("  URL:", page.url());

const campaignText = await page.evaluate(() => document.body.innerText.slice(0, 3000));
writeFileSync(path.join(outDir, "rakuten-campaign.txt"), campaignText, "utf-8");

// 楽天証券・楽天カード関連を抽出
const finance = ["楽天証券", "楽天カード", "楽天銀行", "楽天モバイル", "楽天保険", "楽天ペイ", "楽天デビット", "楽天プレミアム"];
finance.forEach(kw => {
  if (campaignText.includes(kw)) {
    const idx = campaignText.indexOf(kw);
    console.log(`  🎯 「${kw}」見つかった: ...${campaignText.slice(Math.max(0,idx-30), idx+150).replace(/\n/g, " ")}...`);
  }
});

// キャンペーンリンクを収集
const campaignLinks = await page.evaluate(() =>
  Array.from(document.querySelectorAll("a[href]")).map(a => ({
    text: a.textContent?.trim().replace(/\s+/g, " ").slice(0, 80),
    href: a.href,
  })).filter(l => l.text && l.href.includes("affiliate.rakuten") && l.text.length > 3)
);
console.log("\n  キャンペーン関連:");
const finCampaigns = campaignLinks.filter(l =>
  finance.some(kw => l.text.includes(kw))
);
if (finCampaigns.length > 0) {
  finCampaigns.slice(0, 10).forEach(l => console.log(`    "${l.text}" → ${l.href}`));
} else {
  console.log("    (楽天証券/楽天カード関連キャンペーン無し)");
}

// ── 3. プレミアムパートナー / 成果報酬 ──
console.log("\n📋 プレミアムパートナー...");
await page.goto("https://affiliate.rakuten.co.jp/premium-partner", {
  waitUntil: "domcontentloaded", timeout: 20000,
}).catch(() => {});
await page.waitForTimeout(2500);
console.log("  URL:", page.url());
const ppText = await page.evaluate(() => document.body.innerText.slice(0, 1500));
console.log("  テキスト:", ppText.replace(/\n/g, " ").slice(0, 500));
writeFileSync(path.join(outDir, "rakuten-premium-partner.txt"), ppText, "utf-8");

// ── 4. 商品サービス検索: 楽天証券・楽天カード ──
const SERVICES = ["楽天証券", "楽天カード", "楽天銀行"];
for (const service of SERVICES) {
  console.log(`\n🔍 「${service}」を商品サービス検索...`);
  await page.goto(`https://affiliate.rakuten.co.jp/search?sitem=${encodeURIComponent(service)}`, {
    waitUntil: "domcontentloaded", timeout: 20000,
  });
  await page.waitForTimeout(2500);

  const text = await page.evaluate(() => document.body.innerText);
  // 検索結果セクションを抽出 (カテゴリリスト以降)
  const mainSection = text.match(/該当する商品[\s\S]{0,2000}/) || text.match(/件\s*\n[\s\S]{0,2000}/) || [];
  const snippet = (mainSection[0] || text.slice(0, 1500)).replace(/\s+/g, " ").slice(0, 800);
  console.log("  ", snippet.slice(0, 600));

  // 該当0件チェック
  const noResult = text.includes("該当する商品はありませんでした") || text.includes("見つかりませんでした") || text.includes("0件");
  console.log(`  結果: ${noResult ? "0件" : "あり?"}`);
  writeFileSync(path.join(outDir, `rakuten-search-${service}.txt`), text.slice(0, 3000), "utf-8");
}

// ── 5. 楽天証券の自社アフィリエイトプログラム調査 ──
console.log("\n📋 楽天証券の自社アフィリ確認...");
const rakutenSecOptions = [
  "https://www.rakuten-sec.co.jp/web/info/info20210226-01.html",
  "https://www.rakuten-sec.co.jp/affiliate/",
];
for (const u of rakutenSecOptions) {
  try {
    await page.goto(u, { waitUntil: "domcontentloaded", timeout: 10000 });
    await page.waitForTimeout(1500);
    console.log(`  ${u} → ${page.url()}: ${(await page.evaluate(()=>document.title)).slice(0, 80)}`);
  } catch {}
}

console.log("\n✅ 完了 (調査結果は asp-output/ に保存)");
await ctx.close();
process.exit(0);
