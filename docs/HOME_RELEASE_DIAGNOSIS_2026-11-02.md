# Toolify365 homepage deployment mismatch (2026-11-02)

## Verified
- GitHub main contains PR #18 redesigned homepage.
- Public /en still appears to serve the old full tool accordion.
- Public /en/software shows the new ten-product catalog.
- Web fetchers may cache HTML; these observations do not prove which VPS commit is currently executing.

## On the VPS (read-only diagnosis)
```bash
bash ops/check-home-release.sh
pm2 describe toolify
```

The script compares public HTML with the Next.js localhost server (port 8500, correct forwarded headers) and prints cache headers. It does not alter service state.

Interpretation:
- **Local NEW_HOME, public OLD_HOME**: inspect nginx upstream, CDN or reverse proxy caching. Check vhost and cache configuration. Do not blindly restart the app.
- **Both OLD_HOME**: deployed standalone build is stale. Rebuild from current main in a separate staging directory, run `npm ci`, `npm run typecheck`, `npm test`, `npm run build`; only activate after tests and a verified rollback path. Do not overwrite `/opt/appcfg/toolify-start.sh`.
- **Both NEW_HOME**: possible stale client/browser or crawler cache. Test fresh browser profile and force reload.
- **Unknown / non-200**: check PM2 error logs and nginx upstream before deployment.

No GitHub Actions should be used. A push to main may trigger old GitHub Actions workflows; this diagnostic is intentionally isolated in a PR, not merged.

## Production acceptance
1. Both /en and /ja render the new homepage (search-first hero, six popular cards, no full tool accordion).
2. /en/software and all three browser workbenches work.
3. /en/tools remains a full tool directory.
4. Search button focuses header search on mobile and desktop; buttons and download functionality work.
5. No 5xx and no jump in error metrics.

Do not claim successful deploy or QA until measurements and direct responses are captured.
