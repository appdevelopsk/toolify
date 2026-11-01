# Toolify365 Homepage v2 — final design review (2026-11-01)

Status: implementation on PR #18, **NOT merged, built or deployed**. No GitHub Actions used.

## New visual hierarchy
1. Search-led hero: single clear action invoking existing global search. Removed duplicated full search index payload and the long row of category chips.
2. Popular tools: six priority cards shown immediately after hero. The list remains driven by existing CORE_TOOLS_BY_DEMAND ranking.
3. Category grid: compact two-column tablet / four-column desktop links, preserving routes to /tools category sections.
4. Free software: three actual browser MVP products with visible free tier; seven planned products stay within software catalog and never appear as downloadable builds.
5. Favorites, recent usage, specialty content, trust, advertisements, and related services remain below primary discovery.
6. Full 223-tool accordion removed from homepage; dedicated /tools directory remains reachable from prominent links.

## Principles
- A short, task-first homepage. No falsely advertised native app downloads or subscription checkout.
- Preserve existing /tools pages, metadata, localized routes, translations, analytics and search matcher.
- Keep one canonical search index and UI implementation.
- Accessibility: clear focus states and 44px+ primary buttons, keyboard search and legible contrast.
- Ads after core discovery, not between heading and primary action.

## Mandatory QA before merge
- Type-check, unit tests, i18n audit, SEO audit, production build, and Lighthouse locally (not GitHub Actions).
- Desktop / mobile viewport screenshot comparisons at 375, 768, 1440 px; RTL ar and en/ja locale smoke tests.
- Check navigation, header search overlay, search trigger keyboard focus, category anchors, dark mode and consent/ad placement.
- Ensure the dedicated /tools page remains an accessible complete directory, including no orphaned tools.
- Record pre/post real-user metrics: homepage-to-tool CTR, search usage, core tool success, bounce/engagement, LCP/INP/CLS. No performance uplift claimed before measurement.

## Rollout
PR review -> local tests -> manual browser QA -> merge -> user-managed VPS deployment -> production smoke checks -> compare metrics after traffic.
