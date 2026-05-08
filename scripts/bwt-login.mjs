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
  viewport: { width: 1280, height: 900 },
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

console.log("[playwright] Browser opened. Sign in (Microsoft direct, NOT GSC import).");
console.log("[playwright] Once on the dashboard (/webmasters/home or /webmasters/dashboard), I'll auto-capture state.");
console.log("[playwright] Polling URL every 2 s…");

let captured = false;
const isAuthedUrl = (u) =>
  u &&
  u.includes("bing.com/webmasters") &&
  !u.includes("/about") &&
  !u.includes("/get-started") &&
  !u.includes("/sso") &&
  !u.includes("/login");

const pollInterval = setInterval(async () => {
  if (captured) return;
  try {
    const u = page.url();
    if (isAuthedUrl(u)) {
      captured = true;
      clearInterval(pollInterval);
      console.log("[playwright] Detected dashboard URL: " + u);
      console.log("[playwright] Capturing state in 3 s (let UI settle)…");
      await page.waitForTimeout(3000);

      try {
        await page.screenshot({ path: path.join(outDir, "dashboard.png"), fullPage: true });
        const html = await page.content();
        writeFileSync(path.join(outDir, "dashboard.html"), html);
        const text = await page.evaluate(() => document.body.innerText || "");
        writeFileSync(path.join(outDir, "dashboard.txt"), text);

        // Extract domain mentions
        const domains = [...new Set(
          [...text.matchAll(/(?:https?:\/\/)?((?:[a-z0-9-]+\.)*appdevelopsk\.com)/gi)].map((m) => m[1])
        )];
        // Extract any verification status hints
        const verifiedHints = text.match(/(verified|unverified|pending|verification|認証|未認証)/gi) || [];

        console.log("\n=== Dashboard captured ===");
        console.log("URL:               " + u);
        console.log("Domains found:     " + (domains.length ? domains.join(", ") : "(none)"));
        console.log("Verification hints:" + (verifiedHints.length ? " " + [...new Set(verifiedHints)].slice(0, 8).join(", ") : " (none)"));
        console.log("Screenshot:        " + path.join(outDir, "dashboard.png"));
        console.log("\n[playwright] You can close the window now — session is saved.");
      } catch (err) {
        console.error("[playwright] Capture error: " + err.message);
      }
    }
  } catch (err) {
    /* page may be navigating */
  }
}, 2000);

await new Promise((resolve) => {
  ctx.on("close", resolve);
  page.on("close", resolve);
});

clearInterval(pollInterval);
console.log("[playwright] Browser closed.");
process.exit(0);
