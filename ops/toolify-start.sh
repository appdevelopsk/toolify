#!/bin/bash
# Next.js standalone の起動スクリプト。
# 正本: リポジトリの ops/toolify-start.sh。VPS の配置先は /opt/appcfg/toolify-start.sh。
# 反映は手動 (deploy.yml は配置しない):
#   scp ops/toolify-start.sh <vps>:/opt/appcfg/toolify-start.sh
#   ssh <vps> 'chmod +x /opt/appcfg/toolify-start.sh && pm2 restart toolify'
# 経緯と他の罠は docs/DEPLOY.md の「0. 起動スクリプトと踏んだ罠」を参照。
# ⚠️ /opt/apps/toolify/ 配下に置いてはいけない。deploy.yml の rsync -az --delete が
# .next/standalone/ をそのディレクトリへ同期するため、standalone に含まれない
# ファイルは毎回のデプロイで消える(2026-09-17 に消えて本番 502)。
# そのため 2026-09-18 に /opt/appcfg/ へ退避し、PM2 もそちらを指すようにした。
cd /opt/apps/toolify
set -a; [ -f .env.local ] && source .env.local; set +a
# nginx は 127.0.0.1:8500 へ proxy_pass する。standalone の既定 3000 は
# 別アプリ(30sec)が占有しており、未指定だと EADDRINUSE で起動できない。
export PORT=8500
# HOSTNAME は bind アドレスであると同時に、Next が絶対URLを組む際の host にもなる。
# 127.0.0.1 にすると next-intl の locale redirect が `https://localhost:8500/en` を
# 返し、Next 自身がそこへ自己 proxy して TLS ハンドシェイク失敗(EPROTO) →
# 全ページ 500 になる(2026-09-18 実障害)。公開ドメインなら redirect は相対 /en で 200。
# ufw は 22/80/443 のみ許可(既定 DROP)なので公開IPに bind しても 8500 は外部到達不可。
export HOSTNAME=toolify365.com
# V8 の heap 上限。**PM2 のメモリ内 env だけに置いてはいけない**。
# 2026-09-18 の実障害: 稼働プロセスは 300MB で走っていたのに dump.pm2 には 400MB が
# 保存されており(復旧時に pm2 set したが稼働プロセスへは反映されていなかった)、
# どこにも固定されていないため `pm2 resurrect` の度に値が変わりうる状態だった。
# PORT が同じ理由で 3000 に落ちた前例がある(2026-09-17)。
# 値の原則は 定常RSS < heap cap < max_memory_restart(500MB)。
# toolify は Next.js SSR で定常 RSS 約 220MB あり、300MB では比 0.73 と余裕が無く
# 実際に V8 が `Ineffective mark-compacts` で abort した(00:08 / 00:28)。
export NODE_OPTIONS="--max-old-space-size=400"
exec node server.js
