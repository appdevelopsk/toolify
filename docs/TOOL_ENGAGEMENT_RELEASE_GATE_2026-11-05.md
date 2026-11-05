# Toolify365: engagement & return-flow release gate (2026-11-05)

## Scope
PR #39 adds a return-visitor "recent tools" section on tool detail pages. It reuses the existing recent-slug store (max 8), existing localized search index, and existing tool layout, and adds GA4 `recent_tool_click` to separate revisits from category-based `related_click`. All 17 active locales use the existing `tool.recent` key and localized catalog titles. No inputs, clipboard contents, or calculated values are recorded.

The current site already has six related-tool links, Favorites/Recent sections, calculate, preset and copy event capture, FAQ and articles. Do not duplicate those features.

## Before merge (owner checkout, no GitHub Actions)
```bash
git fetch origin
git switch growth/tool-detail-recent-return-20261105
cd site
npm ci
npm run typecheck
npm run test
npm run validate
npm run audit:seo
npm run audit:i18n
npm run build
```
If any command fails, do not merge. PR stays draft until validated.

## Manual checks
- Fresh visitor: no recent-tools section, no unused search-index request and no flash/CLS.
- Returning visitor: current tool excluded; up to three distinct, valid, previously visited tools shown, in recency order.
- Removed/deleted slug: skipped; never generates broken tool links.
- Check `/en/tools/percentage-calculator` and `/ja/tools/percentage-calculator` on mobile and desktop (including keyboard).
- Existing Related tools and Favorites continue to function.
- On click, GA4 DebugView shows `recent_tool_click` with `tool_slug`, `locale`, `category`, `destination_tool`. Do not send user text, numerical inputs, generated output or URLs.
- Consent and analytics-blocker cases: navigation must continue if tracking is blocked.
- Verify AdSense slots and Core Web Vitals do not regress.

## Deployment / rollback
Owner merges approved PR after all checks and deploys via their normal VPS process (do not invoke GitHub Actions). Verify deployed release SHA, page response and GA4 DebugView. If navigation breaks, revert merge commit and redeploy. No production changes are implied by this document.

## GA4 configuration & success evaluation
GA4 Admin > Custom definitions: register **event-scoped** `destination_tool` (in addition to existing `tool_slug`, `locale`, `category`). GA4 does not backfill custom dimensions.

Record 28-day pre-release baseline and post-release 7-day/28-day windows at the same weekday mix, split by locale, traffic source and device. Review:
- Average engagement time per session (not unqualified wall-clock page time).
- Views per session and engaged sessions / sessions.
- `related_click` and `recent_tool_click` per 100 engaged tool-detail sessions.
- `calculate` per 100 tool-detail sessions and repeat tool visits.
- Ad revenue per 1,000 sessions and LCP / CLS / INP, with privacy/consent impact.

Decision rule: keep if repeat flows and meaningful tool engagement rise without worsened UX, performance, or monetization. Investigate regressions before broader rollout. Any improvement is a hypothesis until observed in GA4.

## Separate future scope
Scenario side-by-side comparison should be designed per calculator domain, not forced generically onto hundreds of tools. Input-resume requires explicit privacy and storage policies; **not implemented** in this PR. Both are deliberately excluded from an untested blanket rollout.

## Added domain-specific workbench: percentage calculator

- A/B comparison: save current scenario as A in React state, compare it with changing B. Difference is shown only when modes match, to avoid comparing unlike units. No data is stored by A/B alone.
- Opt-in resume: user explicitly saves numeric percentage parameters to `localStorage` for at most 7 days. Restoring or deleting requires a button press. No auto-save, analytics payload of input values, API transmission or forced restoration. Browser storage errors must not prevent basic calculator use.
- Copy: all 17 active locales in `scenario-copy.ts`; no changes to unrelated calculators.
- New tests in `scenario-comparison.test.ts` and `scenario-resume.test.ts`. The tests are authored but **not executed**.
- QA: try comparison with equal and different calculation modes, denominator zero, invalid/empty inputs, negative values; verify save/resume/delete, reload, expired draft, blocked storage, direct `?s=` share links, private mode and locale switch. Verify no input value appears in GA4.
- Privacy copy should be reviewed before deployment; values can persist in the browser up to 7 days if explicitly saved. Users on shared devices should be able to delete them.

These features are scoped to percentage calculator because comparison semantics and suitable storage policies differ across tools. They are not a claim of fleet-wide support.

## Current release status

Draft PR only; no successful `npm ci`, Vitest, TypeScript compilation, production build, manual device QA, main merge, VPS deployment or measured engagement uplift. No GitHub Actions run. Owner must pass all checks and approve before merging.
