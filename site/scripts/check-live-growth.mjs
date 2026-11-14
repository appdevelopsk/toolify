import { hasNoindex, canonicalHref, hasSoftwareAnchor, hasAttributedSocialShare, isHealthySearchIndex, permitsPublicEmbedding } from "./growth-html-checks.mjs";
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
  return { status: response.status, text, url: response.url, contentType: response.headers.get("content-type") ?? "", xRobotsTag: response.headers.get("x-robots-tag") ?? "", xFrameOptions: response.headers.get("x-frame-options") ?? "", csp: response.headers.get("content-security-policy") ?? "" };
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
    if (expectedIndexed.includes(path) && hasNoindex(page.text, page.xRobotsTag)) {
      failures.push(`${path}: indexed core tool unexpectedly noindex`);
    }
    // Verify real user-clickable share destinations after production deployment.
    if (path === "/en/tools/json-formatter" || path === "/ja/tools/character-frequency") {
      for (const source of ["linkedin", "telegram"]) {
        if (!hasAttributedSocialShare(page.text, source, path, base.origin)) {
          failures.push(`${path}: missing or incorrect ${source} social share attribution`);
        }
      }
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
// Goal-first navigation now serves all 17 active languages. Check an RTL and
// Latin non-indexed locale on production without changing their SEO policy.
for (const [locale, heading] of [
  ["en", "Start with what you want to do"],
  ["ja", "目的からツールを探す"],
  ["es", "Empieza por lo que necesitas hacer"],
  ["ar", "ابدأ بما تريد إنجازه"],
]) {
  const path = `/${locale}`;
  try {
    const page = await get(path);
    if (page.status !== 200) failures.push(`${path}: HTTP ${page.status}`);
    // Limit matching to server-rendered heading, not translated RSC scripts.
    const visibleHtml = page.text.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
    if (!visibleHtml.includes(`id="goal-journeys-heading"`) || !visibleHtml.includes(heading)) {
      failures.push(`${path}: localized goal journey heading missing`);
    }
    console.log(`${page.status} ${path} (localized journeys)`);
  } catch (error) {
    failures.push(`${path}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Check post-tool cross-navigation in non-indexed languages as a user feature,
// without asserting or changing locale-specific indexability.
for (const [locale, nextLabel] of [
  ["es", "Siguiente herramienta: "],
  ["ar", "الأداة التالية: "],
  ["pt-BR", "Próxima ferramenta: "],
]) {
  const path = `/${locale}/tools/workdays-calculator`;
  try {
    const page = await get(path);
    if (page.status !== 200) failures.push(`${path}: HTTP ${page.status}`);
    const visibleHtml = page.text
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<!--[\s\S]*?-->/g, "");
    if (!visibleHtml.includes(nextLabel)) {
      failures.push(`${path}: translated next-step label missing`);
    }
    if (!visibleHtml.includes(`href="/${locale}/tools/date-calculator"`)) {
      failures.push(`${path}: next-tool link missing or wrong locale`);
    }
    console.log(`${page.status} ${path} (next step)`);
  } catch (error) {
    failures.push(`${path}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// A 200 HTML page is not enough: overseas visitors need the on-demand
// localized search index to actually find tools. Fail release verification
// if it is unavailable or silently returns an invalid/empty catalog.
for (const locale of ["en", "fr", "ar"]) {
  const path = `/${locale}/search-index.json`;
  try {
    const page = await get(path);
    if (page.status !== 200 || !page.contentType.includes("application/json")) {
      failures.push(`${path}: search index unavailable (HTTP ${page.status}, ${page.contentType})`);
      continue;
    }
    const data = JSON.parse(page.text);
    if (!isHealthySearchIndex(data, locale)) {
      failures.push(`${path}: malformed or incomplete localized search index`);
      continue;
    }
    console.log(`${page.status} ${path} (${data.tools.length} tools)`);
  } catch (error) {
    failures.push(`${path}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Publisher referrals depend on a real server-rendered discovery entry point.
// Verify all representative locales, not just the guide page itself.
for (const locale of ["en", "ja", "fr", "ar"]) {
  const path = `/${locale}`;
  try {
    const page = await get(path);
    if (page.status !== 200) {
      failures.push(`${path}: HTTP ${page.status} for publisher CTA`);
      continue;
    }
    if (!page.text.includes('id="publisher-embed"')) {
      failures.push(`${path}: publisher entry point missing from homepage`);
    }
    if (!page.text.includes(`href="/${locale}/embed-guide"`)) {
      failures.push(`${path}: localized publisher guide link missing`);
    }
    console.log(`${page.status} ${path} (publisher entry point)`);
  } catch (error) {
    failures.push(`${path}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Publisher acquisition contract: only the useful English/Japanese guide is
// index-eligible. Every other localized guide remains available to users but
// noindex (the site-wide locale pruning policy is unchanged).
for (const locale of ["en", "ja", "fr", "ar"]) {
  const guidePath = `/${locale}/embed-guide`;
  try {
    const page = await get(guidePath);
    if (page.status !== 200) failures.push(`${guidePath}: HTTP ${page.status}`);
    const expectedNoindex = locale !== "en" && locale !== "ja";
    if (hasNoindex(page.text, page.xRobotsTag) !== expectedNoindex) {
      failures.push(`${guidePath}: unexpected guide robots policy`);
    }
    const canonical = canonicalHref(page.text);
    if (canonical !== new URL(guidePath, base).toString()) {
      failures.push(`${guidePath}: unexpected canonical ${canonical ?? "(missing)"}`);
    }
    if (!page.text.includes(`/embed/${locale}/workdays-calculator`)) {
      failures.push(`${guidePath}: localized copy-ready widget path missing`);
    }
    console.log(`${page.status} ${guidePath} (publisher guide)`);
  } catch (error) {
    failures.push(`${guidePath}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// A visible iframe page is useless if nginx/Next send restrictive framing
// headers. Check both HTML and actual HTTP headers, not source configuration.
for (const locale of ["en", "fr", "ar"]) {
  const path = `/embed/${locale}/workdays-calculator`;
  try {
    const page = await get(path);
    if (page.status !== 200 || !page.contentType.includes("text/html")) {
      failures.push(`${path}: invalid widget response ${page.status} ${page.contentType}`);
      continue;
    }
    if (!hasNoindex(page.text, page.xRobotsTag)) failures.push(`${path}: iframe page must be noindex`);
    if (!permitsPublicEmbedding(page.xFrameOptions, page.csp)) {
      failures.push(`${path}: external iframe blocked or frame-ancestors policy missing`);
    }
    if (canonicalHref(page.text) !== new URL(`/${locale}/tools/workdays-calculator`, base).toString()) {
      failures.push(`${path}: widget does not canonicalize to localized tool`);
    }
    console.log(`${page.status} ${path} (external iframe headers)`);
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
