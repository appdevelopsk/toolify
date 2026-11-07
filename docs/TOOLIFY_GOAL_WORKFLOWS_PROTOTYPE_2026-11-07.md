# Toolify365 — user acquisition & task-focused engagement prototype
Updated: 2026-11-08 JST. Branch: `feat/goal-based-tool-workflows-20261107`

## What is implemented
- A 17-locale goal-based guide at `/{locale}/workflows` with four journeys: data cleaning, writing, shopping, scheduling (12 existing working tool slugs; 3 steps each).
- Homepage CTA plus four goal cards, large-screen header link, mobile menu link.
- A contextual **next useful step** immediately after the existing tool workspace on eight non-terminal steps, before existing related tools and ads. No existing ad units removed or changed.
- `WorkflowToolLink` includes only an approved `?wf=<id>&ws=<1..3>` navigation tag, validated against the current tool slug; it is not an arbitrary redirect or data payload.
- `workflow_step_click` records deliberate navigation; `workflow_calculate` records a human-origin input/change with visible result on a validated workflow route. Existing `calculate` instrumentation remains unchanged. Analytics passes fixed IDs, step numbers and locale, no typed values or result text. This is an **interaction proxy** and not proof the task was completed.
- New Vitest unit and source-wiring tests. `steps.ts` separated from 17-locale copy to avoid shipping all translations in the client attribution helper.
- No data is passed from one tool to another. No new persistent browser storage, paywall, ad, or outbound placement.

## SEO decision: pilot **noindex** for every locale
The site's existing intentional allowlist consists of 29 demand-supported core tool slugs. Only four of the 12 chosen steps are core-indexable: `date-calculator`, `workdays-calculator`, `timezone-converter`, `unit-price-calculator`. Indexing a thin, 12-tool aggregation before search-intent evidence risks undermining current recovery strategy.
- The new `/workflows` guide is explicitly `noindex,follow` in **all 17 languages**, and is absent from `sitemap.ts`.
- Existing canonical, locale and sitemap policies for tools are unchanged. Guide stays reachable to humans from internal navigation.
- Later indexing requires distinct substantial content, demonstrated query demand and separate SEO review; do not automatically release all languages for indexing.
- Focus real-user acquisition on improving existing demand-proven tool entry pages and the quality of their next actions, not creating bulk indexed URLs.

## Executed validation
1. GitHub readback: **16/16 source-contract assertions passed** across 13 relevant files (route, noindex/sitemap parity, entrypoints, 17 locale labels, ordering, step attribution, human input guard, event privacy).
2. `steps.ts` was reconstructed exactly from GitHub in the local runtime; its **Git blob SHA `3b28219344f90589f15f5753e46082db45c3985b` matched the branch**.
3. Ran `tsc --noEmit --strict --noUncheckedIndexedAccess` on that exact `steps.ts`: **PASS**.
4. Compiled `steps.ts` with global TypeScript and ran dependency-free `node --test`: **3/3 test groups PASS**, validating four workflows/12 unique tools, every allowed route attribution, tampered and duplicate query rejection, and eight follow-up mappings.
5. Previously verified all 12 tool slugs in the central registry and all 12 en + 12 ja tool title/shortDescription translation files.
6. Search Console connector (site owner access): free finalized **2026-11-02–2026-11-04** view returned **no opportunity candidates** at minImpressions=1 (also mobile). Three days is insufficient to conclude traffic/demand is absent.
7. HYPD GA4: connected properties exist but **none selected**, so a 28-day engagement baseline is **unavailable**: https://app.hypd.ai/sources?utm_source=mcp&utm_content=none_selected .
8. HYPD mobile Lighthouse: **plan_denied**, not run: https://app.hypd.ai/plans?utm_source=mcp&utm_content=tool_access_plan&utm_term=lp_audit_lighthouse .
9. Container `git ls-remote https://github.com/appdevelopsk/toolify.git HEAD` failed due DNS resolution, so full source clone, npm install and complete project build could not be executed here.

## Release state — NO-GO
- **Not executed:** full `npm ci`, project-wide `npm run typecheck`, Vitest, `npm run validate`, SEO/i18n/index audits, `npm run build`, real browser device/RTL/consent QA, GA4 DebugView, release deployment, signed release SHA live verification, or real-user outcome study.
- Main's `.github/workflows/ci.yml` still has `pull_request` trigger and `deploy.yml` has main push auto-deploy. Creating a PR would automatically invoke Actions, contrary to the current no-Actions release safety preference. **No PR was opened, no merge performed, no Actions manually run.**
- Existing draft PR #41 is still open, unmerged and explicitly NO-GO until its own manual-only workflow changes and tests are accepted. This feature branch stays independent and ahead of main; resolve PR41 before any release.

