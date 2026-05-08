import { chromium } from "playwright";
import { mkdirSync, existsSync, writeFileSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";

const userDataDir = path.join(homedir(), ".cache/toolify-playwright/bwt-profile");
const outDir = path.join(process.cwd(), "scripts/bwt-output");
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

// Recover the dashboard URL from the previous capture (contains tid= tenant id)
let dashboardUrl = "https://www.bing.com/webmasters/home";
try {
  const html = readFileSync(path.join(outDir, "dashboard.html"), "utf-8");
  // Find tid query param
  const m = html.match(/tid=([0-9a-f-]{36})/);
  if (m) dashboardUrl = `https://www.bing.com/webmasters?tid=${m[1]}`;
} catch {}
console.log("[submit] Using dashboard URL: " + dashboardUrl);

const realChromeUA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";

const ctx = await chromium.launchPersistentContext(userDataDir, {
  headless: false,
  viewport: { width: 1440, height: 1000 },
  userAgent: realChromeUA,
  ignoreDefaultArgs: ["--enable-automation"],
  args: ["--disable-blink-features=AutomationControlled", "--no-first-run"],
});

await ctx.addInitScript(() => {
  Object.defineProperty(navigator, "webdriver", { get: () => undefined });
});

const page = ctx.pages()[0] ?? (await ctx.newPage());

// 1. Land on dashboard with tid (preserves session)
console.log("[submit] 1) Navigating to dashboard with tid…");
await page.goto(dashboardUrl, { waitUntil: "domcontentloaded" });
await page.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => {});
await page.waitForTimeout(3000);

let url = page.url();
console.log("[submit]    URL: " + url);

if (url.includes("/about") || url.includes("/login") || url.includes("/get-started")) {
  console.error("[submit] ✗ Session expired. Re-run scripts/bwt-login.mjs.");
  await page.screenshot({ path: path.join(outDir, "submit-fail.png"), fullPage: true });
  await ctx.close();
  process.exit(2);
}

console.log("[submit] ✓ Authenticated dashboard loaded");
await page.screenshot({ path: path.join(outDir, "submit-step1-dashboard.png"), fullPage: true });

// 2. Find and click the Sitemaps link in the sidebar
console.log("[submit] 2) Looking for Sitemaps nav link…");
const sitemapsLink = await page.locator('a:has-text("Sitemaps"), [aria-label*="Sitemaps"], nav a[href*="sitemap"]').first();
if (await sitemapsLink.count() > 0) {
  await sitemapsLink.click();
  await page.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(2000);
  console.log("[submit]    Now at: " + page.url());
} else {
  console.log("[submit]    No 'Sitemaps' link found via standard selectors. Trying URL with tid…");
  const tidMatch = page.url().match(/tid=([0-9a-f-]+)/);
  const tid = tidMatch ? tidMatch[1] : "";
  await page.goto(`https://www.bing.com/webmasters/sitemaps${tid ? "?tid=" + tid : ""}`, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(2000);
}

await page.screenshot({ path: path.join(outDir, "submit-step2-sitemaps.png"), fullPage: true });

// 3. Look for Submit Sitemap button
console.log("[submit] 3) Looking for Submit Sitemap button…");
const submitBtnSelectors = [
  'button:has-text("Submit sitemap")',
  'button:has-text("Submit Sitemap")',
  'button:has-text("Submit")',
  '[aria-label*="Submit sitemap"]',
  'button[data-testid*="submit"]',
];

let opened = false;
for (const sel of submitBtnSelectors) {
  const el = page.locator(sel).first();
  if (await el.count() > 0 && await el.isVisible().catch(() => false)) {
    console.log("[submit]    Clicking: " + sel);
    await el.click();
    opened = true;
    break;
  }
}

if (!opened) {
  console.log("[submit] ✗ No Submit Sitemap button found. Logging visible buttons…");
  const buttons = await page.$$eval("button", (els) => els.map((e) => e.textContent?.trim()).filter(Boolean));
  console.log("[submit]    Buttons: " + JSON.stringify(buttons.slice(0, 30)));
  await ctx.close();
  process.exit(3);
}

await page.waitForTimeout(2000);
await page.screenshot({ path: path.join(outDir, "submit-step3-dialog.png"), fullPage: true });

// 4. Fill the input with sitemap URL
console.log("[submit] 4) Filling sitemap URL…");
const sitemapUrl = "https://tools.appdevelopsk.com/sitemap.xml";
const inputSelectors = ['input[type="url"]', 'input[type="text"]', 'input[placeholder*="sitemap"]', 'input[placeholder*="URL"]'];
let filled = false;
for (const sel of inputSelectors) {
  const inp = page.locator(sel).first();
  if (await inp.count() > 0 && await inp.isVisible().catch(() => false)) {
    await inp.fill(sitemapUrl);
    filled = true;
    console.log("[submit]    Filled: " + sitemapUrl);
    break;
  }
}

if (!filled) {
  console.log("[submit] ✗ No URL input found.");
  await ctx.close();
  process.exit(4);
}

await page.waitForTimeout(1000);
await page.screenshot({ path: path.join(outDir, "submit-step4-filled.png"), fullPage: true });

// 5. Click submit/confirm
console.log("[submit] 5) Confirming submit…");
const confirmSelectors = [
  'button:has-text("Submit")',
  'button:has-text("送信")',
  'button[type="submit"]',
  '[role="dialog"] button:not([aria-label*="Close"]):not([aria-label*="Cancel"])',
];
let confirmed = false;
for (const sel of confirmSelectors) {
  const all = page.locator(sel);
  const count = await all.count();
  for (let i = 0; i < count; i++) {
    const el = all.nth(i);
    const text = (await el.textContent().catch(() => ""))?.trim().toLowerCase() || "";
    const visible = await el.isVisible().catch(() => false);
    if (visible && (text.includes("submit") || text.includes("送信"))) {
      console.log("[submit]    Clicking: " + sel + " [\"" + text + "\"]");
      await el.click();
      confirmed = true;
      break;
    }
  }
  if (confirmed) break;
}

await page.waitForTimeout(4000);
await page.screenshot({ path: path.join(outDir, "submit-step5-after.png"), fullPage: true });

console.log("\n=== Summary ===");
console.log("Final URL: " + page.url());
console.log("Confirmed: " + confirmed);

const finalText = await page.evaluate(() => document.body.innerText.slice(0, 1000));
console.log("Page text excerpt:\n" + finalText.slice(0, 600));

await page.waitForTimeout(5000);
await ctx.close();
console.log("\n[submit] Done. Screenshots in " + outDir);
