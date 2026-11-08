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


## 2026-11-08 13:27 JST follow-up: finish-path navigation and live smoke

### Additional committed implementation
- All 12 curated tools (including four last steps) now show an accurate `Step N / 3` and a return-to-guide link immediately after the tool workspace. For the first eight, the next suggested utility is shown, but no user-task completion is fabricated.
- Added two HTML-level link assertions, `hasWorkflowStepAnchor` and `hasWorkflowGuideAnchor`, in the shared smoke helper. They parse real `<a href>` tags, ignoring comments/script payloads and fake `data-href`; they reject cross-site URLs, incorrect locales/fragments and unexpected or duplicated `?wf`/`?ws` parameters, as well as any `?s=` share state.
- Added HTML helper regression cases for valid links and 15+ error conditions.
- Added a **read-only postdeployment workflow smoke**: `site/scripts/check-live-workflows.mjs`. It checks `/en/workflows`, `/ja/workflows`, `/ar/workflows`, 12 links per locale, four first-tool next-step links, four final-tool return links, canonical URLs, noindex, and sitemap absence. `npm run audit:live-workflows` invokes it. This script does not send analytics events, request indexing, merge, run Actions or deploy.
- Updated dependency-free integrated preflight contract to verify the existence of the dedicated postdeployment script. It is **not run predeployment** because the guide is not publicly released yet.

### Verification
- Latest integrated branch source `steps.ts` from GitHub was executed after type-annotation removal in a restricted V8 runtime with compatible URL-query parser: **47/47 assertions passed**, covering 4 workflows, 12 valid steps, 8 continuations and tampering/duplicate cases. SHA **3b28219344f90589f15f5753e46082db45c3985b**.
- Latest GitHub-source `growth-html-checks.mjs` was parsed and executed with an isolated URL shim: **19/19 link checks passed** (valid destinations, injection/duplicate rejection, script/comment/data-href rejection and guide return). SHA **5ecd035db6541c2b3985c787bd44771d698e8fc3**.
- These are constrained pure-source runtime checks, **not** an npm/Next.js production build or real browser test. The new live smoke was **not executed against production**, because the required new routes are not deployed.
- The local container still cannot resolve github.com, so the full project cannot be checked out for npm ci, TypeScript across all files, Vitest and build. This remains a release blocker.

### Postdeployment only (after passing full owner QA and manual release)
```bash
cd site
SITE_URL=https://toolify365.com npm run audit:live-workflows
```

**Release remains NO-GO until full build, RTL/mobile tests, GA4 consent DebugView, owner review and manual deploy SHA verification pass.** Any web traffic or revenue increase is unverified.


### New smoke script synthetic HTTP execution (2026-11-08)

- Executed the **exact GitHub-source** `site/scripts/check-live-workflows.mjs` (Git blob `4354a84b7f3f07427ebe843b7c6429a79d2f3c02`) in a restricted V8 async runner with a controlled URL shim and a synthetic HTTP-response source. This exercised the script's real control flow, not a live public server.
- **Positive control PASS:** 12 mocked requests returned valid multilingual guides, real 12-step links, next links, final return links, noindex/canonicals, and no new sitemap entries. The smoke concluded PASS.
- **Negative control PASS:** removed the final return link from the synthetic timezone-converter HTML. The script issued 12 checks and exited with code 1, identifying `/en/tools/timezone-converter: missing final-step guide return`.
- Earlier helper-only verification: **19/19 assertions** passed with exact-source `growth-html-checks.mjs` and a URL shim. Workflow routing: **47/47 assertions**.
- The new regression Vitest/Node files have been committed to GitHub, but the **full tests have not executed** because full repository checkout and npm dependencies remain unavailable. Real-device/mobile and public network tests remain owner-only release gates.


## 2026-11-08 17:16 JST: initial pageview loss / consent readiness fixed

