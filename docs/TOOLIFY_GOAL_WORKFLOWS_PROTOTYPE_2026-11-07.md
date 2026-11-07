# Toolify365 Goal-Based Workflows Prototype — 2026-11-07

## Scope implemented on `feat/goal-based-tool-workflows-20261107`

- New localized landing page: `/{locale}/workflows`.
- Four workflows of three **existing, usable** tools each: data conversion, writing/publishing, shopping comparison, and scheduling.
- Homepage discovery CTA, desktop navigation (large screens), mobile menu link.
- Language-aware tool titles and step descriptions, plus workflow copy for all 17 supported locales.
- `/workflows` added to the sitemap of indexable locales (English/Japanese only); other 15 routes remain available but inherit `noindex` from the existing metadata helper.
- A `workflow_step_click` event for deliberate click-through, containing only static workflow ID, step number, static destination slug and locale. No user input/results/URLs.
- Unit tests for workflow IDs, step integrity, real tool registry references, locale label coverage, and fallback behavior.
- This is a navigation/learning prototype; it does **not** transfer inputs between tools, save personal data, add a paywall, or add ad units.

## Verification evidence

- GitHub readback of eight updated source files: 11/11 simple source-contract checks passed (route, links, sitemap, localization declarations, event path, step counts).
- All 12 referenced tool slugs appeared in the existing central registry.
- All 12 English and 12 Japanese tool-title/short-description translation files were fetched and contained both required fields.
- **NOT EXECUTED:** full `npm ci`, `npm run typecheck`, `npm test`, `npm run validate`, `npm run audit:seo`, `npm run audit:i18n`, `npm run audit:index-policy`, `npm run build`; this environment cannot clone the complete repo. The source-only checks above are not equivalent to these.
- **NOT EXECUTED:** real mobile/desktop/RTL browser QA, consent and GA4 DebugView QA, GitHub Actions, merge, deployment, Search Console submission.

## Release gate — NO-GO until passed

1. On an authorized local clone of **this exact branch**, run `cd site && npm ci && npm run typecheck && npm test && npm run validate && npm run audit:seo && npm run audit:i18n && npm run audit:index-policy && npm run build`.
2. Check en/ja page semantics, tool routing and step titles; check 15 other locales for fallback and RTL (`ar`). Validate responsive header at 640/768/1024px and mobile menu at narrow widths.
3. Test Google/Bing canonical + hreflang + sitemap parity: only `en`/`ja` indexable, noindex for other 15. Run live checks **after** deploying.
4. Verify consent-aware GA4 `workflow_step_click` in DebugView; create event-scoped `workflow_id`, `step_number`, `destination_tool` custom definitions if needed. Never log inputs.
5. Resolve the unrelated **draft PR #41** release hardening and manual-only workflow gate before introducing this work into production; keep all GitHub Actions uninvoked. Obtain review and use owner-controlled manual deployment. Do not merge/deploy solely on source checks.

## Outcome experiment (real humans rather than bots)

- Baseline: preceding 28 days by landing page, traffic source, locale and device (Google Search Console clicks, GA4 engaged sessions and engaged time, GA4 `calculate` events, pages/session).
- Segment organic and referral traffic, exclude known crawler/invalid traffic and bot spikes before comparing.
- Primary outcome: `calculate` or meaningful tool result achieved **after** a workflow click, measured per consented human session; if GA4 cannot join results, use `workflow_step_click` as a **navigation proxy only**.
- Secondary: proportion opening step 2 and step 3, engaged sessions, returning visitors, search clicks to `/en/workflows` and `/ja/workflows`.
- Guardrails: no deterioration in Core Web Vitals, tool completion, accessibility, organic clicks, consent behavior or ad-policy compliance.
- A/B rollout requires enough real sessions and comparable traffic mix; no positive uplift or revenue is claimed now.

## Caveats

`workflow_step_click` by itself is not evidence of a completed calculation. The prototype's browser-back navigation is intentionally simple: the journey page is the checklist, each utility remains a standalone page. Iterate with research before adding automatic local persistence, especially for finance/health/free-text tools.
