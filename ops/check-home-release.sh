#!/usr/bin/env bash
# Read-only public vs VPS-local homepage comparison.
# Usage: bash ops/check-home-release.sh
set -euo pipefail
for target in public local; do
  if [ "$target" = public ]; then
    base="https://toolify365.com"; extra=()
  else
    base="http://127.0.0.1:8500"
    extra=(-H "Host: toolify365.com" -H "X-Forwarded-Proto: https")
  fi
  for page in en en/software; do
    hdr=$(mktemp); html=$(mktemp)
    status=$(curl -sSL --max-time 15 -D "$hdr" -o "$html" -w '%{http_code}' "${extra[@]}" "$base/$page") || status="ERROR"
    printf '%s /%s HTTP %s: ' "$target" "$page" "$status"
    if grep -q 'home-software-heading' "$html"; then
      echo 'NEW_HOME'
    elif grep -q 'Why Toolify365' "$html"; then
      echo 'OLD_HOME'
    elif grep -q 'CSV Cleaner Pro' "$html"; then
      echo 'SOFTWARE_PRESENT'
    else
      echo 'UNKNOWN'
    fi
    grep -iE '^(age|cache-control|x-cache|x-nextjs-cache|cf-cache-status):' "$hdr" || true
    rm -f "$hdr" "$html"
  done
done
echo 'Local new / public old: check nginx/CDN/cache routing.'
echo 'Both old: VPS build is stale. Both new: investigate browser cache.'
