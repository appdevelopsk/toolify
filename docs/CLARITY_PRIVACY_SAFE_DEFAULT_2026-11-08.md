# Toolify365 — Clarity privacy-safe default (2026-11-08)

**State: source-only candidate / NO-GO until full build and browser QA.**

This branch is deliberately small. It changes Clarity loading behavior without changing the existing 223 tools, sharing mechanism, affiliate destinations, GA4, consent banner, or production deployment.

## Why

Toolify has automatic `?s=` result-sharing state that can contain user-entered values. `data-clarity-mask` can hide DOM content in recordings, but cannot be relied upon to remove values from captured URLs and link/referrer metadata. A pre-existing `NEXT_PUBLIC_CLARITY_PROJECT_ID` must not implicitly authorize session recordings on every tool page.

## Source changes

- `site/src/lib/analytics/clarity-policy.ts`: `canLoadClarity(projectId, urlPrivacyApproved)` returns true **only when** the ID is nonblank and approval is the exact literal `confirmed`.
- `site/src/lib/analytics/clarity.tsx`: the Clarity vendor tag is absent by default, even when the old ID remains configured. It is included only when `NEXT_PUBLIC_CLARITY_URL_PRIVACY_APPROVED=confirmed` is supplied at build time.
- `site/src/lib/analytics/clarity-policy.test.ts`: deterministic denied/allowed policy regressions.
- `site/.env.example`: documented the flag, its default-off semantics, and additional owner responsibilities.

To explicitly enable Clarity **only after** URL/consent risk review:

```bash
NEXT_PUBLIC_CLARITY_PROJECT_ID=<your-approved-project-id>
NEXT_PUBLIC_CLARITY_URL_PRIVACY_APPROVED=confirmed
```

Do not set the approval flag just to make tests pass. The flag is a build-time operator attestation, not proof of actual masking or consent.

## Verified

The exact `clarity-policy.ts` Git blob SHA `2baaa9b04093e3d9228e385f230e622004f4dd54` was reproduced locally and checked with `git hash-object`. TypeScript strict / noUncheckedIndexedAccess / noEmit passed. Node.js 22.16.0 executed **9/9** policy assertions covering absent/malformed approval, blank IDs, exact approval, and whitespace-padded nonempty IDs.

This does not verify the complete Next.js build, server rendering, browser consent flow or actual Clarity network requests. No PR, main merge, GitHub Actions run or production deployment was initiated.

## Owner release gate

1. Perform `npm ci`, `npm run typecheck`, `npm test`, `npm run build` in `site/` from the exact release candidate. Do not use GitHub Actions.
2. In a clean browser profile, verify no network request to `clarity.ms` appears when `NEXT_PUBLIC_CLARITY_URL_PRIVACY_APPROVED` is unset, even with an existing Clarity ID.
3. For any later opt-in, review EEA/UK consent independently, test URL/referrer/clicked-link masking for `?s=`, and verify share-state does not reach external scripts or recording metadata. If not demonstrably safe, leave Clarity disabled.
4. A deployment still requires normal manual release approval and post-deploy smoke and release-SHA verification.

**Scope limitation:** This hotfix reduces Clarity exposure by default; it does not remove `?s=` from browser-visible URLs, protect against all other third-party scripts, or establish actual growth uplift. The larger review branch remains separately NO-GO.
