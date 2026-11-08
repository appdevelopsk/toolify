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

# Google's Enhanced Measurement may send page_views for browser history changes
# even if our config sets send_page_view:false. It can double-count navigation
# and collect private share-state query parameters. This is a GA4 stream setting,
# not a code setting. Human verification is mandatory before release approval.
if [[ "${TOOLIFY_GA4_HISTORY_PAGEVIEWS_DISABLED:-}" != "confirmed" ]]; then
  echo "[review] NO-GO: disable GA4 Enhanced Measurement > Page views >" >&2
  echo "[review] Page changes based on browser history events, then use GA4" >&2
  echo "[review] DebugView to verify exactly one sanitized page_view per route." >&2
  echo "[review] Set TOOLIFY_GA4_HISTORY_PAGEVIEWS_DISABLED=confirmed only after" >&2
  echo "[review] verifying the stream setting. No automated deployment performed." >&2
  exit 4
fi
echo "[review] Static checks passed; GA4 owner setting attested. Browser/consent and deployment remain manual."
