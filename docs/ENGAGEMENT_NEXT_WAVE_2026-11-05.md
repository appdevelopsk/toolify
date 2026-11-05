# Toolify365 — engagement improvement follow-up (2026-11-05)

## Implemented in draft PR #39
- Recently visited links on tool pages, limited to 3; now exclude both current/unknown/duplicate and any destination already shown by the existing related-tools row.
- Percentage-calculator A/B comparison and explicit local draft save/restore/delete, 7-day expiry, 17-language text.
- Analytics: `recent_tool_click` and `scenario_action` (IDs only; no user-entered numbers).
- Standalone verification: pure-module strict TypeScript passed; 29 earlier independent assertions, 9 shared-state checks and 6 recent-link-selection checks passed separately. **Not full project Vitest/Next build**.

## Current release blocks
1. Full checkout cannot be fetched from this environment due to DNS resolution of github.com. Run `bash scripts/check-engagement-release.sh` on an owner-accessible clone.
2. Manual en/ja desktop/mobile keyboard, share-link, unavailable browser storage, expired draft, consent and GA4 DebugView QA.
3. Merge only after those checks; VPS deployment and post-deploy smoke test belong to owner.
4. HYPD live-browser and Lighthouse endpoints were not available on the connected plan, so no real mobile performance score was obtained. HYPD GA4 account summaries returned no **selected** properties; do not claim measured engagement improvements.

## Additional work worth doing after release, in impact order
**P0 — use evidence, not time-on-page alone.** Establish last 28 days vs preceding 28 days: engaged sessions, engagement rate, average engagement time per session, pages/session, `calculate`, `recent_tool_click`, `related_click`, `scenario_action`, affiliate click and revenue. Break down by tool landing page, device, locale and source. Deduplicate returning navigation and avoid counting passive tabs as improvement. Register necessary GA4 custom dimensions (event-scoped `destination_tool`, `action`) if they are absent; verify consent first.

**P1 — test on high-intent tools only.** Pick the top 5 landing pages from GA4 with enough traffic and the lowest engaged-session ratio; verify tool result is visible in first mobile viewport and no ad obscures it. Prioritize task completion, then a single logically related next action. Do not add generic link blocks or timers just to inflate average duration.

**P2 — contextual workflows.** After successful % calculator comparison, test task-specific save/compare for loan, tip and other numeric tools only if a privacy review confirms their inputs are safe for local persistence. For free-text, health, financial identifiers or uploads, avoid blanket auto-save.

**P3 — speed and A/B rollout.** Measure mobile Lighthouse LCP/INP/CLS, test reserved ad space and lazy loading, validate language navigation and ad placement. Roll out behind a tested feature gate or short evaluation window when analytics/sample size supports it. Roll back if tool completion or mobile performance worsens.

## Operational release policy
PR #39 stays draft / NO-GO until full build and real-device QA succeed. This document is a plan for further implementation, not a claim of production changes, conversion lifts or GA4 access.

## Additional implementation: result-first navigation (2026-11-05)
- `ToolFrame` now shows the existing related tool row and the new recent tool row **immediately after the workspace, before the below-result and banner ad units**. Both ad units, the in-article ad, and sidebar ad are retained; this is an ordering change, not an ad removal.
- The previous related/recent deduplication means suggestions maximize distinct follow-up actions.
- Added `site/src/components/tools/ToolFrame.order.test.ts` to enforce source-level order and retained ad components. This test was committed but has NOT been run inside the project's Vitest environment.
- GitHub code readback confirmed the order after commit; visual, iPhone, ad placement and RPM impact still require real device QA and post-release measurement.
- `percentage-calculator` was verified present in `MANUAL_SHARE_SLUGS`: its own `useShareableState` intentionally disables generic URL writing from `useAutoShareableState`, so this PR does not need to add a second serialization path.
- GA4 cannot currently be queried with the selected connection: HYPD reports connected GA4 accounts but no selected property. Select the Toolify365 property before any baseline analysis; do not infer current engagement from other businesses.
