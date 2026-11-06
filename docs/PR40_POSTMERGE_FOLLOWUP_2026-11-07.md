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
