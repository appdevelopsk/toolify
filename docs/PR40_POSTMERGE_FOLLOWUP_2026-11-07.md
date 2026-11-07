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
