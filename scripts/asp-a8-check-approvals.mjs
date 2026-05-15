/**
 * A8.net — 提携中プログラム一覧 + 未取得リンクの抽出
 * node scripts/asp-a8-check-approvals.mjs
 *
 * 出力:
 *   asp-output/a8-approved-programs.json  — 承認済みプログラム + アフィリリンク
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

// 取得したいプログラムのキーワード
const TARGETS = [
  { id: "sbi-securities-jp",   keyword: "SBI証券" },
  { id: "rakuten-card-jp",     keyword: "楽天カード" },
  { id: "lifenet-jp",          keyword: "ライフネット生命" },
  { id: "moneyforward-jp",     keyword: "マネーフォワード" },
  { id: "asken-jp",            keyword: "あすけん" },
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

// ── 1. ログイン確認 ──
console.log("🔐 A8.netにアクセス中...");
await page.goto("https://pub.a8.net/a8v2/pubTop.do", { waitUntil: "domcontentloaded", timeout: 30000 });
await page.waitForTimeout(2000);

const bodyText = await page.evaluate(() => document.body.innerText);
const isLoggedOut = bodyText.includes("ログアウトしました") || bodyText.includes("ログインはこちら") || page.url().includes("login");

if (isLoggedOut) {
  console.log("⚠️  セッション切れ。ブラウザでA8.netにログインしてください...");
  console.log("   ログイン完了後、自動的に次のステップに進みます。");
  await page.goto("https://pub.a8.net/a8v2/pubTop.do", { waitUntil: "domcontentloaded", timeout: 10000 });
  // Wait up to 3 minutes for user to log in (wait for dashboard URL)
  await page.waitForFunction(
    () => !document.body.innerText.includes("ログインはこちら") && !document.body.innerText.includes("ログアウトしました"),
    { timeout: 180000 }
  );
  console.log("✓ ログイン完了");
}

// ── 2. 提携中プログラム一覧ページへ ──
console.log("\n📋 提携中プログラムを確認中...");
await page.goto("https://pub.a8.net/a8v2/media/offeredListAction.do", {
  waitUntil: "domcontentloaded",
  timeout: 30000,
});
await page.waitForTimeout(2000);

const partnersHtml = await page.content();
writeFileSync(path.join(outDir, "a8-approved-list.html"), partnersHtml, "utf-8");
console.log("  保存: a8-approved-list.html");

// ── 3. 各ターゲットプログラムのリンクを確認 ──
for (const target of TARGETS) {
  console.log(`\n🔍 ${target.keyword} を検索中...`);

  // 提携済みリスト内で検索
  await page.goto(
    `https://pub.a8.net/a8v2/media/partnerProgramListAction.do?act=search&searchWord=${encodeURIComponent(target.keyword)}`,
    { waitUntil: "domcontentloaded", timeout: 30000 }
  );
  await page.waitForTimeout(1500);

  const pageText = await page.evaluate(() => document.body.innerText);
  const pageContent = await page.content();

  // 「広告リンク作成」リンクを探す
  const linkCreationLinks = await page.$$eval('a[href*="linkAction"]', els =>
    els.map(el => ({
      text: el.innerText.trim(),
      href: el.href,
    }))
  );

  if (linkCreationLinks.length > 0) {
    console.log(`  ✓ ${target.keyword}: 提携中 — リンク作成ページへ移動`);

    // 最初のリンクへ移動してアフィリURLを抽出
    await page.goto(linkCreationLinks[0].href, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForTimeout(2000);

    const textareas = await page.$$eval("textarea", els => els.map(el => el.value.trim()));
    const affiliateUrls = textareas
      .filter(t => t.includes("px.a8.net"))
      .map(t => {
        const match = t.match(/https:\/\/px\.a8\.net\/svt\/ejp\?[^\s"<]+/);
        return match ? match[0] : null;
      })
      .filter(Boolean);

    results.push({
      id: target.id,
      keyword: target.keyword,
      status: "approved",
      affiliateUrls,
      linkPage: linkCreationLinks[0].href,
    });

    writeFileSync(
      path.join(outDir, `a8-approved-${target.keyword}.html`),
      await page.content(),
      "utf-8"
    );
  } else if (pageText.includes("申請中") || pageText.includes("審査中")) {
    console.log(`  ⏳ ${target.keyword}: 申請中（審査待ち）`);
    results.push({ id: target.id, keyword: target.keyword, status: "pending_review" });
  } else if (pageText.includes("未提携") || linkCreationLinks.length === 0) {
    console.log(`  ✗ ${target.keyword}: 未提携（申請が必要）`);
    results.push({ id: target.id, keyword: target.keyword, status: "not_affiliated" });
  } else {
    console.log(`  ? ${target.keyword}: 状態不明`);
    results.push({ id: target.id, keyword: target.keyword, status: "unknown", pageText: pageText.slice(0, 500) });
    writeFileSync(path.join(outDir, `a8-check-${target.keyword}.html`), pageContent, "utf-8");
  }
}

// ── 4. 結果保存 ──
writeFileSync(
  path.join(outDir, "a8-approved-programs.json"),
  JSON.stringify(results, null, 2),
  "utf-8"
);

console.log("\n\n========== 結果サマリー ==========");
for (const r of results) {
  const icon = r.status === "approved" ? "✅" : r.status === "pending_review" ? "⏳" : "❌";
  console.log(`${icon} ${r.keyword} (${r.id}): ${r.status}`);
  if (r.affiliateUrls?.length) {
    r.affiliateUrls.forEach(u => console.log(`   → ${u}`));
  }
}

console.log(`\n📄 結果保存: scripts/asp-output/a8-approved-programs.json`);
await ctx.close();
