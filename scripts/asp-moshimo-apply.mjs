/**
 * もしもアフィリエイト — 正しいプログラムを検索・申請 + リンク取得
 * node scripts/asp-moshimo-apply.mjs
 *
 * shop_site_id=671899 = tools.appdevelopsk.com (Toolify)
 * ターゲット: 楽天証券, 楽天カード, SBI証券, マイプロテイン, iHerb, あすけん
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
const SHOP_SITE_ID = "671899";

// 申請対象プログラム
const TARGETS = [
  { keyword: "楽天証券", catalogId: "rakuten-securities-jp" },
  { keyword: "楽天カード", catalogId: "rakuten-card-jp" },
  { keyword: "SBI証券", catalogId: "sbi-securities-jp" },
  { keyword: "マイプロテイン", catalogId: "myprotein-jp" },
  { keyword: "iHerb", catalogId: "iherb-global" },
  { keyword: "あすけん", catalogId: "asken-jp" },
];

const ctx = await chromium.launchPersistentContext(userDataDir, {
  headless: false,
  viewport: { width: 1280, height: 900 },
  userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
  ignoreDefaultArgs: ["--enable-automation"],
  args: ["--disable-blink-features=AutomationControlled", "--no-first-run"],
});

const page = ctx.pages()[0] ?? (await ctx.newPage());

// ── ログイン ──
console.log("🔑 ログイン中...");
await page.goto("https://af.moshimo.com/af/shop/login", { waitUntil: "networkidle" });
if (await page.locator("input[name=password]").count() > 0) {
  await page.locator("input[name=account]").fill(CREDS.username);
  await page.locator("input[name=password]").fill(CREDS.password);
  await page.locator("input[name=login]").click();
  await page.waitForNavigation({ waitUntil: "networkidle", timeout: 20000 }).catch(() => {});
}
console.log("✓ ログイン:", page.url());

const results = [];

for (const target of TARGETS) {
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`🔍 「${target.keyword}」を検索中...`);

  // 検索フォームを使って検索 (keyword URLパラメータはSPAでは無視されるため)
  await page.goto(
    `https://af.moshimo.com/af/shop/promotion/search?shop_site_id=${SHOP_SITE_ID}`,
    { waitUntil: "networkidle" }
  );
  await page.waitForTimeout(1500);

  // キーワード入力フィールドを探して入力
  const searchInput = page.locator('input[name="keyword"], input[placeholder*="キーワード"], input[type="search"], #keyword').first();
  if (await searchInput.count() > 0) {
    await searchInput.fill(target.keyword);
    await searchInput.press("Enter");
    await page.waitForTimeout(3000);
    console.log("  検索フォームで検索完了");
  } else {
    // フォームが見つからない場合はURLパラメータで試みる
    await page.goto(
      `https://af.moshimo.com/af/shop/promotion/search?keyword=${encodeURIComponent(target.keyword)}&shop_site_id=${SHOP_SITE_ID}`,
      { waitUntil: "networkidle" }
    );
    await page.waitForTimeout(2000);
    console.log("  URLパラメータで検索");
  }

  const ssName = `moshimo-search-${target.keyword.replace(/[^a-z0-9]/gi, "_")}.png`;
  await page.screenshot({ path: path.join(outDir, ssName), fullPage: false });

  // 検索結果を取得
  const searchResults = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("a[href*='promotion_id']")).map(a => ({
      text: a.textContent?.trim().replace(/\s+/g, " ").slice(0, 100),
      href: a.href,
      id: a.href.match(/promotion_id=(\d+)/)?.[1],
    })).filter(l => l.id && l.text && l.text.length > 5);
  });

  // 重複排除してプログラム名のあるものを優先
  const programs = [];
  const seen = new Set();
  for (const r of searchResults) {
    if (!seen.has(r.id)) {
      seen.add(r.id);
      // ボタン文字列は除外
      const isButton = ["一括提携申請へ","広告サンプルへ","広告リンクへ","詳細条件へ","どこでもリンクへ","提携申請へ"].includes(r.text);
      programs.push({ ...r, isButton });
    }
  }

  const namedPrograms = programs.filter(p => !p.isButton);
  console.log(`  検索結果: ${namedPrograms.length}件のプログラム`);
  namedPrograms.slice(0, 5).forEach(p => console.log(`    [${p.id}] ${p.text}`));

  if (namedPrograms.length === 0) {
    console.log(`  ⚠️  検索結果なし`);
    results.push({ ...target, found: false, status: "not_found" });
    continue;
  }

  // 最初のプログラムの詳細を確認
  const firstProgram = namedPrograms[0];
  console.log(`\n  詳細確認: [${firstProgram.id}] ${firstProgram.text}`);

  const detailUrl = `https://af.moshimo.com/af/shop/promotion/detail?promotion_id=${firstProgram.id}&shop_site_id=${SHOP_SITE_ID}`;
  await page.goto(detailUrl, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);

  const detail = await page.evaluate(() => {
    const status = document.body.innerText.match(/(提携中|申請中|否認|未申請)/)?.[0] || "不明";
    const bodySnippet = document.body.innerText.slice(0, 400).replace(/\n/g, " ");

    // すでに提携中の場合はリンクを取得
    const urlValues = Array.from(document.querySelectorAll("input, textarea"))
      .map(el => el.value || "")
      .filter(v => v.startsWith("http"))
      .slice(0, 3);

    return { status, urlValues, bodySnippet };
  });

  // 申請ボタンはPlaywrightのlocatorで探す (has-textはPlaywright専用)
  const applyBtn = page.locator('a, button, input[type="submit"]').filter({ hasText: /提携申請|申請する/ }).first();
  const hasApplyBtn = await applyBtn.count() > 0;
  const applyBtnText = hasApplyBtn ? await applyBtn.textContent() : null;
  detail.hasApplyBtn = hasApplyBtn;
  detail.applyBtnText = applyBtnText?.trim();

  console.log(`  ステータス: ${detail.status}`);
  console.log(`  申請ボタン: ${detail.hasApplyBtn ? detail.applyBtnText : "なし"}`);

  // 提携申請ボタンがあれば申請
  if (detail.hasApplyBtn && detail.status !== "提携中" && detail.status !== "申請中") {
    console.log("  📝 申請中...");
    if (await applyBtn.count() > 0) {
      await applyBtn.click();
      await page.waitForTimeout(3000);
      // 確認画面があれば確定ボタンをクリック
      const confirmBtn = page.locator('input[type="submit"], button:has-text("申請"), button:has-text("確定")').first();
      if (await confirmBtn.count() > 0) {
        await confirmBtn.click();
        await page.waitForTimeout(2000);
      }
      console.log("  ✓ 申請完了");
    }
  } else if (detail.status === "申請中") {
    console.log("  ⏳ 申請中（審査待ち）");
  } else if (detail.status === "提携中") {
    console.log("  ✅ すでに提携中");
    if (detail.urlValues.length > 0) {
      console.log(`  アフィリリンク: ${detail.urlValues[0].slice(0, 100)}`);
    }
  }

  results.push({
    ...target,
    found: true,
    promotionId: firstProgram.id,
    promotionName: firstProgram.text,
    status: detail.status,
    affiliateLinks: detail.urlValues,
  });
}

writeFileSync(
  path.join(outDir, "moshimo-apply-results-v2.json"),
  JSON.stringify(results, null, 2),
  "utf-8"
);

console.log("\n\n📊 結果サマリー:");
results.forEach(r => {
  const status = r.found ? r.status : "検索ヒットなし";
  const link = r.affiliateLinks?.[0] ? ` → ${r.affiliateLinks[0].slice(0, 60)}` : "";
  console.log(`  ${r.keyword}: ${status}${link}`);
});

console.log("\n✅ 完了: asp-output/moshimo-apply-results-v2.json");
console.log("終了するには Ctrl+C");
await new Promise(() => {});
