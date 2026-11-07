# Toolify365 PR #40 post-merge follow-up — 2026-11-07

## Actual PR state
- PR #40 was observed as **merged to main**, merge commit `4a09024db573217670ac7cc0701006b112636800`. This happened separately from this assistant's work. **A GitHub merge is not proof of production deployment.**
- Immediately afterwards `main` versus `integration/toolify-growth-engagement-20261106` diverged. Six paths differed; this follow-up PR intentionally carries the four user-facing/code paths relevant to the late embed security work, not stale verification text from prior PRs.
- Changes: safe HTML snippet builder `embed-html.ts`, dedicated unit tests, ShareBar wiring, and the seventh cross-PR integration source test group.

## Test evidence
- Local standalone reconstruction of the new embed helper using Node v22.16.0: **3/3 passing** (title escaping, attribute escaping, injection attempts). This is an adapted copy of the GitHub source, **not** the repository Vitest suite or full TypeScript check.
- GitHub file readback verified the escaping call sites and ShareBar source imports.
- `git ls-remote https://github.com/appdevelopsk/toolify.git HEAD` fails DNS in this environment. Full project install, TypeScript, Vitest, Next production build, browser QA and production deployment are **unverified**.

## Owner release gate
1. On a machine with repository and npm access, checkout this follow-up branch and run `bash scripts/check-postmerge-embed-release.sh` from the repository root. The old PR40 release gate is specific to the merged branch and must not be used here.
2. Verify on desktop and mobile that ShareBar emits safe embed HTML, copy/share actions work, and the iframe route and tool page are functional in en/ja.
3. Review and merge this follow-up PR only after all checks pass. Owner-managed deploy; then confirm live behavior and no regression. GitHub Actions are **not** used.
4. Measure GA4 funnel and 28-day GSC/Bing data after deployment; don't infer traffic or revenue growth from merges or isolated tests.

## Dedicated PR #41 release gate (2026-11-07)
- Added `scripts/check-postmerge-embed-release.sh`, guarded to **only** run from `fix/toolify-postmerge-embed-safety-20261107`. It performs `npm ci`, both dependency-free Node checks, TypeScript, Vitest, validation, SEO/i18n/index policy audits, and production Next build. Does not use GitHub Actions or deploy.
- Execute from repository root: `bash scripts/check-postmerge-embed-release.sh`.
- Local standalone embed helper tests re-run with Node v22.16.0: **3 passed, 0 failed**, but the full release gate remains **unrun** until checkout, npm dependencies and browser/device QA can be performed.
- Do not merge PR #41 solely on source inspections or isolated tests.

## Further URL scheme hardening — 2026-11-07
- The first PR41 embed helper escaped HTML attributes but accepted `javascript:`, `data:`, and relative iframe/link URLs. Added `safeEmbedUrl` that requires HTTPS (or HTTP only on localhost/127.0.0.1 for local development); invalid iframe URLs fall back to `about:blank`, invalid tool links to the Toolify365 homepage.
- Updated the cross-PR integration source assertions and `embed-html.test.ts` with scheme rejection and legitimate HTTPS/local-development cases.
- Reconstructed the final helper as a small standalone Node ES module matching the GitHub logic: `node --test` **4 passed, 0 failed** (HTML escaping, query attribute escaping, unsafe URL schemes, valid HTTPS/local URLs). The full PR41 Vitest, TypeScript and Next.js build are **not verified**. No GitHub Actions, merge or deployment initiated.

## 2026-11-07 verified standalone Node check
- Retrieved current `site/src/lib/tools/embed-html.ts` from the PR41 branch, copied its exact implementation into an isolated local workspace, and ran `node --experimental-strip-types --test test.mjs` on Node v22.16.0.
- **Five independent Node subtests passed (5/5, exit 0):** markup entities, src/href attribute escaping, injected markup/handler protection, disallowed javascript/data/relative/http remote schemes, HTTPS and local development.
- This tests the actual helper implementation in isolation with a separate Node test harness, **not** the repository's Vitest suite or whole Next.js application. The four in-repo Vitest test cases are authored but remain unrun with `npm ci` on a full checkout.
- At check time PR41 remained open, draft, 11 commits ahead of main and 0 behind; no deploy/merge performed in this work.

## 2026-11-07 security follow-up: credentials and control characters
- Found a real URL parsing edge case: WHATWG `new URL()` accepts HTTPS URLs with embedded usernames/passwords and trims leading newlines/trailing tabs. URL scheme-only checks previously let these through.
- Hardened `site/src/lib/tools/embed-html.ts`: reject ASCII control characters, surrounding whitespace, and parsed URL userinfo before allowing HTTPS/localhost.
- Expanded `embed-html.test.ts` with credentials, newline, tab, and whitespace cases, and strengthened the cross-PR integration source regression.
- Ran `node --test` on an isolated JS adaptation of the updated helper: **4 subtest groups passed, zero failed**, including unsafe schemes, credentials, controls, attribute encoding, and valid HTTPS/local links. This does not constitute the full repository's Vitest or production build.
- PR41 remains NO-GO until checked-out full build and browser QA pass. GitHub Actions were not used; production not verified.

