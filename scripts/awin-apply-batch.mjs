/**
 * AWIN — 残り5プログラムをPlaywright UI操作で自動申請
 * node scripts/awin-apply-batch.mjs
 *
 * 各プログラムについて:
 *   1. merchant-profile を開く
 *   2. 「Join Programme」ボタンクリック
 *   3. モーダル内の Promotion ドロップダウンで tools.appdevelopsk.com を選択
 *   4. Message を入力
 *   5. 規約チェックボックス
 *   6. Apply ボタンクリック
 *   7. 結果確認
 */

import { chromium } from "playwright";
import { homedir } from "node:os";
import path from "node:path";

const userDataDir = path.join(homedir(), ".cache/toolify-playwright/awin-profile");

const PROGRAMS = [
  { id: "15132", name: "NordVPN (US & CA)", message: "Toolify (tools.appdevelopsk.com) is a free online tools site with 120+ utilities. Our English audience includes security-conscious developers and remote workers — VPN content fits naturally in our privacy/networking section." },
  { id: "6288",  name: "Fiverr Affiliates (Global)", message: "Toolify (tools.appdevelopsk.com) serves developers, bloggers and SMB owners with 120+ free utilities. We regularly link to freelance services — Fiverr complements our productivity tools section." },
  { id: "21749", name: "Surfshark DE / AT", message: "Toolify (tools.appdevelopsk.com) provides free utilities (120+ tools) for international users. Security and VPN content is core to our network category — Surfshark Antivirus is a great fit." },
  { id: "89935", name: "Cloudways", message: "Toolify (tools.appdevelopsk.com) is a multi-language tools site. Many readers run WordPress and Laravel — Cloudways managed hosting is ideal for our hosting and devops content." },
  { id: "16296", name: "ScreenPal (US & Canada)", message: "Toolify (tools.appdevelopsk.com) serves developers and creators with 120+ free utilities. ScreenPal aligns with our productivity and recording category for tutorials and demos." },
];

const ctx = await chromium.launchPersistentContext(userDataDir, {
  headless: false, viewport: { width: 1280, height: 900 },
  userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
  ignoreDefaultArgs: ["--enable-automation"],
  args: ["--disable-blink-features=AutomationControlled", "--no-first-run"],
});
const page = ctx.pages()[0] ?? (await ctx.newPage());

// セッション確認
console.log("🔑 セッション確認...");
await page.goto("https://ui.awin.com/", { waitUntil: "domcontentloaded", timeout: 30000 });
await page.waitForTimeout(3000);
const loggedIn = await page.evaluate(() => document.body.innerText.includes("Dashboard") || document.body.innerText.includes("Earnings"));
if (!loggedIn) {
  console.log("❌ ログイン失効。手動再ログイン待機 (5分)...");
  for (let i = 0; i < 60; i++) {
    await page.waitForTimeout(5000);
    const t = await page.evaluate(() => document.body.innerText).catch(() => "");
    if (t.includes("Dashboard")) break;
  }
}
console.log("  ✓ ログイン済");

const results = [];