### Problem and patch
The pre-existing `PageViewTracker` could mount before the `next/script` `afterInteractive` GA4 initializer. It would see no `window.gtag` and return without retrying, silently losing an initial `page_view`. Relying on a non-null `window.gtag` alone would be unsafe if another script created that global before Toolify's consent defaults ran.

**Review-branch only** implementation:
- New pure `site/src/lib/analytics/pageview-once.ts`: constructs a one-shot sender that refuses to emit until GA4 setup explicitly declares readiness, strips all `?s=`, `?wf=`, and fragment information via `sanitizePageViewUrl`, and can retry if the emitter was absent or threw before a successful send.
- `gtag.tsx` sets `window.__toolifyGtagReady = true` **after** the region-specific/global Consent Mode defaults and `gtag('config', ..., send_page_view:false)` call, then dispatches `toolify:gtag-ready`.
- `pageview.tsx` installs/cleans an event listener for the ready notification and immediately attempts a send if config already finished. React's `useEffect` depends only on pathname: query-only share-link updates cannot create additional pageviews; each real pathname transition gets a fresh one-shot sender.
- Added three `pageview-once.test.ts` Vitest cases and updated the integration/wiring tests to require ordering `consent defaults -> config -> ready flag -> signal`.

### Executed verification
- Exact-source `pageview-once.ts` Git blob SHA **ee5dfb0f2a4075683f8fd4d205e5c3f731efeacf** and `pageview-url.ts` SHA **48ccf03e386526aa8c3288e634e7eb3beb3f6fc0** were copied to a temporary isolated Node workspace. `git hash-object` matched **both SHA values exactly**.
- TypeScript 5.8.3 `--strict --noUncheckedIndexedAccess --target ES2022 --module CommonJS`: **PASS**.
- Actual Node 22.16.0 runtime assertions: **13 PASS**; premature send suppressed, post-ready send exactly once, query and fragment redacted, missing emitter and temporary errors retry, and next-path transition allowed.
- Full Next.js typecheck, Vitest, build and browser GA4 DebugView remain **NOT VERIFIED**, because the environment cannot clone and install the complete remote repo.
- Read-only connected GSC opportunity result on 2026-11-08: exact Toolify365 property, finalized **2026-11-03 through 2026-11-05**, `minImpressions=1`, **0 returned candidates**, free recent-three-days mode with **no previous-period comparison**. This cannot demonstrate absence of search demand, so do not expand indexed locales or publish unverified SEO claims.
- Public `https://toolify365.com/en` still displays the existing tool homepage, not the new workflow navigation. No merger, Actions run, manual deploy, or conversion improvement is claimed.

**New manual browser QA:** open a new browser session with delayed/blocked GA script loading; verify one `page_view` when GA4 initializes, zero duplicate pageviews from `?s=` URL edits, one new view for SPA route navigation, and no data-carrying URL fields in GA4 DebugView. Confirm consent handling in EEA and non-EEA contexts.


## 2026-11-08 18:31 JST: newest main reconciled and GA4 enhanced pageview double-count gate

### Main synchronization (actual Git merge)
The latest `main` commit `82b1137908678bc5ca97c4b84fccf82b4a53ac5a` changed two files: `Breadcrumbs.tsx` and `ToolFrame.tsx` to improve mobile-first navigation. A **two-parent merge commit** `73fa4e541fd55c9358f5d0873f894151048679a5` was created on the **review branch only**, retaining main's `hideCurrentOnMobile`, the two-line mobile description, and ShareBar placement after the tool on small screens.

The integrated ToolFrame places `WorkflowNextStep` directly after the live tool workspace, **before** mobile share buttons and related/advertising blocks, to keep a next action visible. No other main features were replaced. Corresponding regression tests were added to `site/src/lib/workflows/wiring.test.ts`. No production main merge, PR, Actions run or deploy was performed.

