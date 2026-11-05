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
