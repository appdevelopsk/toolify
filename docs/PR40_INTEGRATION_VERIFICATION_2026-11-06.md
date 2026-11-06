# PR #40 — Toolify growth + engagement integration gate

Date: 2026-11-06 JST. Integration from PR #39 head plus PR #38 changes. Original PRs and `main` are unchanged.

## Integration proof (GitHub source readback)
- `site/src/components/tools/ToolFrame.tsx`: both `ContinueWithRecent` and `ToolSoftwareRecommendations` imported and rendered.
- `site/src/lib/analytics/events.ts`: `trackRecentToolClick`, `trackScenarioAction`, `trackSoftwareClick`, `trackSoftwareProcess`, `trackSoftwareDownload` exports retained.
- `site/package.json`: `test:smoke-html`, `audit:live-growth` retained.
- GitHub compare against `main`: 91 commits ahead, zero behind, 35 changed files at PR #40 creation. This is **not** evidence of conflict-free runtime behavior.
- Separate locally reconstructed copy of the PR #38 HTML helper/test: `node --test` = 3 passed, 0 failed under Node 22.16.0. This does not cover all of PR #40.

## Mandatory local gate — no GitHub Actions
```bash
git fetch origin
git checkout integration/toolify-growth-engagement-20261106
cd site
npm ci
npm run test:smoke-html
npm run typecheck
npm run test
npm run validate
npm run audit:seo
npm run audit:i18n
npm run audit:index-policy -- --json
npm run build
```
Stop on any failure. Make necessary fixes **on the integration branch**, then rerun the full suite.

## Functional and privacy checks
- Mobile/desktop en and ja pages: recent-tool controls and software CTA coexist without duplicated destinations or hidden primary tool.
- Percentage calculator: 2-scenario comparison, optional save/resume/clear, share/restore, malformed URL and expired drafts.
- ShareBar: no password/hidden value exposed in generic sharing, length cap enforced, event subscriptions behave correctly after back/forward.
- Software: CSV Cleaner Pro, JSON Studio, Text Batch Studio process and download correctly; invalid input and max-size errors handled without data upload.
- GA4: consent-aware events for recent click, scenario actions, software click/process/download. Ensure no user inputs, file contents or names are transmitted.
- Accessibility: keyboard/focus and screenreader link labels in both locales.

## Deployment gate
Do **not** merge PR #38 and #39 separately after PR #40 merges. Review the combined PR and merge **only PR #40** once all checks pass, then close or supersede the original PRs as appropriate. Owner controls production deployment.
```bash
cd site
SITE_URL=https://toolify365.com npm run audit:live-growth
```
Run this only after production deployment (the old site has no new CTA and correctly fails). Independently verify live GSC/Bing indexing; do not mass-index 17 locales without 28-day query evidence.

## Current release result
**NO-GO**: full checkout, TypeScript/Vitest/Next build, cross-feature browser checks and production deploy not executed in this environment. Direct clone to private GitHub repository fails DNS resolution here. No search traffic or revenue improvement verified.

## 2026-11-06 incremental integration QA
- The merged `ToolFrame` now presents contextual software CTAs **after** related/recent navigation but **before** advertising blocks. The corresponding `ToolFrame.order.test.ts` asserts this order.
- Actual Node 22.16.0 isolated execution of exact HTML helpers and tests from the integration branch: **3 passed / 0 failed**. The full Next/Vitest suite remains unrun because `git ls-remote` still cannot resolve `github.com` from the local container.
- PR #39 continued receiving changes while this integration was being prepared. Its updated `useAutoShareableState.ts` and sharing regression test have been copied into this branch; confirm fresh tree state again just before final merge because upstream may keep changing.
- Source-readback verified `ToolFrame` positions: workspace, recent navigation, software CTA, and ad blocks in that order; five analytics exports intact. This does not establish working browser behavior.
- Do not merge while PR #39 is actively evolving. Freeze both PR heads, recheck latest changed files, and run complete tests against the final integration tree.

## One-command combined local gate (2026-11-06)
The existing root `scripts/check-engagement-release.sh` now runs both PR #39's full checks and PR #38's dependency-free `test:smoke-html` before typecheck/Vitest/audits/build. On an owner-accessible checkout run `bash scripts/check-engagement-release.sh` from repository root; it uses `npm ci` and does not run GitHub Actions, merge or deploy. The shell script itself has not been run in this environment (private repo cannot be cloned). A passing run still requires real browser/GA4 checks before merging and owner-managed deployment.

