# Goal-based tool journeys — prototype (2026-11-10)

This is an **opt-in static experiment**, not a production rollout. Open `index.html` locally in a browser. It is intentionally `noindex,nofollow` and has no analytics, persistence, API calls, or external dependencies.

## Hypothesis
Visitors who start with a goal (e.g. project deadline) will more often discover and use a second tool than visitors shown only an unstructured tool directory. This is a product hypothesis, **not a measured outcome**.

## Scope
- Four curated workflows: deadlines, writing, data cleanup, and image preparation.
- Search and category filtering, keyboard-accessible buttons/links, responsive layout.
- Japanese and English presentation; this is not a 17-language production feature.
- Links go to Toolify365 pages. No user input or tool output is transferred across tools.
- Existing tool pages already have Related tools. The experiment instead tests a **goal-based starting point**.

## Local validation checklist
1. Open index.html with JavaScript enabled: all four workflows appear.
2. Search `deadline`, `納期`, and `CSV` and confirm expected filtered cards.
3. Switch Japanese ↔ English; headings, buttons and workflow labels switch.
4. Select each category and verify correct number of cards.
5. Use Tab / Enter to navigate all search/filter/links; inspect on 375px and desktop widths.
6. Follow each link and verify its destination and localized slug before any deployment.
7. Disable JavaScript: prototype does not work; a production version should use SSR and progressive enhancement.

## Production rollout gates
- Verify every route and locale; some tool slugs may differ from the illustrative paths and software links intentionally lead to the category page.
- Add server-rendered localized discovery pages and canonical/hreflang, with unique task-oriented content (avoid thin doorway pages).
- Run A/B split at the entry point and preserve the existing navigation as control.
- Measure privacy-preserving event names: journey_impression, journey_filter, journey_start, next_tool_open. Do **not** capture search terms, input values, medical/financial inputs or exported file contents.
- Primary metric: next-tool click-through per eligible human session; secondary: qualified engaged sessions, return rate, search CTR, and task completion. Inspect bot filtering before interpreting results.
- Guardrails: LCP/INP/CLS, bounce caused by broken links, session privacy, existing tool conversion.
- Never claim improved retention or deploy until a verified experiment is run.

## Notes
Links are plain anchors, not automatic recommendations after a result is calculated. Production integration in the site's real UI still needs implementation and tests.

## Production integration added on this branch (2026-11-11)
- The real homepage now renders four EN/JA goal journeys via `site/src/components/tools/ToolJourneys.tsx`, using registered tool slugs and localized tool names.
- All 12 destinations have been statically cross-checked against `site/src/lib/tools/registry.ts` (12/12 present).
- `JourneyLink.tsx` sends a fixed-ID `journey_tool_click` event through the site's existing consent-aware GA4 pathway. Parameters: `journey_id`, `destination_tool`, `locale`, `step_position`. No user inputs or search terms.
- `ToolJourneys.test.ts` defines link integrity tests. These tests were **added but not executed** in this session.
- UI is intentionally scoped to EN/JA; other 15 locales remain unchanged. That is not a complete 17-language rollout.
- The standalone `index.html` remains a historical prototype; do not publish it as an independent indexable page.

### Release verification still needed
1. `cd site && npm ci && npm test -- ToolJourneys.test.ts` (or `npx vitest run src/components/tools/ToolJourneys.test.ts`).
2. `cd site && npm run build`; check localized EN/JA homepage output and all 12 linked tool routes.
3. Verify mobile, keyboard navigation, dark mode, and consent behavior in a real browser.
4. Ensure GA4 custom dimensions are registered and event is observed only with valid analytics consent.
5. Deploy through the owner's normal release path; monitor human sessions, next-tool transitions, search clicks and page performance.
6. Do not conflate raw session duration with task success; optimize completed tasks and meaningful return visits.

No GitHub Actions run, production deploy, or retention/traffic uplift was verified by this change.

## Next-step journey navigation (2026-11-11)
- `JourneyNextStep.tsx` is now rendered immediately after the tool workspace by `ToolFrame.tsx`.
- The first and second tools in each journey offer the next tool; last tools have no redundant next-step block.
- This addresses the initial prototype's major friction: the visitor previously lost the sequence after opening the first tool.
- The action reuses `journey_tool_click`, with `step_position=2` or `3`. Track qualified click-through by distinct human session after consent, and do not misinterpret event counts alone as task completion.
- Static source review complete; **no executable test/build verification** available from this runtime because repository clone to the runtime failed (DNS resolution) and the PR head has zero GitHub check-runs.
