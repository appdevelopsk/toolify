# Known Errors — Toolify365

Documented production incidents and their root causes, for re-occurrence prevention.

---

## Phase 13

### [2026-05-26] nginx 502 on `/en/prompts` and `/ru/prompts`

**Symptom:** Sentry reported intermittent nginx 502 errors specifically for the prompts index page across locales.

**Root cause:** `[locale]/prompts/page.tsx` was missing `generateStaticParams()`. Without it, Next.js fell back to SSR at runtime for this page, even though the parent `[locale]` layout defines `generateStaticParams`. During concurrent pre-rendering, the page could fail (locale context unreliable without explicit SSG params), causing PM2 to return a 5xx that nginx forwarded as 502.

**Pattern to avoid:**
> Any page under a dynamic route segment that does NOT define its own `generateStaticParams` may be rendered dynamically at runtime, even if the parent layout provides params.

**Fix:** Added `generateStaticParams` to `src/app/[locale]/prompts/page.tsx` to force explicit SSG for all prompt-active locales. Also changed `getTranslations()` → `getTranslations({ locale })` to make locale injection explicit and avoid AsyncLocalStorage context issues.

**Cross-check:** Run `grep -rn "export default async function" src/app/[locale] | grep -v generateStaticParams` and verify every page either has `generateStaticParams` or explicitly opts into SSR with `export const dynamic = "force-dynamic"`.

---

### [2026-05-26] `feed.xml` appearing in GSC "Crawled - not indexed"

**Symptom:** Google Search Console showed `/feed.xml` as "Crawled - currently not indexed."

**Root cause:** The RSS feed route returned `content-type: application/rss+xml` but no `X-Robots-Tag: noindex` header. Google crawled it (found via the `<atom:link>` self-reference in the feed itself) but correctly chose not to index XML content.

**Fix:** Added `"x-robots-tag": "noindex"` to the response headers in `src/app/feed.xml/route.ts`.

---

### [2026-05] SearchAction structured data causing 404s in GSC

**Symptom:** GSC reported 404 errors for URLs matching `/{locale}/search?q=...`.

**Root cause:** `websiteJsonLd()` in `src/lib/seo/structured-data.ts` included a `potentialAction` SearchAction that pointed to `/{locale}/search?q={search_term_string}`. No search route exists at that path.

**Fix:** Removed the `potentialAction` block entirely from `websiteJsonLd`.

---

### [2026-05] GA4 showing zero data / ConsentBanner not appearing

**Symptom:** GA4 dashboard showed no events despite traffic.

**Root cause:** `NEXT_PUBLIC_FC_ID` was set to a non-empty value in `.github/workflows/deploy.yml`. `ConsentBanner.tsx` returns `null` when `siteConfig.cmp.fcId` is truthy, so the consent banner never rendered and `analytics_storage` remained permanently denied.

**Fix:** Set `NEXT_PUBLIC_FC_ID: ""` in the deploy workflow.

---

### [2026-05] next-intl 307 redirects passing incorrect PageRank signals

**Symptom:** Googlebot followed locale-less URLs (`/tools/calculator`) and received 307 Temporary Redirects instead of 301 Permanent Redirects.

**Root cause:** `next-intl`'s `createMiddleware` defaults to 307 for all locale redirects.

**Fix:** Wrapped the intl middleware in `src/middleware.ts` to upgrade 307 → 301 for GET requests.
