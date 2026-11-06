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
[[ $L == */.deploy.lock.d ]] && { echo "lockdir must be outside the deploy dir: $L"; exit 2; }
now=$(date +%s)
case $cmd in
  acquire)
    if mkdir "$L" 2>/dev/null; then
      echo "$me $now" > "$L/owner"
      echo "ACQUIRED $L by $me"
      exit 0
    fi
    o=$(cut -d' ' -f1 "$L/owner" 2>/dev/null || true)
    t=$(stat -c %Y "$L/owner" 2>/dev/null || stat -c %Y "$L" 2>/dev/null || echo "$now")
    age=$(( now - t ))
    # A deploy that died without releasing must not block forever.
    if (( age > stale )); then
      echo "$me $now" > "$L/owner"
      echo "TAKEOVER stale lock of ${o:-unknown} (age ${age}s > ${stale}s) by $me"
      exit 0
    fi
    echo "BUSY $L held by ${o:-unknown} for ${age}s"
    exit 3
    ;;
  release)
    o=$(cut -d' ' -f1 "$L/owner" 2>/dev/null || true)
    if [[ $o == "$me" ]]; then
      rm -f "$L/owner" && rmdir "$L" && echo "RELEASED $L by $me"
    else
      echo "NOT OWNER (held by ${o:-nobody}); left as is"
    fi
    exit 0
    ;;
  *) echo "unknown command: $cmd"; exit 2 ;;
esac