## 2026-11-07: exact-source executable checks and deployment-trigger guard
- Added `site/scripts/embed-html-node.test.mjs` as a Node >=22 **dependency-free test of the actual TypeScript implementation**, and wired it into `scripts/check-postmerge-embed-release.sh` **before** `npm ci`.
- Verified Git blob SHAs on locally materialized files **exactly match** PR #41: `embed-html.ts` = `fc7733a85e2bd49aaf888a7149a77c586254bbb7`, `embed-html-node.test.mjs` = `60cc425603c19b5ed075869f640e55e0e992e533`, and release script = `18c3d1ee9d4d925011e7fd816e9b64af8b118aa7`.
- Executed the exact Node script with `node --experimental-strip-types --test`: **6/6 passed, 0 failed**. Direct isolated helper typecheck `tsc --noEmit --target es2022 --lib es2022,dom --skipLibCheck` passed.
- Found and corrected an actual release script bug: the old `branches: [main]` detection regexp did **not** match the actual YAML. The new guard rejects a `push:` trigger in `.github/workflows/deploy.yml` irrespective of its branch list.
- Tested the complete branch/remote/deploy guard in a local Git repository with a **local-only origin**, without Actions: push-enabled workflow stopped with exit **4**; manual-only workflow passed the guard and reached the actual TypeScript Node test (**6 passed**). Bash syntax check passed; wrong branch guard previously returned exit **2**. The local mock then cannot run `npm ci`/full site build, which **remains unverified**.
- GitHub comparison showed production `main` still has `on.push.branches: [main]` while PR #41 uses `workflow_dispatch` only. Do **not** merge without confirming this workflow change, the full test/build suite, and owner approval. GitHub Actions were not executed.

## 2026-11-07 — Release gate branch/history/deploy prevention exercised (follow-up)
- Confirmed PR #40 has been **merged**; existing PR #38 is superseded by that integration and was closed without merging. Main source readback shows the software CTA, catalog mappings, analytics, and HTML/live-growth checks present. PR #41 remains the draft for **post-merge** fixes.
- On the PR #41 branch, removed `on.push` from `.github/workflows/deploy.yml` while preserving `workflow_dispatch`, deployment lock, and release SHA checks. This changes the **proposed** workflow only; main production automation remains unchanged until an approved merge.
- Improved the PR #41 release gate to fetch latest `origin/main` and fail if not an ancestor; it also rejects a YAML `push:` trigger. Found and fixed a broken original grep expression, and synchronized the dependency-free integration test with the newer push-key matcher.
- Recreated the release gate script with an **exact matching Git blob SHA** (`18c3d1ee9d4d925011e7fd816e9b64af8b118aa7`); `bash -n` passed. Exercised the actual script against a temporary real local Git origin:
  - wrong branch → exit **2**,
  - feature branch lacking newest remote main commit → exit **3**,
  - auto-deploy `push:` workflow → exit **4**,
  - current main ancestry + manual-only workflow → exit **0** with **npm calls stubbed** and the real isolated embed Node tests executing (**6/6 passed**).
- Fetched exact Git blobs for `site/src/lib/tools/embed-html.ts` (`fc7733a85e2bd49aaf888a7149a77c586254bbb7`) and `site/scripts/embed-html-node.test.mjs` (`60cc425603c19b5ed075869f640e55e0e992e533`); `node --experimental-strip-types --test` yielded **6 pass, 0 fail**, and isolated `tsc --strict --noEmit` passed.
- These are genuine isolated tests and release **preflight** simulations; no `npm ci`, app-wide tests, actual Next build, live browser/GA4 verification or production deployment. GitHub Actions never invoked. PR41 remains **DRAFT/NO-GO** pending complete owner-accessible checkout and release gate.

## 2026-11-07 — Manual-only workflow trigger parser and actual Node regression execution
- Previous release-gate grep checks could miss valid YAML trigger spellings such as `on: [push]` or `on: push`. Introduced dependency-free `scripts/verify-manual-deploy.mjs`, which **fails closed** unless there is exactly one plain multiline `on:` block containing only `workflow_dispatch: {}`. Unknown, duplicate, inline and automatic event forms are rejected; no GitHub Actions are executed.
- Added `scripts/verify-manual-deploy.test.mjs` with four Node test groups: legitimate manual-only/CRLF, alternative automatic event forms, malformed or ambiguous manual events, and real CLI exit behavior (0 permitted, 4 rejected). Wired both the validator and `node --test` into `scripts/check-postmerge-embed-release.sh` before any npm installation or build. Updated the cross-feature integration test's expected gate wiring.
- Fetched the two scripts back from GitHub and reconstructed their **exact bytes** in the local container, verified with `git hash-object`: validator blob `17b6745426a8082120c1e28339e771890c250b9f`, test blob `2f9494fdd1292f40f9a19916c7e8b3bd33794066`. Ran `node --test verify-manual-deploy.test.mjs` under Node v22.16.0: **4 tests passed, 0 failed**. CLI allowed manual-only and rejected automatic workflow.
- This proves the isolated validator and its regression suite, **not** full repository `npm ci`, TypeScript/Vitest, Next.js build, 17-locale/mobile behavior, GA4 or deployment.
- PR #41 remains **DRAFT / NO-GO** until the owner runs `bash scripts/check-postmerge-embed-release.sh` in a full checkout, completes manual browser/consent checks, and approves the workflow behavior change.

