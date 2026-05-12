/**
 * もしもアフィリエイト — 検索フォームの構造を調べる
 * node scripts/asp-moshimo-explore.mjs
 * (スクリーンショットなし - ディスク節約)
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

const ctx = await chromium.launchPersistentContext(userDataDir, {
  headless: false,
  viewport: { width: 1280, height: 900 },
  userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
  ignoreDefaultArgs: ["--enable-automation"],
  args: ["--disable-blink-features=AutomationControlled", "--no-first-run"],
});
const page = ctx.pages()[0] ?? (await ctx.newPage());

// ── ログイン ──
await page.goto("https://af.moshimo.com/af/shop/login", { waitUntil: "networkidle" });
if (await page.locator("input[name=password]").count() > 0) {
  await page.locator("input[name=account]").fill(CREDS.username);
  await page.locator("input[name=password]").fill(CREDS.password);
  await page.locator("input[name=login]").click();
  await page.waitForNavigation({ waitUntil: "networkidle", timeout: 20000 }).catch(() => {});
}
console.log("✓ ログイン:", page.url());

// ── ネットワークリクエストを監視 ──
const networkReqs = [];
page.on("request", req => {
  if (req.resourceType() === "xhr" || req.resourceType() === "fetch") {
    networkReqs.push({ method: req.method(), url: req.url() });
  }
});

// ── 検索ページ (shop_site_idなし) ──
console.log("\n=== 検索ページ (shop_site_idなし) ===");
await page.goto("https://af.moshimo.com/af/shop/promotion/search", { waitUntil: "networkidle" });
await page.waitForTimeout(2000);

// フォーム要素をすべてダンプ
const formElements = await page.evaluate(() => {
  return Array.from(document.querySelectorAll("input, select, textarea, button[type]")).map(el => ({
    tag: el.tagName.toLowerCase(),
    type: el.getAttribute("type") || "",
    name: el.getAttribute("name") || "",
    id: el.getAttribute("id") || "",
    placeholder: el.getAttribute("placeholder") || "",
    class: el.className?.slice(0, 60) || "",
  }));
});
console.log("フォーム要素:");
formElements.forEach(el => {
  if (el.type !== "hidden") {
    console.log(`  <${el.tag} type="${el.type}" name="${el.name}" id="${el.id}" placeholder="${el.placeholder}">`);
  }
});

// ── キーワード入力 ──
const kwInput = page.locator("input[name=keyword]").first();
if (await kwInput.count() > 0) {
  console.log("\n✓ input[name=keyword] 発見 — 楽天証券で検索...");
  await kwInput.fill("楽天証券");

  // ENTER 押下前のXHRをリセット
  networkReqs.length = 0;

  const submitBtn = page.locator('input[type="submit"][value*="検索"], button[type="submit"]:has-text("検索"), button:has-text("検索")').first();
  if (await submitBtn.count() > 0) {
    console.log("  検索ボタンをクリック...");
    await submitBtn.click();
  } else {
    console.log("  Enter送信...");
    await kwInput.press("Enter");
  }
  await page.waitForTimeout(4000);
  console.log("  URL after:", page.url());
} else {
  // inputのあるformを探す
  console.log("\n✗ input[name=keyword] なし — 別の入力を探す...");
  const allInputs = await page.evaluate(() =>
    Array.from(document.querySelectorAll("input:not([type=hidden])")).map(el => ({
      name: el.name, id: el.id, placeholder: el.placeholder, type: el.type
    }))
  );
  console.log("非hidden input一覧:", JSON.stringify(allInputs));
}

// 検索後の結果
const results1 = await page.evaluate(() => {
  const links = Array.from(document.querySelectorAll("a[href*='promotion_id']")).map(a => ({
    text: a.textContent?.trim().replace(/\s+/g, " ").slice(0, 100),
    id: a.href.match(/promotion_id=(\d+)/)?.[1],
  })).filter(l => l.id && l.text && l.text.length > 5 && !l.text.match(/^(一括提携申請|広告サンプル|広告リンク|詳細条件|どこでもリンク|提携申請|プロモーション詳細)$/));
  const unique = Object.values(Object.fromEntries(links.map(l => [l.id, l])));
  return { programs: unique, pageText: document.body.innerText.slice(0, 600) };
});

console.log(`\n検索結果 (shop_site_idなし): ${results1.programs.length}件`);
results1.programs.slice(0, 10).forEach(p => console.log(`  [${p.id}] ${p.text}`));
console.log("ページ内容:", results1.pageText.replace(/\n/g, " ").slice(0, 400));

// ── XHRリクエストの確認 ──
console.log("\n=== キャプチャされたXHR/FetchリクエスT ===");
networkReqs.forEach(r => console.log(`  [${r.method}] ${r.url.slice(0, 120)}`));

// ── 金融カテゴリで探す ──
console.log("\n=== 金融カテゴリ (promotion_category_code=13) ===");
await page.goto(
  `https://af.moshimo.com/af/shop/promotion/search?promotion_category_code=13&shop_site_id=${SHOP_SITE_ID}`,
  { waitUntil: "networkidle" }
);
await page.waitForTimeout(2000);

const financePrograms = await page.evaluate(() => {
  const links = Array.from(document.querySelectorAll("a[href*='promotion_id']")).map(a => ({
    text: a.textContent?.trim().replace(/\s+/g, " ").slice(0, 100),
    id: a.href.match(/promotion_id=(\d+)/)?.[1],
  })).filter(l => l.id && l.text && l.text.length > 5 && !l.text.match(/^(一括提携申請|広告サンプル|広告リンク|詳細条件|どこでもリンク|提携申請|プロモーション詳細)$/));
  const unique = Object.values(Object.fromEntries(links.map(l => [l.id, l])));
  return { programs: unique, pageText: document.body.innerText.slice(0, 800) };
});
console.log(`金融プログラム: ${financePrograms.programs.length}件`);
financePrograms.programs.slice(0, 15).forEach(p => console.log(`  [${p.id}] ${p.text}`));
console.log("テキスト:", financePrograms.pageText.replace(/\n/g, " ").slice(0, 400));

// ── 健康カテゴリ ──
console.log("\n=== 健康カテゴリ (promotion_category_code=12) ===");
await page.goto(
  `https://af.moshimo.com/af/shop/promotion/search?promotion_category_code=12&shop_site_id=${SHOP_SITE_ID}`,
  { waitUntil: "networkidle" }
);
await page.waitForTimeout(2000);

const healthPrograms = await page.evaluate(() => {
  const links = Array.from(document.querySelectorAll("a[href*='promotion_id']")).map(a => ({
    text: a.textContent?.trim().replace(/\s+/g, " ").slice(0, 100),
    id: a.href.match(/promotion_id=(\d+)/)?.[1],
  })).filter(l => l.id && l.text && l.text.length > 5 && !l.text.match(/^(一括提携申請|広告サンプル|広告リンク|詳細条件|どこでもリンク|提携申請|プロモーション詳細)$/));
  const unique = Object.values(Object.fromEntries(links.map(l => [l.id, l])));
  return { programs: unique };
});
console.log(`健康プログラム: ${healthPrograms.programs.length}件`);
healthPrograms.programs.slice(0, 10).forEach(p => console.log(`  [${p.id}] ${p.text}`));

writeFileSync(path.join(outDir, "explore-finance-programs.json"), JSON.stringify(financePrograms.programs, null, 2), "utf-8");
writeFileSync(path.join(outDir, "explore-health-programs.json"), JSON.stringify(healthPrograms.programs, null, 2), "utf-8");

console.log("\n終了するには Ctrl+C");
await new Promise(() => {});
