import { chromium } from "playwright";
import { mkdirSync, existsSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";

const userDataDir = path.join(homedir(), ".cache/toolify-playwright/bwt-profile");
if (!existsSync(userDataDir)) {
  console.error("[check] Profile not found. Run scripts/bwt-login.mjs first.");
  process.exit(1);
}

const realChromeUA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";

const ctx = await chromium.launchPersistentContext(userDataDir, {
  headless: true,
  viewport: { width: 1440, height: 1000 },
  userAgent: realChromeUA,
  ignoreDefaultArgs: ["--enable-automation"],
  args: ["--disable-blink-features=AutomationControlled"],
});

await ctx.addInitScript(() => {
  Object.defineProperty(navigator, "webdriver", { get: () => undefined });
});

const outDir = path.join(process.cwd(), "scripts/bwt-output");
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

const page = await ctx.newPage();

console.log("[check] Loading BWT dashboard…");
const resp = await page.goto("https://www.bing.com/webmasters/home", { waitUntil: "networkidle", timeout: 60000 });
console.log("[check] HTTP " + resp?.status() + " | URL: " + page.url());

await page.waitForTimeout(3000);

const screenshotPath = path.join(outDir, "dashboard.png");
await page.screenshot({ path: screenshotPath, fullPage: true });
console.log("[check] Screenshot saved: " + screenshotPath);

const html = await page.content();
writeFileSync(path.join(outDir, "dashboard.html"), html);
console.log("[check] HTML saved: " + outDir + "/dashboard.html");

// Extract any visible text mentioning the user's domain
const visibleText = await page.evaluate(() => document.body.innerText || "");
writeFileSync(path.join(outDir, "dashboard.txt"), visibleText);

// Find references to our domains
const sites = [];
const re = /(?:https?:\/\/)?((?:[a-z0-9-]+\.)*appdevelopsk\.com)/gi;
let m;
while ((m = re.exec(visibleText)) !== null) sites.push(m[1]);
const uniqueSites = [...new Set(sites)];

// Check if URL changed (auth check)
const currentUrl = page.url();
const onLoginPage = currentUrl.includes("login.live.com") || currentUrl.includes("login.microsoftonline.com");

console.log("\n=== Findings ===");
console.log("Final URL:    " + currentUrl);
console.log("On login page? " + onLoginPage);
console.log("Domains in dashboard: " + (uniqueSites.length ? uniqueSites.join(", ") : "(none found)"));

await ctx.close();
console.log("\n[check] Done. Inspect: " + outDir);