### Newly confirmed GA4 double-count and privacy issue
Google's official GA4 documentation states that `send_page_view: false` disables a default config-triggered `page_view`, **but does not disable Enhanced Measurement's history-based pageviews**. If the GA4 Web stream option **Page changes based on browser history events** is enabled, SPA push/replace/popState navigation can generate additional automatic pageviews. This site also uses `history.replaceState` to preserve `?s=` tool inputs, so this could both inflate pageviews and expose query-state URLs.

Official reference:
https://developers.google.com/analytics/devguides/collection/ga4/views

**Required owner-only configuration:** In Google Analytics 4, open Admin > Data collection and modification > Data streams > select the Toolify365 Web stream > Enhanced measurement > Page views > advanced settings. **Disable "Page changes based on browser history events".** Keep the site's own one-shot, query-sanitized `PageViewTracker`. Then verify with GA4 DebugView that each actual route produces one `page_view`, changing `?s=` alone produces zero more, and `page_location` and `page_referrer` do not expose tool input data.

The GA4 Admin setting is **not available through the connected read-only HYPD API**, which currently reports no selected GA4 property. The owner can select it at:
https://app.hypd.ai/sources?utm_source=mcp&utm_content=none_selected

### Fail-closed release policy
`scripts/check-toolify-review-release.sh` first performs all existing local source/Node/npm/TypeScript/Vitest/SEO/build checks. Afterward it checks the explicit operator-attestation environment flag `TOOLIFY_GA4_HISTORY_PAGEVIEWS_DISABLED=confirmed`. Without that exact value it exits **4 / NO-GO** and prints the GA4 setting and DebugView instructions.

This variable is **only a manual operator declaration**, not a machine verification of GA4 configuration. It does not automatically disable the setting, authorize merge, or deploy. Passing the flag does not replace full browser, consent or live-release checks.

```bash
# After verifying the GA4 Data Stream option and completing local checkout:
TOOLIFY_GA4_HISTORY_PAGEVIEWS_DISABLED=confirmed bash scripts/check-toolify-review-release.sh
```

The checked preflight tests explicitly assert that the flag is required, that a missing flag remains NO-GO, and that the latest mobile-first ToolFrame changes survive the merge.

### Current release state
**NO-GO:** GA4 admin setting and DebugView, full repository dependency install/Next production build, RTL/mobile browser QA and manual production release have not been independently verified here. The audit is source-focused; no traffic, dwell, conversion or earnings uplift is claimed.


### Current-turn verification after latest-main merge

- Read latest `main` and review ref, confirmed the review branch now **includes latest main as a parent**; compared refs showed **0 commits behind main**.
- Exact source contract checks passed **7/7** for `ToolFrame`, mobile breadcrumb support, path-to-workflow ordering, the fail-closed operator flag, and related regression guards.
- Re-fetched the full content of all **8** integrated `.github/workflows/*.yml` files and inspected each full `on:` block. **8/8 were manual-dispatch-only**. A preliminary broad regex that searched job blocks was discarded; only the scoped event-block parser results are authoritative.
- Copied the **exact GitHub blob** `scripts/check-toolify-review-release.sh` to the local shell workspace: `git hash-object` returned **ad3b2793d53afe9de0bc8a76870b55ce28576604**, matching the GitHub `fetch_file` blob SHA. `bash -n` **passed**.
- Rechecked HYPD: GA4 properties are connected, but **zero are selected for tool access**, so the property-level Enhanced Measurement setting remains **unverified**. The release gate now deliberately fails with exit 4 unless the owner explicitly attests verification, after full static/build checks.
- The release gate has **not** been run end-to-end; it requires a complete checkout, dependencies, GA4 owner access, browser QA and ultimately manual deployment authorization. Source/bare shell syntax successes are not end-to-end evidence.


## 2026-11-08 20:05 JST: GA4 referral privacy + Microsoft Clarity masking

### Implemented on this review branch, not production

