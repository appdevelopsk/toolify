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
