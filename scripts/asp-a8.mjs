/**
 * A8.net — 新メディア登録 + プログラム申請
 * node scripts/asp-a8.mjs
 *
 * 1. www.a8.net でログイン (login/passwd/login_as_btn)
 * 2. サイト情報ページ確認 → tools.appdevelopsk.com を追加
 * 3. プログラム検索・申請
 *    ターゲット: 楽天証券, SBI証券, マイプロテイン, iHerb, あすけん, ConoHa WING, 三井住友カード
 */

import { chromium } from "playwright";
import { mkdirSync, existsSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadCreds } from "./asp-creds.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const userDataDir = path.join(homedir(), ".cache/toolify-playwright/a8-profile");
const outDir = path.join(__dirname, "asp-output");
if (!existsSync(userDataDir)) mkdirSync(userDataDir, { recursive: true });
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

const CREDS = loadCreds("a8");

const TARGETS = [
  "楽天証券",
  "SBI証券",
  "楽天カード",
  "マイプロテイン",
  "iHerb",
  "あすけん",
  "ConoHa WING",
  "三井住友カード",
];

const ctx = await chromium.launchPersistentContext(userDataDir, {
  headless: false,
  viewport: { width: 1280, height: 900 },
  userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
  ignoreDefaultArgs: ["--enable-automation"],
  args: [
    "--disable-blink-features=AutomationControlled",
    "--no-first-run",
    "--disable-infobars",
    "--disable-extensions",
  ],
});

await ctx.addInitScript(() => {
  Object.defineProperty(navigator, "webdriver", { get: () => undefined });
  Object.defineProperty(navigator, "languages", { get: () => ["ja-JP", "ja", "en-US"] });
  window.chrome = { runtime: {} };
});

const page = ctx.pages()[0] ?? (await ctx.newPage());

// ── ログイン (www.a8.net) ──
console.log("🔑 A8.net ログイン中...");
await page.goto("https://www.a8.net/", {
  waitUntil: "domcontentloaded",
  timeout: 30000,
});
await page.waitForTimeout(2000);
console.log("  URL:", page.url());

const loginInput = page.locator('input[name="login"]').first();
if (await loginInput.count() > 0) {
  await loginInput.fill(CREDS.username);
  await page.locator('input[name="passwd"]').first().fill(CREDS.password);
  await page.locator('input[name="login_as_btn"]').first().click();
  await page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(2000);
  console.log("  ログイン後 URL:", page.url());
} else {
  console.log("  フォームなし (セッション残存?) URL:", page.url());
}

const loggedInText = await page.evaluate(() => document.body.innerText.slice(0, 200));
console.log("  ページ:", loggedInText.replace(/\n/g, " ").slice(0, 150));

// ── サイト情報確認 ──
console.log("\n📋 サイト情報ページ確認...");
await page.goto("https://pub.a8.net/a8v2/media/siteAction.do", {
  waitUntil: "domcontentloaded",
  timeout: 20000,
});
await page.waitForTimeout(2000);
console.log("  URL:", page.url());

const siteText = await page.evaluate(() => document.body.innerText.slice(0, 1500));
console.log("  テキスト:", siteText.replace(/\n/g, " ").slice(0, 600));
writeFileSync(path.join(outDir, "a8-site-info.txt"), siteText, "utf-8");

// サイト追加ボタン/リンクを探す
const addSiteLinks = await page.evaluate(() =>
  Array.from(document.querySelectorAll("a, button, input[type=submit]")).map(el => ({
    text: (el.textContent?.trim() || el.value || "").slice(0, 60),
    href: el.href || el.getAttribute("onclick") || "",
  })).filter(l => l.text.includes("追加") || l.text.includes("新規") || l.text.includes("登録"))
);
console.log("  追加リンク:", JSON.stringify(addSiteLinks.slice(0, 10), null, 2));

// サイト一覧のHTML保存
const siteHtml = await page.content();
writeFileSync(path.join(outDir, "a8-site-info.html"), siteHtml, "utf-8");

// ── プログラム検索 ──
console.log("\n🔍 プログラム検索...");
const searchResults = {};

