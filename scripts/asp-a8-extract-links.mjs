/**
 * A8.net — 参加中プログラムの広告リンクを抽出
 * node scripts/asp-a8-extract-links.mjs
 *
 * 出力: scripts/asp-output/a8-affiliate-links.json
 *
 * フロー:
 *   1. www.a8.net ログイン
 *   2. 参加中プログラム一覧 → 各 linkAction.do?insId=X を巡回
 *   3. 広告リンクのHTMLコードを取得 (textareaから)
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

// ── 参加中プログラム ──
console.log("\n📋 参加中プログラム取得...");
await page.goto("https://pub.a8.net/a8v2/media/partnerProgramListAction.do?act=search&viewPage=", {
  waitUntil: "domcontentloaded", timeout: 20000,
});
await page.waitForTimeout(3000);

// 全プログラムの insId と広告主名を取得
const programs = await page.evaluate(() => {
  const result = [];
  const linkAnchors = Array.from(document.querySelectorAll('a[href*="linkAction.do"]'));
  const seen = new Set();
  for (const a of linkAnchors) {
    const m = a.href.match(/insId=(s[\d]+)/);
    if (!m) continue;
    if (seen.has(m[1])) continue;
    seen.add(m[1]);

    // 親 row テキストから広告主名・プログラム名を取得
    let parent = a.closest("tr, .programItem, dl, .item");
    if (!parent) parent = a.parentElement;
    let info = "";
    for (let i = 0; i < 10 && parent; i++) {
      const text = parent.innerText?.trim().replace(/\s+/g, " ");
      if (text && text.length > 80) { info = text.slice(0, 400); break; }
      parent = parent.parentElement;
    }
    result.push({ insId: m[1], info });
  }
  return result;
});

console.log(`  ${programs.length} プログラム検出`);

// ── 各プログラムの広告リンクページを取得 ──
console.log("\n🔗 各プログラムの広告リンク取得...");
const results = [];

for (const prog of programs) {
  console.log(`\n  ━ ${prog.insId} ━`);
  const linkUrl = `https://pub.a8.net/a8v2/media/linkAction.do?insId=${prog.insId}`;

  try {
    await page.goto(linkUrl, { waitUntil: "domcontentloaded", timeout: 15000 });
    await page.waitForTimeout(2500);

    const data = await page.evaluate(() => {
      const result = {
        url: location.href,
        title: document.title,
        textareas: [],
        a8Urls: [],
        previewImg: "",
      };
      // textarea や code 要素から HTML/URL を抽出
      document.querySelectorAll("textarea, input[type=text][readonly]").forEach(el => {
        const v = (el.value || el.textContent || "").trim();
        if (v && v.length > 20) {
          result.textareas.push(v);
        }
      });
      // HTML 全体から a8 click URL を抽出
      const html = document.documentElement.outerHTML;
      const urls = [...html.matchAll(/(https?:\/\/(?:px\.a8\.net|ax\.click\.a8\.net|click\.a8\.net)[^\s"'<>]+)/g)].map(m => m[1]);
      result.a8Urls = [...new Set(urls)].slice(0, 15);
      // プレビュー画像 (a8側からホストされた素材)
      const img = document.querySelector("img[src*='image.a8.net'], img[src*='img.a8.net'], img[src*='a8.net/img']");
      if (img) result.previewImg = img.src;
      return result;
    });

    console.log(`    Title: ${data.title.slice(0, 60)}`);
    console.log(`    textareas: ${data.textareas.length}件, a8Urls: ${data.a8Urls.length}件`);

    // 最初のリンクテキストを抽出 (シンプルな <a> タグ)
    if (data.textareas.length > 0) {
      const sample = data.textareas[0];
      console.log(`    sample: ${sample.slice(0, 150).replace(/\n/g, " ")}`);

      // URLを抽出
      const clickUrl = sample.match(/(https?:\/\/(?:px\.a8\.net|ax\.click\.a8\.net)[^\s"'<>]+)/)?.[1] || "";
      const impUrl = sample.match(/<img[^>]+src="(https?:\/\/[^"]+a8\.net[^"]+)"/)?.[1] || "";
      console.log(`    click: ${clickUrl.slice(0, 80)}`);
    }

    results.push({
      insId: prog.insId,
      info: prog.info.slice(0, 200),
      ...data,
    });
  } catch (e) {
    console.log(`    ✗ エラー: ${e.message.slice(0, 80)}`);
    results.push({ insId: prog.insId, info: prog.info, error: e.message });
  }
  await page.waitForTimeout(500);
}

writeFileSync(path.join(outDir, "a8-affiliate-links.json"), JSON.stringify(results, null, 2), "utf-8");
console.log(`\n✅ 保存: scripts/asp-output/a8-affiliate-links.json (${results.length}件)`);
await ctx.close();
process.exit(0);
