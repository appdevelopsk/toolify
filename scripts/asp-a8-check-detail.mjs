/**
 * A8.net — プログラム詳細ページの構造確認
 * node scripts/asp-a8-check-detail.mjs
 */
import { chromium } from "playwright";
import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadCreds } from "./asp-creds.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const userDataDir = path.join(homedir(), ".cache/toolify-playwright/a8-profile");
const outDir = path.join(__dirname, "asp-output");
const CREDS = loadCreds("a8");

const ctx = await chromium.launchPersistentContext(userDataDir, {
  headless: false,
  viewport: { width: 1280, height: 900 },
  userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
  ignoreDefaultArgs: ["--enable-automation"],
  args: ["--disable-blink-features=AutomationControlled", "--no-first-run"],
});
await ctx.addInitScript(() => { Object.defineProperty(navigator, "webdriver", { get: () => undefined }); });
const page = ctx.pages()[0] ?? (await ctx.newPage());

// Login
await page.goto("https://www.a8.net/", { waitUntil: "domcontentloaded", timeout: 30000 });
await page.waitForTimeout(2000);
const li = page.locator('input[name="login"]').first();
if (await li.count() > 0) {
  await li.fill(CREDS.username);
  await page.locator('input[name="passwd"]').first().fill(CREDS.password);
  await page.locator('input[name="login_as_btn"]').first().click();
  await page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(2000);
}
console.log("Login:", page.url());

// Check ConoHa WING detail (confirmed correct)
await page.goto(
  "https://pub.a8.net/a8v2/media/joinPrograms/detail.do?action=confirmSearch&insIds=s00000000018035&searchFlg=1&viewType=0",
  { waitUntil: "domcontentloaded", timeout: 20000 }
);
await page.waitForTimeout(3000);
console.log("URL:", page.url());
writeFileSync(outDir + "/a8-conoha-detail.html", await page.content(), "utf-8");
console.log("Saved a8-conoha-detail.html");

const allBtns = await page.evaluate(() =>
  Array.from(document.querySelectorAll("a, button, input[type=submit], input[type=button]")).map(el => ({
    text: (el.textContent?.trim() || el.value || "").replace(/\s+/g, " ").slice(0, 60),
    href: el.href || "",
    onclick: el.getAttribute("onclick") || "",
    cls: el.className || "",
  })).filter(b => b.text.length > 1)
);
console.log("\nAll buttons (first 30):");
allBtns.slice(0, 30).forEach((b, i) => console.log(`  [${i}] "${b.text}" cls="${b.cls}" href="${b.href.slice(0, 60)}" onclick="${b.onclick.slice(0, 60)}"`));

// Also check the page text for keywords
const pageText = await page.evaluate(() => document.body.innerText);
const lines = pageText.split("\n").filter(l => l.trim().length > 2);
console.log("\nPage lines (first 40):");
lines.slice(0, 40).forEach((l, i) => console.log(`  ${i}: ${l.trim()}`));

// Check all links with "join" or "apply" or "申請" in href or text
const applyLinks = await page.evaluate(() =>
  Array.from(document.querySelectorAll("a")).map(a => ({
    text: a.textContent?.trim().slice(0, 60),
    href: a.href,
  })).filter(l =>
    l.href.includes("join") || l.href.includes("apply") ||
    l.text.includes("申請") || l.text.includes("参加") || l.text.includes("提携")
  )
);
console.log("\nApply-related links:", JSON.stringify(applyLinks, null, 2));

console.log("\n終了するには Ctrl+C");
await new Promise(() => {});
