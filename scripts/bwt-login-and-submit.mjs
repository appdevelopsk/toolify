import { chromium } from "playwright";
import { mkdirSync, existsSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";

const userDataDir = path.join(homedir(), ".cache/toolify-playwright/bwt-profile");
if (!existsSync(userDataDir)) mkdirSync(userDataDir, { recursive: true });
const outDir = path.join(process.cwd(), "scripts/bwt-output");
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

const realChromeUA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";

const ctx = await chromium.launchPersistentContext(userDataDir, {
  headless: false,
  viewport: { width: 1440, height: 1000 },
  userAgent: realChromeUA,
  ignoreDefaultArgs: ["--enable-automation", "--use-mock-keychain"],
  args: ["--disable-blink-features=AutomationControlled", "--no-first-run", "--password-store=basic"],
});

await ctx.addInitScript(() => {
  Object.defineProperty(navigator, "webdriver", { get: () => undefined });
  Object.defineProperty(navigator, "plugins", { get: () => [1, 2, 3, 4, 5] });
  Object.defineProperty(navigator, "languages", { get: () => ["ja-JP", "ja", "en-US", "en"] });
});

const page = ctx.pages()[0] ?? (await ctx.newPage());
await page.goto("https://www.bing.com/webmasters/", { waitUntil: "domcontentloaded" });

console.log("[playwright] Sign in (Microsoft direct, NOT GSC import).");
console.log("[playwright] After dashboard loads, I'll auto-submit sitemap. Don't close manually.");

// Wait for the dashboard URL (signed in)
const isAuthedUrl = (u) =>
  u && u.includes("bing.com/webmasters") && !u.includes("/about") && !u.includes("/get-started") && !u.includes("/sso") && !u.includes("/login");

console.log("[playwright] Polling for dashboard…");
for (let i = 0; i < 600; i++) {
  // up to 30 minutes
  if (isAuthedUrl(page.url())) break;
  await page.waitForTimeout(3000);
}

if (!isAuthedUrl(page.url())) {
  console.error("[playwright] ✗ Dashboard not reached within timeout.");
  await ctx.close();
  process.exit(1);
}

console.log("[playwright] ✓ Dashboard detected: " + page.url());
await page.waitForTimeout(3000);
await page.screenshot({ path: path.join(outDir, "step1-dashboard.png"), fullPage: true });

// Capture tid for later URL building (same session)
const tidMatch = page.url().match(/tid=([0-9a-f-]+)/);
const tid = tidMatch ? tidMatch[1] : "";
console.log("[playwright] Tenant ID: " + (tid || "(none)"));

// Navigate to Sitemaps via direct URL with tid
const sitemapsUrl = `https://www.bing.com/webmasters/sitemaps${tid ? "?tid=" + tid : ""}`;
console.log("[playwright] Going to: " + sitemapsUrl);
await page.goto(sitemapsUrl, { waitUntil: "domcontentloaded" });
await page.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => {});
await page.waitForTimeout(3000);

if (page.url().includes("/about")) {
  console.error("[playwright] ✗ Sitemaps page redirected to /about (auth issue).");
  await page.screenshot({ path: path.join(outDir, "step2-fail.png"), fullPage: true });
  await ctx.close();
  process.exit(2);
}

await page.screenshot({ path: path.join(outDir, "step2-sitemaps.png"), fullPage: true });
console.log("[playwright] At Sitemaps: " + page.url());

// Look for Submit button
const submitBtnSelectors = [
  'button:has-text("Submit sitemap")',
  'button:has-text("Submit Sitemap")',
  '[aria-label*="Submit sitemap"]',
  'button:has-text("送信")',
];

let opened = false;
for (const sel of submitBtnSelectors) {
  const el = page.locator(sel).first();
  const count = await el.count();
  if (count > 0 && (await el.isVisible().catch(() => false))) {
    console.log("[playwright] Click: " + sel);
    await el.click();
    opened = true;
    break;
  }
}

if (!opened) {
  console.log("[playwright] No Submit button found. Visible buttons:");
  const btns = await page.$$eval("button", (els) => els.map((e) => (e.textContent || "").trim()).filter((t) => t && t.length < 60));
  console.log(JSON.stringify(btns.slice(0, 30), null, 2));
  await ctx.close();
  process.exit(3);
}

await page.waitForTimeout(2000);
await page.screenshot({ path: path.join(outDir, "step3-dialog.png"), fullPage: true });

// Fill input
const sitemapUrl = "https://tools.appdevelopsk.com/sitemap.xml";
const inputSelectors = ['input[type="url"]', 'input[type="text"]:not([disabled])'];
let filled = false;
for (const sel of inputSelectors) {
  const all = page.locator(sel);
  const count = await all.count();
  for (let i = 0; i < count; i++) {
    const el = all.nth(i);
    if (await el.isVisible().catch(() => false)) {
      await el.fill(sitemapUrl);
      filled = true;
      break;
    }
  }
  if (filled) break;
}

if (!filled) {
  console.log("[playwright] No input found.");
  await ctx.close();
  process.exit(4);
}

console.log("[playwright] Filled: " + sitemapUrl);
await page.waitForTimeout(1000);
await page.screenshot({ path: path.join(outDir, "step4-filled.png"), fullPage: true });

// Click confirm submit
const confirmBtn = page.locator('[role="dialog"] button:has-text("Submit"), [role="dialog"] button:has-text("送信"), button:has-text("Submit")').last();
await confirmBtn.click();
console.log("[playwright] Submit clicked.");
await page.waitForTimeout(4000);
await page.screenshot({ path: path.join(outDir, "step5-after.png"), fullPage: true });

const finalText = await page.evaluate(() => document.body.innerText.slice(0, 800));
writeFileSync(path.join(outDir, "step5-text.txt"), finalText);
console.log("\n=== After submit ===");
console.log(finalText.slice(0, 500));

await page.waitForTimeout(5000);
await ctx.close();
console.log("\n[playwright] Done. Screenshots in scripts/bwt-output/");
