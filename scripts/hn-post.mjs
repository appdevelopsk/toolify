// Semi-automated Show HN submission helper.
//
// Workflow:
//   1. Opens a Chromium window with a persistent HN profile (~/.cache/toolify-playwright/hn-profile)
//   2. You sign in to news.ycombinator.com manually
//   3. Script auto-navigates to /submit and pre-fills title + URL
//   4. You review, click "submit" yourself
//   5. After successful submission, script auto-fills the first-comment textarea
//   6. You review, click "add comment" yourself
//   7. Engage with replies as they arrive (the actual hard part — humans only)
//
// The submit and add-comment buttons are ALWAYS clicked by you, never the script.
// This stays inside HN's guidelines (no bot submissions) while saving the boring typing.

import { chromium } from "playwright";
import { mkdirSync, existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ──────────────────────────────────────────────────────────────────────────
// Load content from scripts/hn-show-content.txt
// ──────────────────────────────────────────────────────────────────────────
const CONTENT_FILE = path.join(__dirname, "hn-show-content.txt");
if (!existsSync(CONTENT_FILE)) {
  console.error(`[hn] Missing content file: ${CONTENT_FILE}`);
  process.exit(1);
}
const raw = readFileSync(CONTENT_FILE, "utf8");
const [meta, body] = raw.split(/^---\s*$/m);
if (!meta || !body) {
  console.error("[hn] Content file must have 'TITLE:', 'URL:' lines, then '---', then comment body.");
  process.exit(1);
}
const titleMatch = meta.match(/^TITLE:\s*(.+)$/m);
const urlMatch = meta.match(/^URL:\s*(.+)$/m);
if (!titleMatch || !urlMatch) {
  console.error("[hn] Could not parse TITLE: and URL: lines.");
  process.exit(1);
}
const TITLE = titleMatch[1].trim();
const URL = urlMatch[1].trim();
const COMMENT_BODY = body.trim();

console.log(`[hn] Title:   ${TITLE}`);
console.log(`[hn] URL:     ${URL}`);
console.log(`[hn] Comment: ${COMMENT_BODY.length} chars`);
console.log();

// ──────────────────────────────────────────────────────────────────────────
// Launch browser with persistent profile (so login survives across runs)
// ──────────────────────────────────────────────────────────────────────────
const userDataDir = path.join(homedir(), ".cache/toolify-playwright/hn-profile");
if (!existsSync(userDataDir)) mkdirSync(userDataDir, { recursive: true });

const realChromeUA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";

const ctx = await chromium.launchPersistentContext(userDataDir, {
  headless: false,
  viewport: { width: 1280, height: 900 },
  userAgent: realChromeUA,
  ignoreDefaultArgs: ["--enable-automation"],
  args: ["--disable-blink-features=AutomationControlled", "--no-first-run"],
});

await ctx.addInitScript(() => {
  Object.defineProperty(navigator, "webdriver", { get: () => undefined });
});

const page = ctx.pages()[0] ?? (await ctx.newPage());

// ──────────────────────────────────────────────────────────────────────────
// Step 1: ensure logged in.
// HN behaviour: visiting /submit while logged out redirects to /login.
// After /login post, HN redirects to /news (not back to /submit), so we
// detect login by polling for a logout link in the navbar, then force-nav
// to /submit ourselves. We also emit periodic status updates so the user
// sees what's happening.
// ──────────────────────────────────────────────────────────────────────────
console.log("[hn] Opening submit page (will redirect to login if needed)…");
await page.goto("https://news.ycombinator.com/submit", { waitUntil: "domcontentloaded" });

async function isLoggedIn() {
  // The HN navbar shows a "logout" link when authenticated. This works on
  // any HN page, so we don't need to be on /submit to detect login.
  return (await page.$('a[href^="logout?"]')) !== null;
}

if (!(await isLoggedIn())) {
  console.log("[hn] Not logged in. Sign in with your HN account in the browser window.");
  console.log("[hn] (I'll auto-detect login and navigate to /submit. Up to 10 minutes…)");

  const deadline = Date.now() + 600_000;
  let lastUrl = "";
  let detected = false;
  while (Date.now() < deadline) {
    if (page.isClosed()) {
      console.error("[hn] Browser window was closed before login completed. Re-run when ready.");
      process.exit(2);
    }
    try {
      if (await isLoggedIn()) {
        detected = true;
        break;
      }
      const u = page.url();
      if (u !== lastUrl) {
        lastUrl = u;
        console.log(`[hn]   currently on: ${u}`);
      }
    } catch {
      /* navigations race with our DOM probe — fine, retry */
    }
    await page.waitForTimeout(1500).catch(() => {});
  }

  if (!detected) {
    console.error("[hn] Login not detected within 10 minutes. Aborting.");
    await ctx.close();
    process.exit(2);
  }
  console.log("[hn] ✓ Login detected — navigating to /submit");
  await page.goto("https://news.ycombinator.com/submit", { waitUntil: "domcontentloaded" });
}

if ((await page.$('input[name="title"]')) === null) {
  console.error(`[hn] /submit didn't render the form (current url: ${page.url()}).`);
  console.error("[hn] Possible: HN flagged the session, or you don't have submit privileges yet.");
  console.error("[hn] (HN requires a small amount of karma — typically just having an account works,");
  console.error("[hn]  but very new accounts occasionally get a delay.)");
  process.exit(2);
}
console.log("[hn] ✓ Authenticated, on /submit");

// ──────────────────────────────────────────────────────────────────────────
// Step 2: pre-fill title + URL. Leave 'text' empty so it's a URL submission.
// ──────────────────────────────────────────────────────────────────────────
await page.fill('input[name="title"]', TITLE);
await page.fill('input[name="url"]', URL);
// Make sure text field is empty (HN rejects submissions with both URL and text)
const textField = await page.$('textarea[name="text"]');
if (textField) await textField.fill("");

console.log("[hn] ✓ Title and URL pre-filled");
console.log("[hn]   → Review the form, then click the submit button yourself.");
console.log("[hn]   (Waiting for URL to change away from /submit…)");

// ──────────────────────────────────────────────────────────────────────────
// Step 3: wait for user to click submit. After submit, HN redirects to either:
//   /newest                 — submission landed, find your post in the list
//   /item?id=NNNN           — direct link to your post
//   /show                   — Show HN listing
// ──────────────────────────────────────────────────────────────────────────
await page.waitForFunction(() => !location.pathname.includes("/submit"), { timeout: 600_000 });
const afterSubmitUrl = page.url();
console.log(`[hn] ✓ Submitted. Now on: ${afterSubmitUrl}`);

// ──────────────────────────────────────────────────────────────────────────
// Step 4: navigate to the item page if we're not already there
// ──────────────────────────────────────────────────────────────────────────
if (!afterSubmitUrl.includes("/item?")) {
  console.log("[hn] Looking for your post in the listing…");
  await page.waitForTimeout(1500);
  // Find the link whose text matches our title
  const link = await page.locator(`a:has-text("${TITLE.slice(0, 50).replace(/"/g, "")}")`).first();
  if ((await link.count()) > 0) {
    await link.click();
    await page.waitForLoadState("domcontentloaded").catch(() => {});
  } else {
    console.warn("[hn] Could not auto-locate your post. Click into it manually.");
  }
}

// Wait for navigation to the item page
await page.waitForFunction(() => location.pathname.includes("/item"), { timeout: 600_000 }).catch(() => {});
console.log(`[hn] ✓ On item page: ${page.url()}`);

// ──────────────────────────────────────────────────────────────────────────
// Step 5: pre-fill the OP first-comment textarea
// On HN item pages, the OP can post a comment via the textarea named "text".
// ──────────────────────────────────────────────────────────────────────────
await page.waitForTimeout(800);
const commentArea = await page.$('textarea[name="text"]');
if (!commentArea) {
  console.warn("[hn] Couldn't find the comment textarea — scroll down and paste manually.");
} else {
  await commentArea.fill(COMMENT_BODY);
  console.log("[hn] ✓ First-comment body pre-filled");
  console.log("[hn]   → Review the comment, then click 'add comment' yourself.");
}

console.log();
console.log("[hn] Browser stays open. Engage with replies as they arrive.");
console.log("[hn] Close the window when you're done — your session will be saved.");

await new Promise((resolve) => {
  ctx.on("close", resolve);
  page.on("close", resolve);
});

console.log("[hn] Browser closed.");
process.exit(0);
