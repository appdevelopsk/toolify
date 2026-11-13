# Search → Active Tool Funnel (2026-11-13)

## Purpose

Measure whether a human visitor **opens a result found via Toolify365's internal
search** and then **actively changes an input** on that exact tool. This is
different from counting crawlers, page views, default pre-rendered results, or
mere result impressions.

## Events

| GA4 event | When | Key parameters |
| --- | --- | --- |
| `tool_search` | Search query has settled for 600 ms **and results are ready** | `query_length`, `results_count`, `locale`, `source` |
| `search_result_click` | Trusted same-tab result click or trusted Enter selection | `tool_slug`, `search_source`, `result_position`, `locale` |
| `search_tool_interaction` | First `calculate` event for the clicked, exact tool within 10 minutes and same tab | `tool_slug`, `search_source`, `result_position`, `locale` |
| `calculate` | Trusted input/change on a tool (once per tool mount), as defined by ToolInteractionTracker | Existing per-tool fields |

`search_source` is one of `header` and `tools_page`; `result_position`
is 1–10. These are small categorical values, never query strings. Users who
open links in a new tab are **not** attributed to a same-tab interaction.
Successful navigation alone is **not** counted as tool use. A calculation
event is active input interaction, **not proof of correct results or task
completion**.

Search attribution uses `sessionStorage` only. It stores the clicked tool slug,
source, rank and timestamp, expires in 10 minutes, and is consumed at most once.
It stores **no search phrase, user-entered value, generated result, email,
browser ID, or personal data**. When sessionStorage or GA4 is unavailable,
navigation keeps working. All GA4 events respect existing Consent Mode.

## GA4 setup and comparison

In **GA4 Admin → Custom definitions**, register event-scoped dimensions for
`tool_slug`, `search_source`, `result_position`, and `locale` if they are
not registered already. Verify their property-specific availability first;
definitions are generally not retroactive.

Use a GA4 **funnel exploration** at session/user level:

1. `tool_search`: number of search sessions and fraction with `results_count=0`.
2. `search_result_click`: proportion of search sessions that open a tool.
3. `search_tool_interaction`: proportion of result-clicking sessions that
   then actively interact with the exact destination.

Break down by `locale`, `search_source`, `result_position`, device and
country (the latter two are GA4 dimensions). Review engaged users and organic
search landing sessions separately so marketing bots cannot inflate
performance claims. GA4's bot filtering is imperfect; cross-check server
logs and suspicious source/country spikes. Do not claim every event is a
verified person.

**Release gates:** `npm test`, `npm run typecheck`,
`npm run audit:i18n`, `npm run audit:seo`, `npm run build` and CI Lighthouse.
For production, compare the public release SHA to the merged commit and
validate clicks with test-user traffic excluded from business KPIs.

## Current external-data limitation

At time of writing, HYPD's GA4 integration reported **no properties selected**
for this account. Select Toolify365 at
https://app.hypd.ai/sources?utm_source=mcp&utm_content=none_selected
before reading actual country, conversion, or retained-user figures.
Do not manufacture traffic forecasts from code changes.
