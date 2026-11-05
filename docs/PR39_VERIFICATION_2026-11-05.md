# PR #39 verification, 2026-11-05

## Confirmed
- Current main-to-feature comparison checked through GitHub connector.
- Local isolated `tsc --strict --noEmit` passed for `scenario-comparison.ts`, `scenario-resume.ts`, and `recent-recommendations.ts`.
- Local Node assertion harness passed 29 assertions for the same pure modules.
- Additional Vitest cases for invalid draft timestamps added to the PR.
- Public English percentage page currently renders the original calculator but not the new A/B and resume controls.

## Still blocking release
- Local `git ls-remote` could not resolve github.com, so a full repository checkout was unavailable.
- Full `npm ci`, project Vitest, app-wide TypeScript checks, Next.js build, browser/mobile QA, and GA4 DebugView were not performed.
- No GitHub Actions, PR merge, VPS deploy, or verified engagement uplift.

## Next required action
In an owner-accessible checkout run `bash scripts/check-engagement-release.sh`, then test English/Japanese desktop and mobile, blocked storage, expired draft, URL share, keyboard accessibility and consent. Merge and deploy only after all gates pass; measure 7/28-day GA4 engagement.

This file is a checkpoint, not a passing full-release certificate.

## Follow-up verification
- Rechecked local Git access: DNS resolution of github.com still fails.
- Re-ran isolated TypeScript strict compilation and 29 independent assertions: passed. This is not the app-wide build.
- Added maxLength=40 to both percentage number inputs to match URL restore and saved draft limits.
- English production page inspected: new compare and resume sections not found in fetched HTML.
- No merge, deployment, or verified engagement uplift.

## Shared-link restore hardening (2026-11-05)
- Added `scenario-share.ts` and `scenario-share.test.ts` to reject incomplete, malformed, oversized, and non-calculable URL payloads as a whole. Calculator fields are no longer partially restored from an invalid `?s=` payload.
- In the isolated local TypeScript harness, all four pure source modules passed strict checking. The existing 29 assertions and nine new share-state assertions passed (38 total). This is not a full repository Vitest run or Next.js build.
- No GitHub Actions, production deployment, or verified engagement uplift.

## 2026-11-05 — Related/recent navigation deduplication
- Updated recent recommendation selection to omit slugs already present in the existing related-tools section. This avoids using the same screen real estate for duplicate destinations.
- Added test cases for overlap and validated six cases with standalone Node assertions and TypeScript strict compilation. This is not a full React or Next build.
- HYPD live-browser and mobile Lighthouse audits could not run: the linked service reported the tools unavailable on the current plan. No external mobile performance score or rendered DOM result was obtained.
- Main merge and production deployment remain blocked by full-build/device verification, and no improvement in GA4 engagement has been measured.
