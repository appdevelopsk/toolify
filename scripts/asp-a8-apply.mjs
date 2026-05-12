/**
 * A8.net — プログラム検索・申請
 * node scripts/asp-a8-apply.mjs
 *
 * 申請button: 'a[href*="onHideAndJoinSubmit"]' or text "提携申請をする"
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

// キーワード → 広告主名のマッチング用フラグメント
const TARGETS = [
  { keyword: "楽天証券", match: ["楽天証券"] },
  { keyword: "SBI証券", match: ["SBI証券", "ＳＢＩＧ証券", "ＳＢＩ証券"] },
  { keyword: "楽天カード", match: ["楽天カード"] },
  { keyword: "マイプロテイン", match: ["Myprotein", "マイプロテイン", "THG", "ＴＨＧ"] },
  { keyword: "iHerb", match: ["iHerb", "ｉＨｅｒｂ"] },
  { keyword: "あすけん", match: ["あすけん", "asken", "株式会社asken"] },
  { keyword: "ConoHa WING", match: ["ConoHa", "ＧＭＯインターネット"] },
  { keyword: "三井住友カード", match: ["三井住友カード", "SMBC"] },
];

// ConoHa WINGは検索で確認済み
const CONFIRMED = [
  "s00000000018035", // ConoHa WING (confirmed)
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

// ── プログラム検索関数 ──
async function searchPrograms(keyword, matchStrings) {
  console.log(`\n🔍 「${keyword}」を検索中...`);
  const found = [];

  // 検索ページを開いてキーワードを入力
  await page.goto("https://pub.a8.net/a8v2/media/searchAction.do", {
    waitUntil: "domcontentloaded", timeout: 20000,
  });
  await page.waitForTimeout(1500);

  const kwInput = page.locator('input[name="keyword"]').first();
  if (await kwInput.count() > 0) {
    await kwInput.fill(keyword);
    const submitBtn = page.locator('input[type="submit"], button[type="submit"]').first();
    if (await submitBtn.count() > 0) await submitBtn.click();
    else await kwInput.press("Enter");
    await page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);
  }

  // 結果ページのプログラムカードを収集 (複数ページ対応)
  let pageNum = 1;
  while (pageNum <= 3) {
    const programs = await page.evaluate((matchStrings) => {
      // insId付きリンクを持つ要素から、周辺テキストを収集
      const cards = new Map();
      const links = document.querySelectorAll('a[href*="insIds="]');
      for (const link of links) {
        const m = link.href.match(/insIds=(s[\d]+)/);
        if (!m) continue;
        const insId = m[1];
        if (cards.has(insId)) continue;

        // 親要素をさかのぼってカード全体のテキストを取得
        let parent = link.parentElement;
        let text = "";
        for (let i = 0; i < 8 && parent; i++) {
          const t = parent.innerText?.trim().replace(/\s+/g, " ");
          if (t && t.length > 20) { text = t; break; }
          parent = parent.parentElement;
        }
        cards.set(insId, text.slice(0, 200));
      }
      return Array.from(cards.entries()).map(([id, text]) => ({ id, text }));
    }, matchStrings);

    for (const prog of programs) {
      const isMatch = matchStrings.some(m => prog.text.includes(m));
      if (isMatch) {
        console.log(`  ✓ マッチ: [${prog.id}] ${prog.text.slice(0, 80)}`);
        found.push(prog.id);
      } else {
        console.log(`    [${prog.id}] ${prog.text.slice(0, 60)}`);
      }
    }

    if (found.length > 0) break;

    // 次ページへ
    const nextLink = page.locator('a:text("次へ"), a:text("次ページ"), .page-next a, [rel="next"]').first();
    if (await nextLink.count() > 0) {
      await nextLink.click();
      await page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(2000);
      pageNum++;
    } else {
      break;
    }
  }

  if (found.length === 0) {
    console.log(`  ⚠ 「${keyword}」のプログラムが見つかりませんでした`);
  }
  return found;
}

// ── 申請関数 ──
async function applyProgram(insId) {
  const detailUrl = `https://pub.a8.net/a8v2/media/joinPrograms/detail.do?action=confirmSearch&insIds=${insId}&searchFlg=1&viewType=0`;
  console.log(`\n  申請: ${insId}`);
  await page.goto(detailUrl, { waitUntil: "domcontentloaded", timeout: 20000 });
  await page.waitForTimeout(2500);

  const info = await page.evaluate(() => {
    const text = document.body.innerText;
    const statusMatch = text.match(/(提携中|申込中|申請中|審査中|未提携|未申請)/);
    return {
      status: statusMatch?.[1] || "不明",
      hasApplyBtn: !!document.querySelector('a[href*="onHideAndJoinSubmit"]'),
    };
  });

  console.log(`  ステータス: ${info.status}, 申請ボタン: ${info.hasApplyBtn}`);

  if (info.status === "提携中" || info.status === "申込中" || info.status === "申請中") {
    console.log(`  → スキップ (${info.status})`);
    return { insId, status: info.status, applied: false };
  }

  if (!info.hasApplyBtn) {
    console.log("  → 申請ボタンなし");
    return { insId, status: info.status, applied: false };
  }

  // 申請実行
  const applyBtn = page.locator('a[href*="onHideAndJoinSubmit"]').first();
  await applyBtn.click();
  await page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(2000);

  const afterUrl = page.url();
  const afterText = await page.evaluate(() => document.body.innerText.slice(0, 500));
  console.log(`  → 申請後 URL: ${afterUrl}`);
  console.log(`  → ${afterText.replace(/\n/g, " ").slice(0, 200)}`);

  return { insId, status: "申請済み", applied: true, afterUrl };
}

// ── メイン処理 ──
const results = [];
const allInsIds = new Set(CONFIRMED);

// 各キーワードで検索
for (const target of TARGETS) {
  const ids = await searchPrograms(target.keyword, target.match);
  for (const id of ids) allInsIds.add(id);
}

// 申請
console.log(`\n\n📝 申請対象: ${allInsIds.size}件`);
for (const insId of allInsIds) {
  const result = await applyProgram(insId);
  results.push(result);
}

writeFileSync(
  path.join(outDir, "a8-apply-results.json"),
  JSON.stringify(results, null, 2),
  "utf-8"
);

const applied = results.filter(r => r.applied);
console.log(`\n✅ 完了: 申請 ${applied.length}件`);
applied.forEach(r => console.log(`  ✓ ${r.insId} → ${r.afterUrl}`));

const skipped = results.filter(r => !r.applied);
console.log(`スキップ: ${skipped.length}件`);
skipped.forEach(r => console.log(`  - ${r.insId} (${r.status})`));

console.log("\n終了するには Ctrl+C");
await new Promise(() => {});