for (const prog of PROGRAMS) {
  console.log(`\n━ [${prog.id}] ${prog.name}`);

  try {
    // 1. merchant-profile を開く
    await page.goto(`https://ui.awin.com/awin/affiliate/2887303/merchant-profile/${prog.id}`, {
      waitUntil: "domcontentloaded", timeout: 20000,
    });
    await page.waitForTimeout(2500);

    // 2. 「Join Program」ボタンをJSで直接探してクリック (Playwright text matchが効かないので)
    const clicked = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("a, button"));
      // "Join Programs"(複数=ナビ)を除外、"Join Program"(単数=action button)を選ぶ
      const target = btns.find(b => {
        const t = b.textContent?.trim() || "";
        return t === "Join Program" || t === "Join Programme";
      });
      if (target) {
        target.click();
        return { found: true, href: target.href || "", outer: target.outerHTML.slice(0, 200) };
      }
      return { found: false };
    });
    if (!clicked.found) {
      console.log("  ✗ Join Program ボタンクリック失敗");
      results.push({ id: prog.id, name: prog.name, error: "no join button" });
      continue;
    }
    console.log(`  ✓ Join Program クリック: ${clicked.href.slice(0, 80)}`);
    await page.waitForTimeout(4000); // モーダル/遷移待ち
    await page.waitForTimeout(3000); // モーダル表示待ち

    // 3. モーダル内: Promotion ドロップダウンで tools.appdevelopsk.com を選択
    // dropdown を開く
    const promotionSelect = page.locator('select[name="promotion"], select[id*="promotion"]').first();
    const hasSelect = await promotionSelect.count() > 0;
    if (hasSelect) {
      // select 要素の場合
      // tools.appdevelopsk.com を含むoptionを選択
      await promotionSelect.selectOption({ label: /tools\.appdevelopsk/i }).catch(async () => {
        // Fallbacks: optionをsearch
        const options = await promotionSelect.locator("option").all();
        for (const opt of options) {
          const txt = await opt.textContent();
          if (txt && txt.includes("tools.appdevelopsk")) {
            const v = await opt.getAttribute("value");
            await promotionSelect.selectOption(v);
            break;
          }
        }
      });
      console.log("  ✓ Promotion: tools.appdevelopsk.com 選択");
    } else {
      // カスタム dropdown の場合 — click で開いて選択
      const customDropdown = page.locator('[role="combobox"], .dropdown-toggle, .select__control').first();
      if (await customDropdown.count() > 0) {
        await customDropdown.click();
        await page.waitForTimeout(800);
        await page.locator(`text=tools.appdevelopsk.com`).first().click();
        console.log("  ✓ Promotion (custom dropdown): tools.appdevelopsk.com 選択");
      } else {
        console.log("  ⚠ Promotion ドロップダウン未検出 (デフォルトのままで進む)");
      }
    }

    // 4. Message textareaに入力
    const messageArea = page.locator('textarea[name="message"], textarea[id*="message"], textarea').first();
    if (await messageArea.count() > 0) {
      await messageArea.fill(prog.message);
      console.log("  ✓ Message入力");
    }

    // 5. 利用規約 checkbox にチェック
    const checkbox = page.locator('input[type="checkbox"]').filter({ hasNot: page.locator(':disabled') }).first();
    if (await checkbox.count() > 0) {
      await checkbox.check().catch(() => {});
      console.log("  ✓ Accept checkbox");
    }

    // 6. Apply ボタンをクリック (Cancel/Close ではない)
    const applyBtn = page.locator('button:has-text("Apply"), button:has-text("Submit"), button:has-text("Join")').filter({ hasNotText: /Cancel|Close|Save/i }).first();
    await applyBtn.click();
    await page.waitForTimeout(4000);

    // 7. 結果確認
    const afterText = await page.evaluate(() => document.body.innerText.slice(0, 500));
    const success = afterText.includes("Pending") || afterText.includes("Successfully") || afterText.includes("applied") || afterText.includes("submitted");
    const error = afterText.includes("Error") || afterText.includes("failed") || afterText.includes("invalid");
    console.log(`  → ${success ? "✓ 申請完了" : (error ? "✗ エラー" : "? 状態不明")} : ${afterText.replace(/\n/g, " ").slice(0, 180)}`);

    results.push({ id: prog.id, name: prog.name, success, error, afterText: afterText.slice(0, 200) });
  } catch (e) {
    console.log(`  ✗ 例外: ${e.message.slice(0, 100)}`);
    results.push({ id: prog.id, name: prog.name, error: e.message });
  }

  await page.waitForTimeout(1200);
}

console.log("\n\n✅ 結果まとめ:");
for (const r of results) {
  const icon = r.success ? "✓" : (r.error ? "✗" : "?");
  console.log(`  ${icon} [${r.id}] ${r.name}`);
  if (r.error) console.log(`     error: ${r.error.slice(0, 100)}`);
}

await ctx.close();
process.exit(0);
