#!/usr/bin/env bash
# Isolated Clarity privacy hotfix gate. Never merges, runs Actions or deploys.
set -Eeuo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
EXPECTED="fix/toolify-clarity-safe-default-20261108"

ACTUAL="$(git -C "$ROOT" branch --show-current)"
if [[ "$ACTUAL" != "$EXPECTED" ]]; then
  echo "[clarity-hotfix] ERROR: wrong release branch (${ACTUAL:-detached})" >&2
  exit 2
fi

MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
if (( MAJOR < 22 )); then
  echo "[clarity-hotfix] ERROR: Node >=22 required for source preflight" >&2
  exit 2
fi

# Reject any source changes not included in the reviewed hotfix commit.
# Tracked changes and unexpected untracked files can alter an otherwise clean build.
if [[ -n "$(git -C "$ROOT" status --porcelain --untracked-files=normal)" ]]; then
  echo "[clarity-hotfix] NO-GO: checkout has local or untracked changes." >&2
  echo "[clarity-hotfix] Build from a clean reviewed commit." >&2
  exit 6
fi

# Fail fast on malformed release scripts before network or npm operations.
node --check "$ROOT/scripts/tests/clarity-hotfix-policy.test.mjs"
node --check "$ROOT/scripts/verify-manual-deploy.mjs"
node --check "$ROOT/scripts/verify-manual-deploy.test.mjs"
bash -n "$ROOT/scripts/check-clarity-hotfix-release.sh"

# This hotfix intentionally SHIPS WITH CLARITY OFF. Do not mistakenly opt
# back in merely because an old project ID exists in deployment variables.
if [[ "${NEXT_PUBLIC_CLARITY_URL_PRIVACY_APPROVED:-}" == "confirmed" ]]; then
  echo "[clarity-hotfix] NO-GO: Clarity opt-in must not be enabled for this hotfix." >&2
  echo "[clarity-hotfix] Remove NEXT_PUBLIC_CLARITY_URL_PRIVACY_APPROVED and review" >&2
  echo "[clarity-hotfix] sharing URLs, Clarity capture and regional consent separately." >&2
  exit 5
fi
unset NEXT_PUBLIC_CLARITY_URL_PRIVACY_APPROVED

# Verify that the very latest main has been incorporated, not just a stale
# local copy. Keep the branch review-only if main has moved.
git -C "$ROOT" fetch --no-tags origin main:refs/remotes/origin/main
if ! git -C "$ROOT" merge-base --is-ancestor refs/remotes/origin/main HEAD; then
  echo "[clarity-hotfix] NO-GO: current origin/main is not an ancestor." >&2
  exit 3
fi

# No automatic GitHub Actions of any kind. Run only local Node assertions.
node "$ROOT/scripts/verify-manual-deploy.mjs" "$ROOT/.github/workflows"
node --test "$ROOT/scripts/verify-manual-deploy.test.mjs"
node --experimental-strip-types --test "$ROOT/scripts/tests/clarity-hotfix-policy.test.mjs"

# Full Next.js release verification must pass before owner reviews browsers.
export NEXT_PUBLIC_SITE_URL="https://toolify365.com"
cd "$ROOT/site"
npm ci --no-fund --no-audit
npm run typecheck
npm test
npm run validate
npm run audit:seo
npm run audit:i18n
npm run build
echo "[clarity-hotfix] PASS: local source/tests/build; browser, consent,"
echo "[clarity-hotfix] public release SHA and manual deployment remain separate."
