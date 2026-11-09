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
# Do not validate or package a workspace with tracked modifications or
# unexpected untracked files. A local build could otherwise differ from the
# reviewed GitHub commit even while its branch name matches.
if [[ -n "$(git -C "$ROOT" status --porcelain --untracked-files=normal)" ]]; then
  echo "[review] NO-GO: checkout contains local changes or untracked files." >&2
  echo "[review] Commit/review the changes or use a clean release checkout." >&2
  exit 6
fi
# Catch JavaScript syntax errors before operator-only GA4/Clarity approvals,
# dependency installation or expensive Next.js compilation.
node --check "$ROOT/scripts/tests/toolify-review-preflight.test.mjs"
node --check "$ROOT/scripts/verify-manual-deploy.mjs"
node --check "$ROOT/scripts/verify-manual-deploy.test.mjs"
node --check "$ROOT/site/scripts/growth-integration.test.mjs"
node --check "$ROOT/site/scripts/growth-html-checks.mjs"
node --check "$ROOT/site/scripts/check-live-workflows.mjs"
bash -n "$ROOT/scripts/check-postmerge-embed-release.sh"
bash -n "$ROOT/ops/tests/deploy-lock.test.sh"
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
# Clarity element masking does not mask captured URLs. A ?s= share state can
# appear in page/referrer/clicked URLs; Microsoft requires a separate support
# request for query masking, which does not cover referrer/clicked URLs.
# The owner must review the remaining risk or disable Clarity before release.
if [[ "${TOOLIFY_CLARITY_URLS_REVIEWED:-}" != "confirmed" ]]; then
  echo "[review] NO-GO: Clarity may capture ?s= tool inputs in recorded URLs." >&2
  echo "[review] DOM data-clarity-mask protects content, not URLs." >&2
  echo "[review] Confirm Clarity is disabled, or review s-parameter masking" >&2
  echo "[review] with Microsoft and remaining referrer/click URL capture." >&2
  echo "[review] Set TOOLIFY_CLARITY_URLS_REVIEWED=confirmed only after" >&2
  echo "[review] the operator verifies the configured production behavior." >&2
  exit 5
fi

# Only after both owner-side privacy checks are attested, spend resources on
# full release checks. These attestations are NOT automatic proof of safety.
# Runs the no-dependency test before npm install; validates the joined branch
# (all manual-only Actions triggers, route integrity and data-minimal GA4 URLs).
node --experimental-strip-types --test "$ROOT/scripts/tests/toolify-review-preflight.test.mjs"
# Existing PR41 gate checks origin/main freshness, workflow policy, VPS lock,
# HTML/embed smoke, npm ci, unit suites, SEO/i18n/index audits and Next build.
bash "$ROOT/scripts/check-postmerge-embed-release.sh"
echo "[review] PASS: source, dependency/build gate and owner privacy attestations."
echo "[review] Browser/device/consent QA and manual deployment remain separate."