- The shared `pageview-url.ts` now exports `sanitizePageReferrer(referrer, currentHref)`. Referrers from Toolify's own origin retain **origin + pathname only**, while external referrers retain **origin only**. Query strings and hashes are removed; invalid/non-HTTP(S) values become empty.
- `pageview-once.ts` adds an optional, sanitized `page_referrer` parameter to one-shot GA4 `page_view` events. `PageViewTracker` retains the previously emitted clean page location for subsequent SPA pageviews, rather than reusing a stale `document.referrer` on each transition.
- `gtag.tsx` overrides GA4's default `document.referrer` at configuration using the same safety policy. All first-party custom GA4 events now explicitly supply a sanitized `page_referrer`; `page_location` and `page_path` remain query-free.
- The shared `ToolInteractionTracker` uses `data-clarity-mask="true"` around every utility workspace; `SoftwareWorkbench` applies the same masking to browser-local input, imported file contents and rendered output. This guards rendered DOM content in future Clarity recordings without editing the 223 individual tools.
- Added Vitest and no-dependency preflight assertions for same-site/external referrer safety and Clarity masking. The release gate now requires the operator to review Clarity URL privacy via `TOOLIFY_CLARITY_URLS_REVIEWED=confirmed`. Missing review returns exit **5**. It also retains the separate GA4 Enhanced Measurement owner gate (exit **4**).
- Neither environment variable actually configures the external service, triggers GitHub Actions, merges, or deploys; these are **operator attestations**, not automated proof.

### Executed evidence

- Retrieved the precise GitHub blobs for `pageview-url.ts` (**c9d7fc25b3bc23b3d9079cdd64e8b053987bbfbb**) and `pageview-once.ts` (**42b1185f9895a5876dbb3fb4af9ad5a0cbcae5a7**) and independently reconstructed them in a temporary Node 22 checkout. `git hash-object` matched **both blobs exactly**.
- `tsc --strict --noUncheckedIndexedAccess --target ES2022 --module CommonJS --noEmit`: **PASS**.
- Compiled the same source and ran Node 22.16 exact-source runtime assertions: **18 PASS** (query/fragment removal, same-origin/external attribution, invalid URL rejection, consent readiness, once-only delivery, exception recovery and next-route referrer).
- This is **not** a full Next.js/Vitest/release build. The external GA4/Clarity settings and real browser behavior have **not been independently verified** in this session.

### Important Clarity limitation and release decision

Microsoft documents that DOM content masking **does not mask URLs**. For URL query-parameter masking, a project owner must contact Clarity support; even that setting does not cover referrer or clicked URLs. Therefore adding `data-clarity-mask` alone does **not** establish safety for Toolify's `?s=` result-sharing URLs.

- Before release, owner should verify whether Clarity is enabled on this deployment, and if so arrange masking of `s` and assess referrer/clicked URL exposure using a test account. If adequate protection cannot be demonstrated, **disable Clarity** until result-sharing state can be redesigned not to include user inputs in URLs. Check whether the impact.com script or other external tags also receive URL state.
- The release guard refuses GO until that review is explicitly attested, even if GA4 is configured correctly. The existing GA4 requirement separately checks that history-event pageviews are disabled and DebugView contains no private URL state.
- Avoid assuming an already-deployed production site has these protections; the changes are review-only.

Official sources:
- https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-masking
- https://learn.microsoft.com/en-us/clarity/faq/
- https://developers.google.com/analytics/devguides/collection/ga4/reference/config

### Updated manual preflight

```bash
# Only after the full local owner checkout, GA4 Admin and Clarity review:
TOOLIFY_GA4_HISTORY_PAGEVIEWS_DISABLED=confirmed \
TOOLIFY_CLARITY_URLS_REVIEWED=confirmed \
bash scripts/check-toolify-review-release.sh
```

Keep status **NO-GO** until `npm ci`, all tests, production Next build, actual desktop/mobile/RTL sessions, GA4 DebugView, the Clarity query safety review, manual production release approval and live SHA/smoke checks pass. No bot-adjusted traffic or revenue uplift has been demonstrated.
