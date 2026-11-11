#!/bin/bash
# VPS-side deploy lock shared by .github/workflows/deploy.yml and the local
# fallback deploy script. Runs ON THE VPS, piped over ssh:
#   ssh <vps> bash -s -- acquire <lockdir> <owner-id> [stale_sec] < ops/deploy-lock.sh
#   ssh <vps> bash -s -- release <lockdir> <owner-id>             < ops/deploy-lock.sh
# Exit codes: 0 = acquired/released, 3 = busy (held by someone else), 2 = usage.
#
# Why (2026-11-06 incident): the Actions deploy and the local deploy ran at the
# same time and rsync'd two different builds into the same directory. After the
# restart, .next/server referenced chunks of the other build
# ("Cannot find module './chunks/38191.js'") and every page returned 500 for
# ~6 minutes. Each path had its own lock (Actions `concurrency`, a Mac /tmp dir)
# but nothing was shared, so neither saw the other.
#
# The lock dir must live OUTSIDE the rsync --delete target (use
# "<DEPLOY_PATH>.deploy.lock.d"), otherwise the next rsync deletes it.
set -u
cmd=${1:-}; L=${2:-}; me=${3:-}; stale=${4:-3600}
[[ -n $cmd && -n $L && -n $me ]] || { echo "usage: acquire|release <lockdir> <owner> [stale_sec]"; exit 2; }
[[ $stale =~ ^[0-9]+$ ]] || { echo "stale_sec must be a non-negative integer" >&2; exit 2; }
[[ $L == */.deploy.lock.d ]] && { echo "lockdir must be outside the deploy dir: $L"; exit 2; }
now=$(date +%s)
case $cmd in
  acquire)
    if mkdir "$L" 2>/dev/null; then
      if ! printf '%s %s\n' "$me" "$now" > "$L/owner"; then
        rmdir "$L" 2>/dev/null || true
        echo "Cannot write lock owner metadata: $L/owner" >&2
        exit 1
      fi
      echo "ACQUIRED $L by $me"
      exit 0
    fi
    o=$(cut -d' ' -f1 "$L/owner" 2>/dev/null || true)
    t=$(stat -c %Y "$L/owner" 2>/dev/null || stat -f %m "$L/owner" 2>/dev/null || stat -c %Y "$L" 2>/dev/null || stat -f %m "$L" 2>/dev/null || echo "$now")
    age=$(( now - t ))
    # Do not take over an old lock automatically. The previous code overwrote
    # the owner file without any atomic claim; two waiters could both enter a
    # live deployment (or steal a lock from a slow, still-running deploy).
    # A stale lock requires verification that the prior deployment has stopped.
    if (( age > stale )); then
      echo "STALE $L held by ${o:-unknown} for ${age}s; refusing unsafe automatic takeover. Verify the prior deploy is inactive before manually clearing the lock." >&2
      exit 3
    fi
    echo "BUSY $L held by ${o:-unknown} for ${age}s"
    exit 3
    ;;
  release)
    o=$(cut -d' ' -f1 "$L/owner" 2>/dev/null || true)
    if [[ $o == "$me" ]]; then
      if ! { rm -f "$L/owner" && rmdir "$L"; }; then
        echo "Failed to release lock: $L" >&2
        exit 1
      fi
      echo "RELEASED $L by $me"
    else
      echo "NOT OWNER (held by ${o:-nobody}); left as is"
    fi
    exit 0
    ;;
  *) echo "unknown command: $cmd"; exit 2 ;;
esac
