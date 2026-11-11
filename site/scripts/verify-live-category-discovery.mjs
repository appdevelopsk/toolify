import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

/**
 * Public-HTML guard for category discovery. This verifies the actual SSR page,
 * not a source-only claim or a 200 response from a stale release.
 * Never sends analytics or any user data.
 */
export function inspectCategoryHtml(html, locale) {
  if (locale !== "en" && locale !== "ja") throw new Error("Unsupported locale");
  const links = [...html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/gi)].map((match) => match[1]);
  const workdays = links.indexOf(`/${locale}/tools/workdays-calculator`);
  const stopwatch = links.indexOf(`/${locale}/tools/stopwatch`);
  if (workdays < 0 || stopwatch < 0 || workdays >= stopwatch) {
    throw new Error(`${locale}: demand-ranked workdays link must precede supplementary stopwatch`);
  }
  const label = locale === "ja" ? "日付・時刻" : "Date & Time";
  if (!html.includes(label)) throw new Error(`${locale}: localized category name missing`);
  // Category BreadcrumbList is rendered through a native SSR JSON-LD script.
  if (!html.includes(`"name":"${label}"`)) {
    throw new Error(`${locale}: localized BreadcrumbList category label missing`);
  }
  if (locale === "ja" && !html.includes("ヒント：")) {
    throw new Error("ja: Japanese category tip label missing");
  }
  // The global footer appears on every page. Do not regress to English
  // category navigation on Japanese pages.
  const footer = html.match(/<footer\b[\s\S]*?<\/footer>/i)?.[0] ?? "";
  const footerLabel = locale === "ja" ? "健康・フィットネス" : "Health & Fitness";
  if (!footer.includes(footerLabel)) {
    throw new Error(`${locale}: global footer category links not localized`);
  }
}

async function main() {
  const sha = process.env.GITHUB_SHA;
  if (!sha || !/^[a-f0-9]{40}$/.test(sha)) throw new Error("GITHUB_SHA is required");
  for (const locale of ["en", "ja"]) {
    const url = `https://toolify365.com/${locale}/tools/category/datetime?category_verify=${sha}`;
    const response = await fetch(url, {
      headers: { "Cache-Control": "no-cache" },
      signal: AbortSignal.timeout(25000),
    });
    if (!response.ok) throw new Error(`${locale} category HTTP ${response.status}`);
    const html = await response.text();
    inspectCategoryHtml(html, locale);
    console.log(`✓ ${locale}: category priority, localized labels, BreadcrumbList verified`);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch((err) => { console.error(err); process.exitCode = 1; });
}