## 2026-11-06 morning sync (search safety + combined regression gate)
- PR #39 added `search-index-payload.ts` and tests plus `useSearchIndex` validation. These were ported to PR #40, then the latest stricter payload validation (known categories, safe slug pattern, title limits, deduplication) and expanded tests were resynced.
- Compared against category configuration: parser's eight categories match `ToolCategory`'s eight configured categories.
- Added `site/scripts/growth-integration.test.mjs` with three dependency-free checks: workspace/navigation/CTA/ad order, five GA4 exports and consumers, and catalog-gated recommendation wiring.
- Registered `npm run test:integration` and added it to `scripts/check-engagement-release.sh` along with `test:smoke-html`.
- GitHub connector readback verified all three tests are present, the new npm command is wired, the UI order is workspace → recent → software CTA → ad, and the five tracking functions are retained. **This is source readback, not a completed run of the full integration gate.**
- Direct clone still fails DNS from available execution environment. Avoid merging PR #40 until full npm install, Vitest, typecheck, browser/device checks and build run in an authorized checkout.

## 2026-11-06 fresh PR39 parity and rendered HTML regression
- Compared latest PR #39 changes to integration PR #40: 7 highlighted files (sharing policy/hook, search-index validation/hook/tests and verification record) were fetched by the GitHub connector and all seven file contents matched exactly.
- Repeated local direct git clone probe: `Could not resolve host: github.com`; full repository checkout still not available in execution container.
- Ran Node.js 22.16.0 with a local copy of the exact growth HTML helper/test modules: **3 test groups passed, zero failed**.
- Identified a misleading success case: serialized HTML text inside hydration `<script>` or `<style>` could appear to be a real software CTA. The HTML helper now ignores script and style blocks; added regression cases for fake anchors in both elements.
- Re-executed the updated local HTML test copy after the fix: **3/3 tests pass**. This validates the helper unit tests, not live rendering.
- Main merge and deploy remain blocked on full integrated local gate, browser checks, review, and owner deployment.

## 2026-11-06 10:12 JST: renewed checks and branch safety
- Compared the latest PR #39 against PR #40: nine changed candidate paths were checked; five already matched and four were updated on integration (verification document, ShareBar event tests, manual share hook, auto share hook). Do not confuse Git ancestry divergence with file mismatch.
- Strengthened `scripts/check-engagement-release.sh` to refuse execution unless the checked-out branch is `integration/toolify-growth-engagement-20261106`; this prevents accidentally running the release gate against `main` or a detached head.
- Copied the GitHub HTML helper and its test cases into an isolated local Node.js 22.16.0 environment and executed `node --test`: **3 passed, 0 failed**. The test covers noindex, canonical, real CTA anchor/locale/domain and fake script/style elements. Test copies, not an actual full repository checkout.
- Direct `git ls-remote https://github.com/appdevelopsk/toolify.git HEAD` again failed with `Could not resolve host: github.com`. No full `npm ci`, typecheck, complete Vitest, production build, visual QA or merge/deploy performed.
- Current decision remains **NO-GO**, pending full local gate, manual QA and owner deployment.

## 2026-11-06 11:21 JST: latest PR39 sync and HTML false-positive hardening
- Compared current PR39 and PR40 source: the only mismatched upstream file contents at review were `docs/PR39_VERIFICATION_2026-11-05.md` and `site/src/lib/search/search-index-payload.test.ts`; both synchronized.
- Fixed `site/scripts/growth-html-checks.mjs` to strip HTML comments, script, and style payloads for **all three** validators (`hasNoindex`, `canonicalHref`, and `hasSoftwareAnchor`). Added negative tests for fake SEO tags inside comments and hydration payloads.
- Ran a local exact-source recreation of the GitHub helper/test with Node v22.16.0: `node --test` **3 subtests passed, 0 failed**. Verified test execution, but full application runtime and connected GitHub checkout remain untested (DNS error).
- Continue to hold draft PR40 until `bash scripts/check-engagement-release.sh` passes from the integrated branch, plus browser QA and owner-controlled deployment.
