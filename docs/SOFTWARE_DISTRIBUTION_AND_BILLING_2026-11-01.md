# Toolify365 Software: distribution and billing implementation plan

Status: engineering draft, **not shipped**. PR #18 branch. No GitHub Actions, app-store submission, deployment or purchase activation performed.

## Product contract

- All products start Free. Web free versions run in-browser where feasible.
- Windows and macOS: build signed/notarized desktop apps and distribute through verified Microsoft Store/Mac App Store product pages. Direct signed downloads may be added once artifacts, checksum, update channel and code-signing are verified. Do not advertise download buttons before that.
- iOS/iPadOS and Android: ship native mobile apps only when mobile-specific value exists. Do not mass-publish WebView wrappers.
- Cross-platform UI: Flutter is a candidate for Windows/macOS/iOS/Android where native file access and store services justify it. The Next.js Web code remains independent; share domain contracts, not UI binaries.
- All 17 languages should be translated/reviewed before marketing a product as available in that language. Existing site's localized core pages are retained.
- Keep free tiers meaningful; no interruptive ad placements during a file processing task.
- UI catalog target metadata at `site/src/lib/software/distribution.ts` is the source of truth. Planned products have no download URL.

## Entitlement backend gate (before taking real payments)

1. Establish a durable database keyed by authenticated account, product, platform provider, provider transaction ID, purchase type, validity and refund/revocation state.
2. Support Stripe checkout on Web/direct desktop; confirm via signed and idempotent webhook, never the browser redirect. Do not store raw payment details.
3. Verify App Store Server API / signed transaction data, Google Play Developer API + real-time developer notifications, and Microsoft distribution-specific purchase proof before activation. Review current store policies for external-purchase links and cross-platform access at submission time.
4. Durable per-user/per-product subscription and perpetual entitlements. Perpetual applies only to an explicit version/features scope; remote AI credits are separately metered.
5. Server-side authorization on every paid API request. Offline desktop licenses must be signed, device/time limited as appropriate, revocable, and not contain shared secrets.
6. Reconcile refund, expiry, chargeback, cancellation and family sharing / restore purchases. Distinguish cancel-at-period-end from immediate revoke.
7. Secure quota enforcement in backend for hosted/AI jobs; front-end-only anonymous limits are for UX, NOT a security/paywall boundary.
8. Web desktop storefront must publish privacy policy, refund terms, support, price/tax disclosures and regional legal compliance before payment goes live.
9. Rollout: sandbox purchases -> test revocations/restores -> privacy/security audit -> store review -> production enablement.

## Distribution matrix

| Product | Web | Windows | macOS | iOS | Android |
| --- | --- | --- | --- | --- | --- |
| CSV Cleaner, JSON Studio, Text Batch Studio | Free browser MVP | planned | planned | – | – |
| PDF Toolkit, Bulk Image Studio | planned | planned | planned | planned | planned |
| File Organizer | – | planned | planned | – | – |
| Excel Formula AI | planned | – | – | planned | planned |
| SEO Audit | planned | – | – | – | – |
| Website Monitor, Invoice Maker | planned | – | – | planned | planned |

## Release prerequisites (each platform)

- Web: build, typecheck, tests, translation QA, accessibility, security headers and production smoke test.
- Windows: packaged EXE/MSIX, signing, antivirus false-positive checks, auto-updates, uninstall, installation tests.
- macOS: signed/notarized app, sandbox entitlements for store app, DMG testing, Apple Silicon and Intel compatibility decision.
- iOS/Android: native feature set, platform purchase SDK, app privacy disclosures, store metadata/screenshots, tester rollout and review.
- Metrics: product impression, open, process completed, limit reached, upgrade intent, checkout initiated, verified purchase, D1/D7 and refunds, with no private file content in analytics.

## Current technical status

Three in-browser utilities are developed on the PR branch; the other seven are planned only. No app binaries, native projects, checkout, entitlement server or public store listings have been produced. Do not merge or deploy before tests and code review.
