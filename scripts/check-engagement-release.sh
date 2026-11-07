#!/usr/bin/env bash
# Combined release gate for PR #40 (growth + engagement).
# Does NOT deploy, merge, or run GitHub Actions.
set -Eeuo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
EXPECTED_BRANCH="integration/toolify-growth-engagement-20261106"
ACTUAL_BRANCH="$(git -C "$ROOT" branch --show-current)"
if [[ "$ACTUAL_BRANCH" != "$EXPECTED_BRANCH" ]]; then
  echo "[integration] ERROR: checkout $EXPECTED_BRANCH before running the release gate (current: ${ACTUAL_BRANCH:-detached})." >&2
  exit 2
fi
# A passing build from a stale integration branch must not be released.
# Fetch remote main without triggering workflows; check ancestry, do not merge.
echo "[integration] Fetching latest origin/main for release ancestry check"
git -C "$ROOT" fetch --no-tags origin main:refs/remotes/origin/main
if ! git -C "$ROOT" merge-base --is-ancestor refs/remotes/origin/main HEAD; then
  echo "[integration] ERROR: integration branch is not based on the latest origin/main. Merge/rebase and rerun release gate." >&2
  exit 3
fi
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
