# Toolify365 Integrated Growth + Privacy Release — 2026-11-08

**Status: REVIEW / NO-GO — source committed, production not deployed.**

## One review branch

`review/toolify-growth-manual-release-20261108` combines:
- PR #41 post-merge hardening: manual-only Actions workflows, VPS lock, HTML-safe embed links, widget attribution `nofollow`, native share cancellation, live indexability smoke improvements.
- `feat/goal-based-tool-workflows-20261107`: four goal-based journeys, 12 existing tool steps, 17-locale copy, homepage/mobile/desktop entrypoints and contextual next-step links.
- The query-free GA4 pageview and custom-event privacy patch from `fix/toolify-ga4-url-query-privacy-20261108`.
- A clearer README for potential GitHub referral traffic.
- New dependency-free integrated preflight and a one-command manual release gate.

Git history is anchored to PR #41 head `f2cd481c6fc5c9cd4a97c376eef1144b1a8e36a1`, and the 19 growth-branch files were copied by their exact Git blob SHAs into a new tree; no PR41 files overlapped. The shared release gate was changed **only on this review branch** to accept its explicit branch name.

## Local owner command (no GitHub Actions)

Clone/checkout the exact integration branch and run:

```bash
git fetch origin review/toolify-growth-manual-release-20261108
git switch --track origin/review/toolify-growth-manual-release-20261108
bash scripts/check-toolify-review-release.sh
```

The script fails closed if the wrong branch, old origin/main, unsupported Node, or automatic workflow triggers are found; then it invokes PR41's existing release gate: VPS lock regression tests, no-dependency embed/share tests, npm ci, full Vitest, integration/smoke, TypeScript, validation, SEO/i18n/index audits and production Next build. The correct public origin is `NEXT_PUBLIC_SITE_URL=https://toolify365.com`.

The script **does not** run GitHub Actions, merge, contact the VPS, or deploy. It does not replace browser/device/privacy QA.

## Verified in current conversation

1. Integration branch created and committed from PR41 + 19 exact growth-branch blobs, with no overlapping file paths.
2. All eight integrated `.github/workflows/*.yml` files fetched from GitHub and validated: **8/8 use exactly one `on: workflow_dispatch: {}` block**, no other triggers.
3. PR41 remains draft/open; main is still unchanged. The integration branch had **zero GitHub Actions workflow runs** at its checked revision.
4. Previously, isolated exact-source `steps.ts` and `pageview-url.ts` passed strict TypeScript and Node tests; GitHub readback of feature source contracts passed. These checks are not equal to a full repo build.
5. Public homepage `https://toolify365.com/en` did **not** show the workflow guide. No rollout or human engagement uplift is verified.


### Additional isolated execution in this session

- Materialized exact GitHub blob contents to the local test workspace and confirmed matching SHA for `steps.ts` (`3b28219344f90589f15f5753e46082db45c3985b`), `pageview-url.ts` (`48ccf03e386526aa8c3288e634e7eb3beb3f6fc0`), and `verify-manual-deploy.mjs` (`c19591c078f8e62557934da9942af0efb56ae0dd`).
- The new preflight test's local source hash `f304dd8b69e7d9aca83686863548177e5d8f3451` matched the actual GitHub blob. `node --check`: **PASS**.
- The new review release wrapper's hash `0321a196c1fe510f737150bcb9cfdd54e41a6e6b` also matched the GitHub blob; `bash -n`: **PASS**.
- Exact-source TypeScript `--strict --noUncheckedIndexedAccess --noEmit` on the two pure helper modules: **PASS**.
- Ran the new preflight with `--test-name-pattern='12 real|workflow query|GA4 page identity'` against exact GitHub-source pure modules: **3/3 passed**. The other five subtests were **not executed** locally because they read additional full-repository files.
- In a separate connector read of the actual integrated branch, strict manual-only event-block checks passed for **all 8 workflows**; this was a source audit, not an Actions run or a browser QA.

## Remaining NO-GO checks

- Owner's complete checkout: execute the command above and resolve every failure.
- Browser/device: `en`, `ja`, RTL `ar`, responsive mobile/tablet/desktop; all 12 tools; 8 follow-up paths; tool share links; native share cancel; iframe embeds; consent; header and mobile menus.
- GA4 DebugView: `workflow_step_click`, `workflow_calculate`, `calculate` and normal `page_view` must remain properly consented. Specifically verify `page_path` and `page_location` **exclude** `?s=` input payloads and `?wf=` route tags. Historical GA4 queries are not deleted by the patch.
- SEO: `/workflows` is `noindex` in all 17 languages and excluded from sitemap; existing indexed tool pages, canonicals, hreflang, sitemap and rel=nofollow remain correct.
- Operational review: confirm the VPS lock, manual-only workflow change and release SHA checks. Only the owner should authorize a reviewed merge and a **manual** deploy.
- After authorized deployment: verify response codes, public release SHA, sitemap and index rules, 28-day baseline and 7/14-day real-user engagement. Exclude bots when reporting users and time-on-site.

## Data connections needed for outcome analysis

- Toolify GA4 is connected to HYPD but no property is selected. Owner selection: https://app.hypd.ai/sources?utm_source=mcp&utm_content=none_selected
- Metricool social publishing has no social account connected: https://app.metricool.com/brands/connections?blogId=7709450
- Search Console's three-day finalized sample (2026-11-02–04) yielded no opportunity candidates; it is not sufficient to establish long-term search demand. No indexing expansion is authorized by that sample.

## Decision standard

**GO only if** full manual gate + browser/consent/SEO QA pass and the owner approves the operational change. Otherwise **NO-GO**, keep the existing production release. Do not claim increased sessions, dwell time, conversions or revenue without observed post-release consented human traffic.