for (const keyword of TARGETS) {
  console.log(`\n━━ 「${keyword}」 ━━`);

  await page.goto("https://pub.a8.net/a8v2/media/searchAction.do", {
    waitUntil: "domcontentloaded",
    timeout: 20000,
  });
  await page.waitForTimeout(2000);

  // 検索フォームの要素確認
  const formEls = await page.evaluate(() =>
    Array.from(document.querySelectorAll("input:not([type=hidden]):not([type=submit]), select")).map(el => ({
      type: el.getAttribute("type") || el.tagName.toLowerCase(),
      name: el.getAttribute("name") || "",
      id: el.getAttribute("id") || "",
      placeholder: el.getAttribute("placeholder") || "",
    }))
  );
  if (formEls.length > 0) {
    console.log("  フォーム:", JSON.stringify(formEls.slice(0, 5), null, 2));
  }

  // キーワード入力を試みる
  const kwSelectors = [
    "input[name=keyword]",
    "input[name=word]",
    "input[name=programName]",
    "input[name=searchWord]",
    "input[name=q]",
    "input[placeholder*='キーワード']",
    "input[placeholder*='検索']",
    "input[type=text]:first-of-type",
  ];

  let searched = false;
  for (const sel of kwSelectors) {
    const input = page.locator(sel).first();
    if (await input.count() > 0) {
      await input.fill(keyword);
      const submitBtn = page.locator('input[type="submit"], button[type="submit"]').first();
      if (await submitBtn.count() > 0) await submitBtn.click();
      else await input.press("Enter");
      await page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(2000);
      console.log(`  セレクタ: ${sel} → URL: ${page.url()}`);
      searched = true;
      break;
    }
  }

  if (!searched) {
    // URLパラメータで試みる
    const kwUrl = `https://pub.a8.net/a8v2/media/searchAction/keyword.do?action=search&viewType=1&keyword=${encodeURIComponent(keyword)}`;
    await page.goto(kwUrl, { waitUntil: "domcontentloaded", timeout: 20000 });
    await page.waitForTimeout(2000);
    console.log(`  URLパラメータ → URL: ${page.url()}`);
  }

  // 検索結果を収集
  const result = await page.evaluate(() => {
    const text = document.body.innerText;
    const links = Array.from(document.querySelectorAll("a[href]")).map(a => ({
      text: a.textContent?.trim().replace(/\s+/g, " ").slice(0, 80),
      href: a.href,
    })).filter(l => l.text && l.text.length > 3 && l.href.includes("a8.net"));

    // 申請リンクを探す
    const applyLinks = links.filter(l =>
      l.href.includes("apply") || l.href.includes("programDetail") ||
      l.text.includes("参加") || l.text.includes("申請") || l.text.includes("詳細")
    );

    // プログラム名のリスト
    const programNames = Array.from(document.querySelectorAll("h2, h3, .programName, .program-name, td"))
      .map(el => el.textContent?.trim().replace(/\s+/g, " ").slice(0, 60))
      .filter(t => t && t.length > 3)
      .slice(0, 10);

    return { textSnippet: text.slice(0, 800), links: links.slice(0, 20), applyLinks, programNames };
  });

  console.log(`  テキスト: ${result.textSnippet.replace(/\n/g, " ").slice(0, 300)}`);
  console.log(`  プログラム名: ${JSON.stringify(result.programNames.slice(0, 5))}`);
  if (result.applyLinks.length > 0) {
    console.log(`  申請リンク: ${JSON.stringify(result.applyLinks.slice(0, 3), null, 2)}`);
  }

  searchResults[keyword] = result;

  // ページHTML保存
  const resultHtml = await page.content();
  writeFileSync(
    path.join(outDir, `a8-search-${keyword.replace(/[^\w぀-鿿]/g, "_")}.html`),
    resultHtml, "utf-8"
  );
}

writeFileSync(
  path.join(outDir, "a8-search-results.json"),
  JSON.stringify(searchResults, null, 2),
  "utf-8"
);
console.log("\n✅ 完了: asp-output/a8-search-results.json");
console.log("終了するには Ctrl+C");
await new Promise(() => {});
