# Reddit Posts for Toolify

## r/webtools — post

**Title**: 120 free calculators/converters in 6 languages, all client-side — Toolify

**Body**:
Built a tool site: https://toolify365.com

120 single-purpose tools today. All math runs in the browser, no sign-up, no account. Categories:
- Finance: mortgage refi, lease-vs-buy, compound interest, CAGR, ROI, DTI, investment fee impact
- Health: BMI, body fat, BMR, macros, ovulation, pregnancy week
- Math: fractions, quadratic solver, prime checker, GCD/LCM, triangle
- Converters: ~30 unit converters (length, weight, volume, pressure, angle, data size, etc.)
- Text/Dev: base64, hash generator, JWT decoder, regex tester, CSV↔JSON, markdown↔HTML
- Datetime: timestamp, ISO week, workdays, timezone, countdown

Available in English, Japanese, Chinese (Simplified + Traditional), Korean, Spanish.

Looking for feedback on:
- mortgage-refinance-calculator and lease-vs-buy: do they help you make an actual decision, or are they just number-outputters?
- /tools index with 120 cards — instant search, or add more sort options?

---

## r/productivity — post

**Title**: I built 120 free calculators for daily use — curious if they're actually useful

**Body**:
Quick background: I built https://toolify365.com, a site with 120 free calculators and converters. No sign-up, all client-side, works on mobile.

The ones I find myself using as I work on the site:
- **timestamp-converter** — copy a Unix timestamp, instant human date
- **unit-price-calculator** — comparison shopping, "is the big pack actually cheaper?"
- **workdays-calculator** — "how many business days between now and the deadline?"
- **salary-converter** — hourly/daily/monthly/yearly, tax bracket preview
- **bmi-calculator** / **macro-calculator** — basic health tracking

6 languages: en, ja, zh-CN, zh-TW, ko, es.

Genuinely curious: for the finance tools (mortgage refi, lease vs buy, debt-to-income), do they output something *actionable* or just numbers? That's the failure mode I'm trying to fix.

---

## r/learnprogramming — possible post

**Title**: How I cut a 436KB shared JS chunk to 0 by separating metadata from component imports in Next.js 15

**Body**:
Brief write-up of a pattern I hit building a 120-tool Next.js site.

The problem: I had a central registry.ts that imported all 120 tool components:
```typescript
import bmi from "@/tools/bmi-calculator";
import length from "@/tools/length-converter";
// ... 118 more
```

Each import pulled in `Component.tsx` (a client component with useState/useMemo logic). Webpack bundled them all into one 436KB chunk — and because it was referenced by the `[locale]/layout`, it loaded on **every page**, including the home page.

The fix: separate metadata from component loading.

1. Each tool's `index.ts` exports only `ToolMeta` (slug, category, schema fields) — no Component import
2. `registry.ts` imports only metadata — 120 small objects, no UI code
3. The tool page uses `await import(\`@/tools/${slug}/Component\`)` dynamically

Result: the 436KB chunk is gone from layout. Home/about/tools-list pages: ~102KB JS. Tool pages: ~558KB (the component bundle is still ~456KB, but it only loads for tool pages, not every page).

The template-literal dynamic import bundles all 120 components into one 456KB tool-page chunk — which is fine, it's only loaded for `/tools/*` routes and gets cached.

Key takeaway: in Next.js App Router SSG, static imports at the top of a file that gets imported by your layout will be bundled into a chunk loaded on every page. Dynamic imports defer this to route-specific bundles.