## 2026-11-07 10:46 JST — independent integration and release-policy verification
- Compared PR41 to current `main`: 31 commits ahead and 0 behind at start. PR41 remained **open, draft, not merged**. PR41 review discussion contained no comments. Original PR38 and PR39 were closed without merge; PR40 was merged.
- Fetched **ten exact source files from PR41** using the connected GitHub API. Evaluated the seven dependency-free cross-PR assertions against the **current source text**: **7 passed / 0 failed** (result-first tool navigation, analytics functions, software CTA, trusted-only telemetry, share field privacy, validated URL restoration, HTML embed escaping). This is real-source assertion evaluation, **not** the full `node --test` run in an installed checkout.
- Independently fetched the existing `scripts/verify-manual-deploy.mjs` and its Node tests, copied both exactly into a local workspace and confirmed their **Git blob SHAs** match `17b6745426a8082120c1e28339e771890c250b9f` and `2f9494fdd1292f40f9a19916c7e8b3bd33794066`. Ran `node --test verify-manual-deploy.test.mjs`: **4 groups passed / 0 failed**, including CLI exit 0 for manual-only and 4 for automatic deploy; no GitHub Actions invoked.
- An equivalent second checker was briefly authored in this session, but the existing checker was already integrated by another update. Removed the two redundant `scripts/check-manual-deploy.*.mjs` files; retain **only** the pre-existing `verify-manual-deploy` implementation and its test in the release gate. There is no need for two divergent policies.
- Local `git ls-remote https://github.com/appdevelopsk/toolify.git HEAD` still fails DNS. Full `npm ci`, Vitest, typecheck, Next.js build, real desktop/mobile QA, production deployment and measured business uplift **remain unverified**.

## 2026-11-07 — Executed strict workflow event parser and pre-release checks
- Replaced the permissive `grep push:` check with `scripts/verify-manual-deploy.mjs`, which accepts **only** one explicit multiline `on:\n  workflow_dispatch: {}` block. This rejects `on: push`, `on: [push]`, inline YAML triggers, extra event types, duplicate event keys, quoted/ambiguous event declarations, and missing manual dispatch.
- Added independent `scripts/verify-manual-deploy.test.mjs`, wired direct validation and four Node test groups into `scripts/check-postmerge-embed-release.sh` before `npm ci`. Updated cross-feature Node integration source assertions to require the validator and its tests.
- Exact GitHub blob hashes reproduced via `git hash-object` on copied local files: verifier `17b6745426a8082120c1e28339e771890c250b9f`, validator tests `2f9494fdd1292f40f9a19916c7e8b3bd33794066`, release script `90b2a7c4581d7eb5530b070663bfdcdd3aa6483c`.
- Executed `node --test verify-manual-deploy.test.mjs` under Node 22.16.0: **4 passing tests, zero failures**. The direct CLI accepted manual-only and rejected `on: [push]` with exit **4**. `bash -n` of the exact release script passed.
- Fetched the real PR41 `.github/workflows/deploy.yml` from GitHub and ran the event-block scanner against its content: exactly **one on block, one manual dispatch event, zero unexpected event declarations**. The workflow remains only proposed in the PR; main itself has not been changed by these edits.
- No full repository checkout, `npm ci`, application-wide Vitest, Next production build, browser/GA4 QA, Actions execution or production deployment was performed. These remain strict release blockers; **DRAFT/NO-GO**.

## 2026-11-07 15:21 JST — production origin and live funnel evidence
- Checked the live public pages at `https://toolify365.com/en/tools/character-frequency`, `/en/software/text-batch-studio`, and `/en/software/json-studio` through the public web viewer. The character frequency tool shows an organic navigation CTA to Text Batch Studio; both software pages describe their browser-local free processing and explicitly say paid plans/payments are not available. A live page rendering **does not verify** the PR41 code or a deployment SHA.
- Audited `site/src/lib/config.ts`: when `NEXT_PUBLIC_SITE_URL` is unset, the fallback is `https://example.pages.dev`, which would produce wrong canonical/share/embed URLs in a production build.
- Updated `scripts/check-postmerge-embed-release.sh` to export `NEXT_PUBLIC_SITE_URL="https://toolify365.com"` for this production release gate, preventing missing shell/.env settings from silently switching the build to an example domain. Keep standalone local/staging builds separate from this production gate.
- The live site currently has no paid software purchases. `siteConfig.adsense.client` and slots are forcibly blank, with comments explaining an AdSense account disablement, so SEO/tool funnel growth alone cannot prove recurring or advertising revenue; affiliate paths, actual conversion measurement and a separately reviewed payment product are independent work.
- At review, PR41 remained open/draft with no review comments or individual commit statuses. The complete `npm ci`, `npm test`, `npm run build`, device QA, merge and owner deployment are still unverified in this environment because direct git host DNS resolution fails.
