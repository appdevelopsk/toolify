#!/usr/bin/env bash
# Release gate for post-merge PR #41. No GitHub Actions, merge or deploy.
set -Eeuo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
EXPECTED_BRANCH="fix/toolify-postmerge-embed-safety-20261107"
ACTUAL_BRANCH="$(git -C "$ROOT" branch --show-current)"
if [[ "$ACTUAL_BRANCH" != "$EXPECTED_BRANCH" ]]; then
  echo "[postmerge] ERROR: expected $EXPECTED_BRANCH, found ${ACTUAL_BRANCH:-detached}" >&2
  exit 2
fi
cd "$ROOT/site"
echo "[postmerge] node=$(node --version) npm=$(npm --version)"
npm ci
npm run test:smoke-html
npm run test:integration
npm run typecheck
npm test
npm run validate
npm run audit:seo
npm run audit:i18n
npm run audit:index-policy -- --json
npm run build
echo "[postmerge] PASS: static tests and build; browser, consent and deploy checks remain manual."
