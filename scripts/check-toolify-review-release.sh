#!/usr/bin/env bash
# Manual release preflight for the integrated Toolify365 review branch.
# This NEVER merges, triggers Actions, connects to VPS or deploys.
set -Eeuo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
EXPECTED="review/toolify-growth-manual-release-20261108"
ACTUAL="$(git -C "$ROOT" branch --show-current)"
if [[ "$ACTUAL" != "$EXPECTED" ]]; then
  echo "[review] ERROR: expected $EXPECTED, found ${ACTUAL:-detached}" >&2
  exit 2
fi
MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
if (( MAJOR < 22 )); then
  echo "[review] ERROR: Node >=22 required" >&2
  exit 2
fi
# Runs the no-dependency test before npm install; validates the joined branch
# (all manual-only Actions triggers, route integrity and data-minimal GA4 URLs).
node --experimental-strip-types --test "$ROOT/scripts/tests/toolify-review-preflight.test.mjs"
# Existing PR41 gate checks origin/main freshness, workflow policy, VPS lock,
# HTML/embed smoke, npm ci, unit suites, SEO/i18n/index audits and Next build.
bash "$ROOT/scripts/check-postmerge-embed-release.sh"
echo "[review] PASS: offline source/build gate. Manual browser, consent and release verification remain."
