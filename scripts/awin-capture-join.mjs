/**
 * AWIN — Apply クリック時の内部 API endpoint を捕獲
 * node scripts/awin-capture-join.mjs
 *
 * フロー:
 *   1. AWIN にログイン (手動)
 *   2. merchant-profile/52401 (WP Rocket) を開く
 *   3. 全ネットワークリクエストを記録
 *   4. ユーザーが Apply ボタンをクリック
 *   5. POST 系のリクエストを特定 → 内部 API エンドポイントを発見
 */

import { chromium } from "playwright";
import { mkdirSync, existsSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadCreds } from "./asp-creds.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const userDataDir = path.join(homedir(), ".cache/toolify-playwright/awin-profile");
const outDir = path.join(__dirname, "asp-output");
if (!existsSync(userDataDir)) mkdirSync(userDataDir, { recursive: true });
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

const CREDS = loadCreds("awin");

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

// ── ネットワーク監視を設定 ──
const apiCalls = [];
page.on("request", (req) => {
  const url = req.url();
  const method = req.method();
  // POST/PUT/PATCH かつ awin ドメインに送信されているもの
  if (["POST", "PUT", "PATCH"].includes(method) && url.includes("awin")) {
    const body = req.postData() || "";
    apiCalls.push({
      time: new Date().toISOString(),
      method,
      url,
      headers: req.headers(),
      body: body.slice(0, 2000),
    });
    console.log(`\n📡 ${method} ${url.slice(0, 120)}`);
    if (body) console.log(`   body: ${body.slice(0, 200)}`);
  }
});

page.on("response", async (res) => {
  const url = res.url();
  if (["POST", "PUT", "PATCH"].includes(res.request().method()) && url.includes("awin")) {
    try {
      const text = await res.text();
      console.log(`   ↳ status: ${res.status()}, response: ${text.slice(0, 200)}`);
      const last = apiCalls[apiCalls.length - 1];
      if (last) {
        last.status = res.status();
        last.response = text.slice(0, 2000);
      }
    } catch {}
  }
});

// ── 1. AWIN にアクセス ──
console.log("🌐 AWIN を開きます...");
await page.goto("https://ui.awin.com/", { waitUntil: "domcontentloaded", timeout: 30000 });
await page.waitForTimeout(3500);
console.log("  URL:", page.url());

// ログイン確認
const isLoggedIn = await page.evaluate(() => {
  const t = document.body.innerText;
  return t.includes("Dashboard") || t.includes("Earnings") || t.includes("ダッシュボード");
});

if (!isLoggedIn) {
  console.log("\n📋 AWIN にログインしてください (このブラウザで)");
  console.log(`  メール: ${CREDS.username}`);
  console.log(`  パスワード: ${CREDS.password}`);
  console.log("  ログイン完了を待機中 (最大5分)...");
  let waited = 0;
  while (waited < 300) {
    await page.waitForTimeout(5000);
    waited += 5;
    const text = await page.evaluate(() => document.body.innerText.slice(0, 200)).catch(() => "");
    if (text.includes("Dashboard") || text.includes("Earnings")) {
      console.log("  ✅ ログイン検出");
      break;
    }
    if (waited % 30 === 0) console.log(`    待機中... ${waited}秒`);
  }
}

// ── 2. WP Rocket の merchant-profile を開く ──
console.log("\n🎯 WP Rocket [52401] へ移動...");
await page.goto("https://ui.awin.com/merchant-profile/52401", {
  waitUntil: "domcontentloaded", timeout: 30000,
});
await page.waitForTimeout(3500);

console.log("\n📌 これから、ブラウザで以下を実行してください:");
console.log("  1. 「Join Programme」ボタンをクリック");
console.log("  2. フォームに入力:");
console.log("     - Promotion: tools.appdevelopsk.com を選択");
console.log("     - Message: (お好きなテキスト)");
console.log("     - チェックボックスにチェック");
console.log("  3. 「Apply to Join」ボタンをクリック");
console.log("");
console.log("⏳ ネットワーク監視中... (Ctrl+C で停止 → API一覧を保存)");

// シグナル処理
let saved = false;
const saveAndExit = () => {
  if (saved) return; saved = true;
  writeFileSync(path.join(outDir, "awin-api-calls.json"), JSON.stringify(apiCalls, null, 2), "utf-8");
  console.log(`\n✅ ${apiCalls.length}件のAPI呼び出しを保存: scripts/asp-output/awin-api-calls.json`);
  process.exit(0);
};
process.on("SIGINT", saveAndExit);
process.on("SIGTERM", saveAndExit);

// 5分以内に submit があったら自動終了する代わりに、長時間監視
await new Promise(() => {});
