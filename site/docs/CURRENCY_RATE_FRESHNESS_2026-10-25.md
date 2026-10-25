# Toolify365 FX rate freshness (2026-10-25)

**Observed source risk:** `site/src/data/rates.json` fallback is dated 2026-09-03. `scripts/fetch-rates.ts` fetches live reference rates at prebuild and intentionally retains fallback on upstream network failure. The GitHub fallback date **does not prove** production currently serves stale rates; live builds may have refreshed successfully.

## Fixed
- The 31-currency calculator now shows a prominent, translated warning when embedded reference rates are >=7 days old (or malformed/future-dated), rather than relying solely on a small ordinary disclaimer.
- All 17 locale JSON files have `note.staleWarning` with a date placeholder; no bank account details or payment data collected.
- Prebuild `node scripts/check-currency-rate-freshness.mjs` validates USD base, finite positive rates, date and all localized warning strings. Old fallback rates produce a **warning**, not a failed global website build. `npm run check:currency` provides an independent check.
- Calculator formulas/amount handling, SEO indexability, robots, sitemaps and conversion rates were not rewritten. No unverified "live" conversion claim is made.

## Release checks
1. From `site/`: `npm run fetch:rates && npm run check:currency && npm run build`.
2. If the rate endpoint is unavailable and the fallback is older than 7 days, the UI must show the stale warning in all locales (test date 2026-09-03).
3. If the prebuild fetch succeeds with a current date, warning should not appear. The ordinary reference-rate date disclaimer remains.
4. Verify on real production `/en/tools/currency-converter` and `/ja/tools/currency-converter`; changes merged to GitHub do not prove live deployment.
5. Rates are indicative and bank/exchange spread differs; never make direct financial decisions on stale numbers.
