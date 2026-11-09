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

## Manual-only workflow safety

The initial isolated branch inherited CI/deploy/live-index workflows with automatic `push`/`pull_request` triggers from main. Those **three workflow trigger blocks have now been replaced with exactly `on: workflow_dispatch: {}`**. Other jobs, deploy instructions, and the five existing manual-only workflows remain unchanged.

The branch includes the audited, fail-closed parser and native tests from the main review prototype:
- `scripts/verify-manual-deploy.mjs` / `scripts/verify-manual-deploy.test.mjs`
- `scripts/tests/clarity-hotfix-policy.test.mjs`
- `scripts/check-clarity-hotfix-release.sh` — one operator-run local gate; **no GitHub Actions, merge or deployment is triggered**.

The real parser was applied to all eight workflow definitions retrieved from the isolated branch, and **8/8 passed**. All five synthetic unapproved event formats (including push, PR, schedule and combined manual/push) were rejected. This is source-only trigger validation; GitHub's base-branch PR workflows can still run before a safe main merge, so **do not create a PR or merge without reviewing that base-branch behavior**.

## Owner release gate

Check out the exact branch and run from the repository root:

```bash
git fetch origin fix/toolify-clarity-safe-default-20261108
git switch --track origin/fix/toolify-clarity-safe-default-20261108
bash scripts/check-clarity-hotfix-release.sh
```

The gate requires Node 22+, verifies the **latest** `origin/main` ancestry, rejects Clarity opt-in for this privacy-first release, inspects all workflow triggers, executes Node source regressions, then performs `npm ci`, TypeScript, Vitest, validation, SEO/i18n audits and a production Next.js build against `NEXT_PUBLIC_SITE_URL=https://toolify365.com`. It **does not deploy**.

In a clean browser profile after a successful build, check that no request to `clarity.ms` occurs even with a legacy project ID, and that the existing tools, shares, GA4, consent and navigation are unaffected. Any future opt-in requires separate URL/referrer/clicked-link masking and EEA/UK consent review. Manual release approval and postdeployment URL, sitemap, and release-SHA verification are separate obligations.

### Executed release-gate checks

Reconstructed `scripts/check-clarity-hotfix-release.sh` from the exact remote file (Git blob `d7a948cdb1421dc63a86576d64433e95931be11d`). Local `git hash-object` matched and `bash -n` passed. In a temporary local Git repository named for the exact release branch, with `NEXT_PUBLIC_CLARITY_URL_PRIVACY_APPROVED=confirmed`, executing the **actual** script returned **exit 5 / NO-GO** before any fetch, dependency install, Actions or deployment, as designed.

**Full site checkout/install/build and browser QA were not performed in this session.** The hotfix is therefore **NO-GO** for production deployment.

**Scope limitation:** This hotfix reduces Clarity exposure by default; it does not remove `?s=` from browser-visible URLs, protect against all other third-party scripts, or establish actual growth uplift. The larger review branch remains separately NO-GO.


### Further executed local validation (2026-11-08)

- Reproduced the GitHub source **byte-for-byte** for the new native test `scripts/tests/clarity-hotfix-policy.test.mjs` (**8b67d444ca954619c2843d784adf1f3297ca78dc**), `clarity-policy.ts` (**2baaa9b04093e3d9228e385f230e622004f4dd54**), `clarity.tsx` (**53b49456fe58cc6831188c161d717429014ba03e**), and `site/.env.example` (**ffca83d6d92813f171dae498dd83679f465b6254**). All four local `git hash-object` outputs exactly matched their GitHub blobs.
- Ran `node --experimental-strip-types --test scripts/tests/clarity-hotfix-policy.test.mjs` on Node v22.16.0 with the exact matching source. **4 tests passed, 0 failed** (7 invalid approval values, blank IDs, server component wiring, documented environment defaults).
- The standalone operator gate `scripts/check-clarity-hotfix-release.sh` also matched its GitHub blob **d7a948cdb1421dc63a86576d64433e95931be11d** and passed `bash -n`.
- Executed the actual gate in an isolated temporary Git checkout under the expected release-branch name. With `NEXT_PUBLIC_CLARITY_URL_PRIVACY_APPROVED=confirmed` it rejected the build as intended: **exit 5**. With an unset flag but a deliberately newer local bare `origin/main` not contained in the branch, it safely fetched that origin and rejected the outdated branch: **exit 3**.
- The actual `verifyManualDeployWorkflow` source parser (SHA **c19591c078f8e62557934da9942af0efb56ae0dd**) was run against **all eight source workflows fetched from this branch: 8/8 PASS**. Five synthetic automatic-event triggers (push, pull_request, schedule, combined trigger) were rejected. The other native parser test suite is committed but has not been run in the full repository.
- Still NOT verified: complete project dependency install, integrated Vitest, Next.js build, real browser network/consent QA, production release. No GitHub Actions were run.


### 2026-11-09 — Dirty-checkout guard and 5/5 exact-source hotfix tests

The isolated hotfix manual gate now checks **clean Git worktree** (tracked and untracked source) and executes `node --check` on its native test and workflow verifier plus `bash -n` on the release gate before GitHub fetch or expensive build steps. The clean-checkout failure exits **6**, independently of Clarity approval (exit **5**) and wrong branch (exit **2**).

The exact current GitHub sources were independently reconstructed in the local container, with `git hash-object` matching **all five**:
- `scripts/check-clarity-hotfix-release.sh`: `22abd874b2fcf52e7b4795f89a4167f962487549`
- `scripts/tests/clarity-hotfix-policy.test.mjs`: `9438d84bacafd64edfe5b5d06ae10c186e515f98`
- `site/src/lib/analytics/clarity-policy.ts`: `2baaa9b04093e3d9228e385f230e622004f4dd54`
- `site/src/lib/analytics/clarity.tsx`: `53b49456fe58cc6831188c161d717429014ba03e`
- `site/.env.example`: `ffca83d6d92813f171dae498dd83679f465b6254`

Executed `node --experimental-strip-types --test scripts/tests/clarity-hotfix-policy.test.mjs` on Node 22.16.0: **5 tests passed / 0 failed**, including newly added release-gate ordering/source tests. `node --check` and `bash -n` also passed.

Ran the exact script against a temporary local Git repository (not GitHub Actions, production or an app build): Clarity opt-in with existing project ID rejected (**exit 5**), untracked file rejected (**exit 6**), wrong branch rejected (**exit 2**). The previously verified stale origin/main guard remains in place.

**No full Next.js production build, iOS/Android/RTL browser tests, actual Clarity network verification, merge or deployment has been performed. Status stays NO-GO.**
