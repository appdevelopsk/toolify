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
# Fetch the remote-tracking ref we actually verify, instead of trusting an old local ref.
git -C "$ROOT" fetch --no-tags origin main:refs/remotes/origin/main
if ! git -C "$ROOT" merge-base --is-ancestor refs/remotes/origin/main HEAD; then
  echo "[postmerge] ERROR: latest origin/main is not merged into this PR branch." >&2
  exit 3
fi
# Check EVERY GitHub workflow for manual-only triggers using one fail-closed policy.
# Do not execute GitHub Actions; inspect workflow YAML locally.
node "$ROOT/scripts/verify-manual-deploy.mjs" "$ROOT/.github/workflows"
node --test "$ROOT/scripts/verify-manual-deploy.test.mjs"
# The site config falls back to example.pages.dev when the public origin is unset.
# Pin this production release gate to the canonical origin to prevent wrong
# canonical, share and iframe URLs in an otherwise successful Next build.
export NEXT_PUBLIC_SITE_URL="https://toolify365.com"
cd "$ROOT/site"
echo "[postmerge] production origin=$NEXT_PUBLIC_SITE_URL"
echo "[postmerge] node=$(node --version) npm=$(npm --version)"
NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
if (( NODE_MAJOR < 22 )); then
  echo "[postmerge] ERROR: Node >=22 required for dependency-free TypeScript regression." >&2
  exit 2
fi
node --experimental-strip-types --test scripts/embed-html-node.test.mjs scripts/share-errors-node.test.mjs
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
