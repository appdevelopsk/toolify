# Architecture

## Stack

| Layer | Choice | Rationale |
|---|---|---|
| Framework | Next.js 15 (App Router) | i18n routing, ISR, ecosystem |
| i18n | next-intl 3.x | App Router native, hreflang automation |
| Style | Tailwind CSS | Mass-production consistency |
| Lang | TypeScript (strict + noUncheckedIndexedAccess) | Catch errors before deploy |
| Hosting | Cloudflare Pages | Unmetered bandwidth — critical for ad sites |
| Analytics | GA4 + Search Console | Same as App side |
| Ads | Google AdSense (manual placement) | +30-50% vs Auto Ads |
| Build | npm | No pnpm/yarn dependency |

## Why these choices

### 1 domain, not many

A multi-domain strategy distributes BAN risk but multiplies AdSense reviews,
sitemap maintenance, and dilutes domain authority. We start with 1 domain. If
it gets traction, we can split into 2-3 thematic domains later. We do not
fragment into 100.

### Cloudflare Pages, not Vercel

Vercel charges for bandwidth. A viral tool can produce a $1000+ surprise bill.
Cloudflare's free tier is unmetered, which removes that risk class.

### Manual ad placement, not Auto Ads

Auto Ads picks slots automatically but tends to over-serve (CLS hits,
fold-region intrusion). Manual placement at 4 carefully chosen slots
(banner, in-article, below-result, sticky-sidebar) yields 30-50% more
revenue with better Core Web Vitals.

### Static + selective ISR

Most tools are pure-client computation — fully static. Tools that ingest
external data (rates, weather) use Incremental Static Regeneration with
short revalidation windows, which keeps SEO fresh without the cost of full SSR.

## Routing

```
/[locale]/                      → home
/[locale]/tools                 → all tools index
/[locale]/tools/[slug]          → individual tool
/[locale]/{about,privacy,terms,contact}
/sitemap.xml                    → auto-generated, hreflang-complete
/robots.txt
/ads.txt                        → AdSense required
```

Middleware (`src/middleware.ts`) handles locale detection and redirects.

## i18n strategy

- 17 locales defined in `lib/i18n/locales.ts`
- `active: true` flag controls which appear publicly (Phase 0: en, ja)
- Locale-prefixed URLs always (`/en/tools/x`, never bare `/tools/x`)
- `hreflang` tags in metadata + sitemap include all active locales + `x-default`
- Common UI in `src/messages/<locale>.json`
- Per-tool content in `src/tools/<slug>/messages/<locale>.json` — automatically merged via the loader

## Tool registry

- `src/lib/tools/registry.ts` is the single source of truth
- New tools: import + push to TOOLS array
- Routing, sitemap, i18n loader, and related-tools widget all derive from it

## Schema.org structured data

Each tool page emits:
- `SoftwareApplication` (always)
- `BreadcrumbList` (always)
- `FAQPage` (if `hasFaq` and FAQ has entries)
- `HowTo` (if `hasHowTo` and steps exist)
Site-wide:
- `Organization` and `WebSite` on every page

## Performance

- `preconnect` to googleads, googletagmanager
- All ads lazy-loaded except the top banner
- Static generation: every locale × every tool is pre-rendered at build time
- View Transitions API enabled for SPA-like nav

## Privacy & consent

- IP anonymization on GA4
- Consent Mode v2 default = denied for all 4 categories
- Banner sets local-storage flag; updates gtag consent
- AdSense script loads regardless (per Google policy) but ads honor consent
