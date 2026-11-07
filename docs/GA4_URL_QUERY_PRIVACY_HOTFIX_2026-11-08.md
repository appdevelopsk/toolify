# Toolify365 — minimal GA4 URL query privacy hotfix (2026-11-08)

## Scope
Independent of the optional goal-workflow experiment.
- `site/src/lib/analytics/pageview-url.ts`: canonical query/fragment-free page view identity (`origin + pathname`).
- `pageview.tsx`: SPA views are path-based, not query-based; removes `useSearchParams` listener so changing `?s=` share data cannot spuriously produce another page_view.
- `events.ts`: all centralized custom GA4 events override implicit `page_location` and `page_path` using the same sanitized identity.
- `gtag.tsx`: initial GA4 config explicitly sets query-free `page_location`.
- Vitest helper unit tests and source wiring regression tests.

## Why
Existing share-state hooks can place typed values encoded in `?s=` in the browser's URL. Existing page view payloads contained `page_location: window.location.href` and `page_path` including query parameters; this is a privacy and high-cardinality measurement risk. This patch prevents those URLs from being intentionally sent through the audited GA4 paths. It does not delete historic analytics data and does not audit third-party SDK behavior or external referrers.

## Evidence (executed 2026-11-08)
- Local exact-source `pageview-url.ts` Git blob SHA `48ccf03e386526aa8c3288e634e7eb3beb3f6fc0` matches this branch.
- TypeScript 5.8.3 `--strict --noUncheckedIndexedAccess`: **PASS** for the isolated pure helper.
- Compiled helper and ran three Node runtime cases (sensitive query/hash removal; localized localhost path; encoded path preservation): **3/3 PASS**.
- GitHub readback of all six hotfix files: **6/6 source-contract checks passed**.
- **Not run:** full project `npm ci`, `npm run typecheck`, `npm test`, `npm run build`, real GA4 DebugView checks and mobile QA; no deploy.

## Manual release gate (NO-GO until verified)
1. In a complete authorized checkout of `fix/toolify-ga4-url-query-privacy-20261108`: `cd site && npm ci && npm run typecheck && npm test && npm run build`.
2. Browser: open any tool with `?s=` state; verify page_view and custom events use URLs without `?s=`; query-only input edits must not create extra page views. Check navigation across locale/tool routes continues to record page views once.
3. Verify consent handling and GA4 DebugView, mobile browser, and existing ShareBar result-copy behavior.
4. Coordinate with unmerged PR #41 manual-only Actions and VPS lock release gate. Main has automatic PR/merge workflow triggers. Do not create a PR, merge, start Actions, or deploy until these are reviewed and the manual release process is authorized.

## Status
**Source-only prototype with isolated runtime tests, not a production fix.** No direct traffic or revenue uplift is claimed.
