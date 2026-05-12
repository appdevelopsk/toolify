/**
 * A8.net — 金融カテゴリをブラウズして楽天証券/SBI証券/楽天カードを探す
 * node scripts/asp-a8-search-finance.mjs
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

// ── ログイン ──
console.log("🔑 ログイン...");
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

const SEARCH_TARGETS = ["楽天証券", "SBI証券", "楽天カード", "あすけん"];

for (const target of SEARCH_TARGETS) {
  console.log(`\n━━ 「${target}」 ━━`);

  // URL パラメータで検索 (viewType=1 = リスト表示)
  const searchUrl = `https://pub.a8.net/a8v2/media/searchAction/keyword.do?action=search&viewType=1&keyword=${encodeURIComponent(target)}&page=1`;
  await page.goto(searchUrl, { waitUntil: "domcontentloaded", timeout: 20000 });
  await page.waitForTimeout(2500);

  // 全プログラムカードを収集 (3ページまで)
  const allPrograms = [];
  for (let pg = 1; pg <= 3; pg++) {
    if (pg > 1) {
      const nextUrl = `https://pub.a8.net/a8v2/media/searchAction/keyword.do?action=search&viewType=1&keyword=${encodeURIComponent(target)}&page=${pg}`;
      await page.goto(nextUrl, { waitUntil: "domcontentloaded", timeout: 20000 });
      await page.waitForTimeout(2000);
    }

    const programs = await page.evaluate(() => {
      const cards = new Map();
      for (const link of document.querySelectorAll('a[href*="insIds="]')) {
        const m = link.href.match(/insIds=(s[\d]+)/);
        if (!m) continue;
        const insId = m[1];
        if (cards.has(insId)) continue;
        let parent = link.parentElement;
        let text = "";
        for (let i = 0; i < 8 && parent; i++) {
          const t = parent.innerText?.trim().replace(/\s+/g, " ");
          if (t && t.length > 20) { text = t.slice(0, 200); break; }
          parent = parent.parentElement;
        }
        cards.set(insId, text);
      }
      return Array.from(cards.entries()).map(([id, text]) => ({ id, text }));
    });

    if (programs.length === 0) break;
    allPrograms.push(...programs);
    console.log(`  Page ${pg}: ${programs.length}件`);
    programs.forEach(p => console.log(`    [${p.id}] ${p.text.slice(0, 80)}`));
  }

  writeFileSync(
    path.join(outDir, `a8-finance-${target}.json`),
    JSON.stringify(allPrograms, null, 2),
    "utf-8"
  );
}

// セルフバックページも確認
console.log("\n\n📋 セルフバック確認...");
await page.goto("https://pub.a8.net/a8v2/media/selfback/list.do", {
  waitUntil: "domcontentloaded", timeout: 20000,
});
await page.waitForTimeout(2000);
const sbText = await page.evaluate(() => document.body.innerText.slice(0, 2000));
console.log("  テキスト:", sbText.replace(/\n/g, " ").slice(0, 800));
writeFileSync(path.join(outDir, "a8-selfback.txt"), sbText, "utf-8");

console.log("\n✅ 完了");
await ctx.close();
process.exit(0);
