# Toolify365 Growth Release Gate — 2026-11-05

Related: #37, PR #38. No GitHub Actions are required or authorized for this rollout.

## Existing SEO safeguards (do not duplicate)
- `src/app/sitemap.ts`: generates only URLs selected by `isIndexableIn` / `indexableLocalesFor`.
- `src/app/robots.ts`: publishes robots/sitemap configuration.
- `src/lib/seo/metadata.ts`: canonical, robots and hreflang.
- `src/lib/tools/registry.ts`: demand-ranked core index allowlist + selective locale exceptions.
- `scripts/audit-seo.ts`, `scripts/report-index-policy.ts`, `scripts/indexnow.ts`: existing audits and index notification.

**Do not** bulk-index all 223 tools × 17 locales. GSC index coverage is NOT the same as the count of URLs intended for indexing.

## Local verification from repository root

```bash
cd site
npm ci
npm run typecheck
npm run test
npm run validate
npm run audit:seo
npm run audit:i18n
npm run audit:index-policy -- --json
npm run build
```

These checks need a machine with dependencies and network/required build environment. If any check fails, do not merge or deploy. Follow existing `prebuild` exchange-rate freshness policy; do not bypass it to force a green build.

## Browser QA before production
1. Check en and ja pages `/tools/character-frequency` and `/tools/reverse-text-generator`: free software CTA appears below tool and links to Text Batch Studio with correct locale.
2. Check `/tools/csv-json-converter` and `/tools/json-formatter`: only currently available CSV Cleaner Pro and JSON Studio destinations appear.
3. Confirm a tool with no mapping does not show an empty software panel.
4. On mobile and keyboard navigation, confirm CTA focus, labels and layout.
5. Check `/software/{csv-cleaner-pro,json-studio,text-batch-studio}` processing / downloading still work, and failed input still gives the previous error.
6. Consent/debug QA: `software_click` fires on CTA, `software_process` on process success/failure and `software_download` on a download click. No user-entered text, file name or file contents are sent. Without GA configuration events are safe no-ops.
7. Verify live canonical host is `https://toolify365.com`, and check HTTP 200, robots/sitemap and hreflang reciprocal URLs manually. Search-result snippets can lag deployment.

## GA4 definitions
Create event-scoped custom dimensions (where not already present): `tool_slug`, `locale`, `destination`, `software_slug`. Do not register redundant fields. Analyze:
- Organic landing sessions → `calculate` → `software_click`
- `software_click` → `software_process` successful
- `software_process` → `software_download`
Count users/sessions when possible, not only raw events. Exclude internal traffic. Not all click-through events guarantee successful navigation or file download.

## Search prioritization
- Obtain last 28 finalized days and prior 28 days from GSC / Bing, grouped by page + query + locale/country + device.
- Work on high-impression, low-CTR indexed pages first; ensure unique title, accurate introduction, examples and FAQ.
- Expand `INDEX_EXCEPTIONS` only for verified demand with localized content; 5–10 pairs at a time, assess after 28 days, rollback if indexing/crawl quality degrades.
- Do not automatically post marketing links to unrelated communities or create scaled thin pages.

## Deployment and rollback
- After all gates pass, merge PR #38 and deploy by the site's owner-managed process.
- Verify direct URLs and GA4 DebugView, then submit **changed, valid, canonical** URLs using existing IndexNow script (not Google).
- Record release commit, timestamp, and post-release GA4/GSC/Bing baseline.
- If UI/processing or analytics regress, revert PR #38 and redeploy; do not edit the sitemap allowlist as part of rollback unless it changed.

## Current evidence
Source-only reviews are not equivalent to running the above commands. The connected GSC access returned a 3-day sample (2026-10-31 to 2026-11-02) with no suggested opportunities; it cannot establish a 28-day comparison or zero traffic.

## Post-deployment automated smoke check (new)
Run only **after** a successful owner deployment:
```bash
cd site
SITE_URL=https://toolify365.com npm run audit:live-growth
```
This performs read-only HTTP checks on key en/ja tool and software pages, expected contextual CTA HTML, canonical presence, robots and sitemap. HTTP connectivity is required; a failure from a restricted runner is NOT proof that the production site is down. This script is not a substitute for browser interaction tests, GA4 DebugView, live Search Console URL Inspection or a local production build.

## Extended release safeguards (2026-11-05)
The `audit:live-growth` script now also checks that known index-eligible core tool pages do **not** return a noindex meta tag and appear in the served sitemap, while verifying same-origin self-canonical and unexpected redirects. This is a *post-deployment* check; it intentionally fails when the current production deployment does not yet contain the PR's CTA. Do not run it as a pre-deploy gate against the old production version.

## Dependency-free regression test (2026-11-05)
`cd site && npm run test:smoke-html` runs the Node built-in test suite for HTML meta robots, canonical extraction, and actual on-domain, same-locale software CTA anchor detection. This was also exercised in an isolated Node.js 22 environment (3 test groups passing). It is **not** a substitute for Next.js/Vitest full tests, real browser QA or deploy verification.

## Parallel PR integration guard — PR #39
PR #39 (engagement) also edits `site/src/components/tools/ToolFrame.tsx` and `site/src/lib/analytics/events.ts`, both changed in this PR #38. Do **not** overwrite either file with an entire version copied from one PR while merging the other.

When integrating:
1. Rebase/merge both branches locally in a scratch branch (not `main`).
2. Preserve in `ToolFrame.tsx` BOTH PR #39's engagement/navigation UI and PR #38's `ToolSoftwareRecommendations` section.
3. Preserve in `events.ts` ALL existing event exports plus PR #39 event changes and PR #38 `trackSoftwareClick`, `trackSoftwareProcess`, `trackSoftwareDownload`.
4. Resolve conflicts, run TypeScript, all tests including `test:smoke-html`, audits and build, and review DOM/keyboard order of CTA vs related/recents.
5. Only after passing checks merge/release through the owner process. Avoid untested sequential merges.

## Isolated execution evidence
Node.js 22 `node --test` was run on exact reproduced copies of `growth-html-checks.mjs` and its test cases in the working container: 3/3 subtests passed (robots/googlebot; canonical; valid destination/locale/origin). This does **not** validate the complete Next.js application, GitHub PR head in a cloned checkout, nor the deployed website.
