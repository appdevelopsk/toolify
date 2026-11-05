import { hasNoindex, canonicalHref, hasSoftwareAnchor } from "./growth-html-checks.mjs";
/**
 * Read-only production smoke check for growth funnel rollout.
 * Usage: SITE_URL=https://toolify365.com node scripts/check-live-growth.mjs
 * Does not request indexing or modify external systems.
 */
const origin = process.env.SITE_URL || "https://toolify365.com";
const base = new URL(origin);
if (base.protocol !== "https:" && base.hostname !== "localhost") {
  throw Error("SITE_URL must be HTTPS (except localhost)");
}
const paths = [
  "/en/tools/character-frequency",
  "/ja/tools/character-frequency",
  "/en/tools/reverse-text-generator",
  "/en/tools/json-formatter",
  "/en/tools/csv-json-converter",
  "/en/software/text-batch-studio",
  "/en/software/json-studio",
  "/en/software/csv-cleaner-pro",
];
const ctas = new Map([
  ["/en/tools/character-frequency", "text-batch-studio"],
  ["/ja/tools/character-frequency", "text-batch-studio"],
  ["/en/tools/reverse-text-generator", "text-batch-studio"],
  ["/en/tools/json-formatter", "json-studio"],
  ["/en/tools/csv-json-converter", "csv-cleaner-pro"],
]);
const failures = [];
const expectedIndexed = [
  "/en/tools/character-frequency",
  "/ja/tools/character-frequency",
  "/en/tools/reverse-text-generator",
];
async function get(path) {
  const url = new URL(path, base);
  const response = await fetch(url, {
    redirect: "follow",
    headers: { "User-Agent": "Toolify365-growth-smoke/1.0" },
    signal: AbortSignal.timeout(12000),
  });
  const text = await response.text();
  return { status: response.status, text, url: response.url, contentType: response.headers.get("content-type") ?? "" };
}
for (const path of paths) {
  try {
    const page = await get(path);
    if (page.status !== 200) failures.push(`${path}: HTTP ${page.status}`);
    const finalUrl = new URL(page.url);
    if (finalUrl.origin !== base.origin || finalUrl.pathname.replace(/[/]$/, "") !== path) {
      failures.push(`${path}: unexpected redirect to ${page.url}`);
    }
    if (!page.contentType.includes("text/html")) failures.push(`${path}: not HTML (${page.contentType})`);
    const product = ctas.get(path);
    if (product && !hasSoftwareAnchor(page.text, product, path.split("/")[1], base.origin)) {
      failures.push(`${path}: expected software CTA missing (${product})`);
    }
    if (expectedIndexed.includes(path) && hasNoindex(page.text)) {
      failures.push(`${path}: indexed core tool unexpectedly noindex`);
    }
    if (path.includes("/tools/")) {
      const canonicalValue = canonicalHref(page.text);
      if (!canonicalValue) {
        failures.push(`${path}: canonical link missing`);
      } else {
        try {
          const canonical = new URL(canonicalValue, base);
          if (canonical.origin !== base.origin || canonical.pathname.replace(/[/]$/, "") !== path) {
            failures.push(`${path}: unexpected canonical ${canonical.href}`);
          }
        } catch { failures.push(`${path}: malformed canonical`); }
      }
    }
    console.log(`${page.status} ${path}`);
  } catch (error) {
    failures.push(`${path}: ${error instanceof Error ? error.message : String(error)}`);
  }
}
for (const path of ["/robots.txt", "/sitemap.xml"]) {
  try {
    const page = await get(path);
    if (page.status !== 200) failures.push(`${path}: HTTP ${page.status}`);
    if (path === "/robots.txt" && !page.text.includes("Sitemap:")) failures.push("robots.txt: missing sitemap reference");
    if (path === "/sitemap.xml") {
      if (!page.text.includes("<loc>")) failures.push("sitemap.xml: no URL locations");
      for (const target of expectedIndexed) {
        if (!page.text.includes(`${base.origin}${target}`)) failures.push(`sitemap.xml: expected indexed tool missing (${target})`);
      }
    }
    console.log(`${page.status} ${path}`);
  } catch (error) {
    failures.push(`${path}: ${error instanceof Error ? error.message : String(error)}`);
  }
}
if (failures.length) {
  console.error("\nLive growth smoke FAILED:");
  failures.forEach((failure) => console.error("- " + failure));
  process.exitCode = 1;
} else {
  console.log("\nLive growth smoke OK: expected routes and CTA targets detected.");
}
