# Toolify365 — search-index configuration inventory, 2026-10-25

## Verified by reading GitHub configuration (NOT live Google inspection)

- All tool definitions in `src/lib/tools/registry.ts`: **223**.
- Active locales in `src/lib/i18n/locales.ts`: **17**.
- Therefore generated tool-locale combinations: **3,791**.
- `CORE_TOOLS_BY_DEMAND`: **29** tools; default `INDEXED_LOCALES = ["en", "ja"]` means **58** core eligible tool-locale URLs.
- `INDEX_EXCEPTIONS`: **22** additional locale/slugs (Thai 4, Russian 4, Turkish 6, Arabic 5, French 1, Spanish 2).
- Total tool-locale URLs explicitly intended to be eligible for index: **80**.
- Tool-locale pages intentionally excluded by configuration: **3,711** (97.89%). This counts tool pages only, not the home, categories, directory, shared routes, or prompts.
- These 3,711 are **intentional noindex**, NOT 3,711 Google crawl/index failures.

The archived 50-URL Search Console inspection sample in `appdevelopsk/app-infra/gsc/latest.json` reported only 1 indexed and 36 crawled-not-indexed. Since the 50 exact URLs and their chosen indexable status were not available, do not equate the 36 with intentionally noindexed URLs; Google distinguishes these verdicts and requires per-URL inspection. Do not quote `1/50` as a site-wide indexing ratio.

New reproducible read-only commands from `site/`:

```sh
npm run audit:index-policy
npm run audit:index-policy -- --json
npm run audit:index-policy -- --urls
```

The script loads the actual locale registry and tool metadata, checks duplicate slugs, invalid exception slugs/locales, and that each per-tool hreflang locale list agrees with the indexable decision. It emits the exact 80 **intended** candidate tool URLs for later official Search Console URL Inspection. It never changes robots, meta-noindex, sitemaps, canonical, hreflang, deployed content or Google APIs.

## Prioritized diagnosis

1. Inspect exact `en/ja` **29 core pairs** and 22 exceptions with GSC URL Inspection (authenticated owner account). Record `PASS`/coverageState, lastCrawlTime, Google-selected canonical, declared canonical, robots/fetch status and referring sitemap for each.
2. Partition the prior 50 sample by **intended index eligibility** before making any "deindexing" statement. Without exact URLs, the 36 crawled-not-indexed cannot be attributed.
3. Compare 28-day finalized GSC impressions/clicks per 80 intended URL candidates and current public HTML after verified deployment. 2026-10-20..22 recent SMEPost GSC (free 3-day window) returned no opportunities for `https://toolify365.com/`; no inference of zero index coverage.
4. Improve tool-specific original utility and on-page examples before considering changes to the October 11 allowlist.
5. **Do not bulk change indexability/robots/sitemap/canonical before the prior 2026-12-06 freeze end without a new evidence-backed decision.** A code merge or a site: search is not URL Inspection evidence.

Note: the source inventory counts are accurate for this commit, not a forecast of what Google will index.
