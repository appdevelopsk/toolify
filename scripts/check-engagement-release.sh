#!/usr/bin/env bash
# Combined release gate for PR #40 (growth + engagement).
# Does NOT deploy, merge, or run GitHub Actions.
set -Eeuo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT/site"
echo "[engagement] Node $(node --version), npm $(npm --version)"
echo "[engagement] Installing from package-lock.json"
npm ci
echo "[integration] Dependency-free HTML checks"
npm run test:smoke-html
echo "[integration] Cross-PR regression checks"
npm run test:integration
echo "[engagement] Type checking"
npm run typecheck
echo "[engagement] Vitest"
npm test
echo "[engagement] Site validation"
npm run validate
echo "[engagement] SEO audit"
npm run audit:seo
echo "[engagement] Localization audit"
npm run audit:i18n
echo "[engagement] Index eligibility policy audit"
npm run audit:index-policy -- --json
echo "[engagement] Next.js production build"
npm run build
echo "[integration] PASS: local test/static/build checks. Manual browser/GA4 QA and explicit deployment are still required."