## Owner release checklist
1. Adopt validated manual-only CI/deploy workflow fix (PR #41) with authorized review **without auto Actions side effects**. Verify all workflow event triggers before opening this feature PR or merging main.
2. In an authorized full checkout on the *exact feature branch*: `cd site && npm ci && npm run typecheck && npm test && npm run validate && npm run audit:seo && npm run audit:i18n && npm run audit:index-policy && npm run build`; stop if anything fails.
3. Browser QA on desktop/mobile `en`, `ja`, RTL `ar`, a representative fallback locale, responsive 640/768/1024 widths, all 12 tool links and eight next-step links; consent and share-state URL query coexistence.
4. Confirm source of `workflow_calculate` events in GA4 DebugView and verify event-scoped `workflow_id`, `step_number`, `tool_slug`, and `destination_tool` custom definitions only after GA4 property selection; ensure consent applies.
5. Manually deploy from the reviewed main commit with VPS deploy lock and SHA verification; run live smoke and compare engaged real sessions, `workflow_step_click`, `workflow_calculate`, tool `calculate`, actual page usage, and LCP/INP/CLS. Separate bot spikes from organic human traffic.

## How to judge success
Primary: higher *meaningful tool interactions per consented human session* without lower individual-tool completion or performance.
Secondary: step 2/3 progression, return sessions, organic clicks to established indexable tool pages and engagement by locale/device/traffic source.
**No verified increase in users, dwell time, sales or search ranking is claimed.**


## 2026-11-08 08:10 JST follow-up — performance, privacy and bot-quality hardening

**Additional implementation**
- Avoid hydrating 17 complete workflow-copy arrays in the shared mobile menu: server `Header` now passes only the localized `workflowNav` string. Added a source regression check for the prop and no client copy import.
- Discovered a pre-existing GA4 data-leak and overcount risk: `PageViewTracker` transmitted full URL query strings (including `?s=` containing tool share state) and reacted to query changes. Added `sanitizePageViewUrl`, stripping all query/hash from `page_path` and `page_location`, and made SPA page views depend only on pathname.
- Also override `page_location` with query-free pathname in all custom GA4 event emissions and initial gtag config. This protects against implicit query collection in other event paths; it does NOT audit external third-party tracking SDK behavior or previously captured analytics data.
- Track only genuine browser-origin activations in `WorkflowToolLink` using `event.nativeEvent.isTrusted`; synthetic JS `.click()` no longer inflates workflow navigation metrics. This is a basic hygiene filter, **not** bot detection against automation that generates trusted events.
- New `pageview-url.test.ts` and `privacy.wiring.test.ts` cover query stripping, event wiring, and trusted-interaction guards.

**Executed validation**
- Current GitHub branch `pageview-url.ts` Git blob SHA **48ccf03e386526aa8c3288e634e7eb3beb3f6fc0** independently matched the exact file recreated in the local test workspace. Ran TypeScript 5.8.3 with strict, noUncheckedIndexedAccess: **PASS**. Compiled helper and executed three Node runtime cases: **3/3 PASS** (sensitive query and fragment stripped, locale path and port preserved, encoded path retained).
- Current `steps.ts` Git blob SHA **3b28219344f90589f15f5753e46082db45c3985b** independently matched the local test file. Strict TypeScript: **PASS**. Node runtime assertions passed for four curated journeys, 12 unique steps, eight correct continuations, 12 valid context matches, 12 wrong-tool rejections, and five tampered/duplicate query cases.
- GitHub readback from this feature branch: **12/12 source-contract checks passed** across 11 files, including mobile bundle, noindex parity, trusted events and query sanitizer wiring. These are **not a substitute** for production Next.js build or full Vitest suite.
- Latest checked live homepage at `https://toolify365.com/en` does not contain the new guide: no production rollout was performed.
- Metricool brand has **no connected social network**, so outbound social posts cannot be scheduled: https://app.metricool.com/brands/connections?blogId=7709450
- Toolify GA4 is connected in HYPD but no property is selected; select it at https://app.hypd.ai/sources?utm_source=mcp&utm_content=none_selected before requesting the 28-day baseline.

**Release status remains NO-GO**
- Container cannot resolve github.com for a full clone, and cannot run the full npm/Next.js suite in an owner checkout here.
- Existing `main` auto-triggered PR/merge workflows and unmerged PR #41 manual-only safety work remain unresolved. No PR creation, Actions run, merge, deployment, public Search Console submission or actual performance uplift is claimed.
- Manual owner QA must additionally test that normal links and result-share URLs still work, GA4 `page_location` has **no** `?s=`, and route-based pages/session reporting is preserved with the new path-only counting policy.
