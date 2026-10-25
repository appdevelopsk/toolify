/**
 * Read-only diagnosis of deliberately indexable tool/locale URLs.
 * Does NOT call Google APIs, submit sitemaps, or change SEO directives.
 * Usage: npm run audit:index-policy [-- --json] [-- --urls]
 *
 * These are *intended* robots/index candidates, never actual Google coverage.
 */
import { LOCALES, INDEXED_LOCALES } from "../src/lib/i18n/locales";
import { listTools, INDEXED_SLUGS, INDEX_EXCEPTIONS, isIndexableIn, indexableLocalesFor } from "../src/lib/tools/registry";

function inspect() {
  const tools = listTools();
  const all = tools.flatMap(tool => LOCALES.map(locale => ({
    url: `https://toolify365.com/${locale}/tools/${tool.slug}`,
    slug: tool.slug,
    locale,
    intendedIndex: isIndexableIn(locale, tool.slug)
  })));
  const allowed = all.filter(row => row.intendedIndex);
  const byLocale = Object.fromEntries(LOCALES.map(l => [l, {
    toolPages: tools.length,
    intendedIndex: allowed.filter(x => x.locale === l).length,
    intentionallyNoindex: tools.length - allowed.filter(x => x.locale === l).length
  }]));
  const invalid = [];
  const slugs = tools.map(t=>t.slug);
  if (new Set(slugs).size !== slugs.length) invalid.push("Duplicate tool slug");
  for (const slug of INDEXED_SLUGS) if (!slugs.includes(slug)) invalid.push("Core slug absent from registry: "+slug);
  for (const [locale, exceptions] of Object.entries(INDEX_EXCEPTIONS)) {
    if (!LOCALES.includes(locale as (typeof LOCALES)[number])) invalid.push("Unknown exception locale: "+locale);
    for(const slug of exceptions) if(!slugs.includes(slug)) invalid.push("Unknown exception tool: "+locale+"/"+slug);
    if(new Set(exceptions).size !== exceptions.length) invalid.push("Duplicate exceptions in "+locale);
  }
  for (const tool of tools) {
    const expected = indexableLocalesFor(tool.slug);
    for (const locale of LOCALES) {
      if (isIndexableIn(locale, tool.slug) !== expected.includes(locale)) {
        invalid.push("Mismatch registry indexability: "+locale+"/"+tool.slug);
      }
    }
  }
  if (invalid.length) throw Error(invalid.join(" | "));
  return {
    runAtUtc: new Date().toISOString(),
    warning: "This is a SOURCE CONFIGURATION INTENT audit, NOT a GSC URL Inspection response. 3711 intentionally noindexed pages must not be counted as Google exclusions.",
    fullToolLocalePages: all.length,
    tools: tools.length,
    locales: LOCALES.length,
    coreTools: INDEXED_SLUGS.size,
    indexedCoreLocales: INDEXED_LOCALES,
    explicitlyIndexedExceptionPairs: Object.values(INDEX_EXCEPTIONS).reduce((n,v)=>n+v.length,0),
    indexCandidates: allowed.length,
    deliberatelyNoindex: all.length - allowed.length,
    byLocale,
    urls: allowed.map(x=>x.url)
  };
}

try {
  const report=inspect();
  if (process.argv.includes("--json")) {
    console.log(JSON.stringify(report,null,2));
  } else if (process.argv.includes("--urls")) {
    console.log(report.urls.join("\n"));
  } else {
    console.log("Toolify intended index candidates: "+report.indexCandidates+"/"+report.fullToolLocalePages+
      " tool-locale pages; intentionally noindex "+report.deliberatelyNoindex);
    console.table(report.byLocale);
    console.log("Use --urls to get exact 80 intended inspection targets. Actual Google status requires GSC URL Inspection.");
  }
} catch (e) {
  console.error("[index-policy] FAIL: "+String(e));
  process.exitCode=1;
}
