#!/usr/bin/env bash
# Offline, non-production regression tests for the shared VPS deploy lock.
# No remote SSH, GitHub Actions, application deployment or network access.
set -Eeuo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
HELPER="$ROOT/ops/deploy-lock.sh"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
LOCK="$TMP/toolify.deploy.lock.d"
OUT="$TMP/out"

expect_rc() {
  local expected="$1" rc
  shift
  if "$@" > "$OUT" 2>&1; then rc=0; else rc=$?; fi
  if [[ "$rc" -ne "$expected" ]]; then
    echo "FAIL: expected exit $expected, got $rc: $*" >&2
    cat "$OUT" >&2
    exit 1
  fi
}

# An invalid request must never take a lock.
expect_rc 2 bash "$HELPER" acquire "$LOCK"
expect_rc 2 bash "$HELPER" acquire "$LOCK" bad not-a-number
[[ ! -e "$LOCK" ]]

# Owner exclusivity, wrong-owner release and proper cleanup.
expect_rc 0 bash "$HELPER" acquire "$LOCK" deploy-A
[[ "$(cut -d' ' -f1 "$LOCK/owner")" == "deploy-A" ]]
expect_rc 3 bash "$HELPER" acquire "$LOCK" deploy-B
expect_rc 0 bash "$HELPER" release "$LOCK" deploy-B
[[ -d "$LOCK" && "$(cut -d' ' -f1 "$LOCK/owner")" == "deploy-A" ]]
expect_rc 0 bash "$HELPER" release "$LOCK" deploy-A
[[ ! -e "$LOCK" ]]

# An old lock must not be stolen, even when its age exceeds the threshold.
expect_rc 0 bash "$HELPER" acquire "$LOCK" deploy-old
touch -t 202001010000.00 "$LOCK/owner"
expect_rc 3 bash "$HELPER" acquire "$LOCK" deploy-new 1
grep -q 'STALE' "$OUT"
[[ "$(cut -d' ' -f1 "$LOCK/owner")" == "deploy-old" ]]
expect_rc 0 bash "$HELPER" release "$LOCK" deploy-old

# Concurrent invocations may admit exactly one owner.
SUCCESS="$TMP/successes"
: > "$SUCCESS"
for i in 1 2 3 4 5 6 7 8 9 10 11 12; do
  (
    if bash "$HELPER" acquire "$LOCK" "worker-$i" > /dev/null 2>&1; then
      printf '%s\n' "$i" >> "$SUCCESS"
    fi
  ) &
done
wait
[[ "$(wc -l < "$SUCCESS" | tr -d ' ')" == "1" ]] || {
  echo "FAIL: simultaneous lock holders detected" >&2
  cat "$SUCCESS" >&2
  exit 1
}
winner="$(cut -d' ' -f1 "$LOCK/owner")"
[[ "$winner" == worker-* ]]
expect_rc 0 bash "$HELPER" release "$LOCK" "$winner"
[[ ! -e "$LOCK" ]]

echo "PASS: shared deploy lock ownership, stale refusal and 12-way concurrency"
