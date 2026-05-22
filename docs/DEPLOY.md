# Deploying to VPS (GitHub Actions)

Toolify (`toolify365.com`) は **Ubuntu VPS** 上で Next.js standalone サーバとして稼働し、**GitHub Actions** で自動デプロイされる。

- 本番ドメイン: `https://toolify365.com`
- リポジトリ: `github.com/appdevelopsk/toolify`（アプリ本体は `site/`）
- デプロイ定義: `.github/workflows/deploy.yml`（"Deploy to VPS"）

> 注: 旧版ドキュメントは「Cloudflare Pages」を前提にしていたが、その構成は採用していない。実態は VPS + GitHub Actions。

## 構成概要

```
GitHub (main) ──push──▶ Actions: deploy.yml
                          ├─ npm ci / typecheck / audit / test
                          ├─ npm run build  (output: "standalone")
                          └─ rsync ──SSH──▶ VPS
                                             ├─ PM2 プロセス "toolify"  (127.0.0.1:8500)
                                             └─ nginx リバースプロキシ ──▶ https://toolify365.com
```

- `next.config.ts` の `output: "standalone"` でビルドされ、`.next/standalone/` に最小構成の Node サーバが出力される
- VPS では PM2 がプロセス `toolify` を常駐させ、ポート **8500** で待ち受け
- nginx が `toolify365.com` (443) → `127.0.0.1:8500` にプロキシ。SSL は Let's Encrypt (certbot)

## 1. デプロイ（通常運用）

`main` ブランチへ push すると `deploy.yml` が自動実行される。手動実行も可:

```bash
gh workflow run deploy.yml --repo appdevelopsk/toolify
gh run watch <run-id> --repo appdevelopsk/toolify   # 進行状況
```

`deploy.yml` の処理:

1. `site/` で `npm ci` → `npm run typecheck` → `npm run audit:i18n` → `npm run audit:seo` → `npm test`
2. `npm run build`（standalone ビルド。NEXT_PUBLIC_* env を注入）
3. SSH 鍵をセットアップし、サーバ側ランタイム env (`RAKUTEN_*`) を `.next/standalone/.env.local` に書き出し
4. `.next/standalone/`・`.next/static/`・`public/` を VPS へ `rsync --delete`
5. `pm2 reload toolify --update-env && pm2 save`（ゼロダウンタイム）
6. スモークテスト: `curl https://toolify365.com/en/tools/bmi-calculator` が 200 を返すか

## 2. 環境変数 / シークレット

本番ビルドの env は **GitHub リポジトリの Secrets**（`Settings → Secrets and variables → Actions`）から注入される。受け口は `deploy.yml`。

`deploy.yml` 内で固定値として渡されるもの:

```
NEXT_PUBLIC_SITE_URL=https://toolify365.com
NEXT_PUBLIC_ORG_NAME=Toolify
NEXT_PUBLIC_CONTACT_EMAIL=app.develop.sk@gmail.com
NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-4927026308242118
NEXT_PUBLIC_FC_ID=4927026308242118
```

GitHub Secrets から注入されるもの:

| Secret | 用途 |
|---|---|
| `DEPLOY_HOST` / `DEPLOY_USER` / `DEPLOY_PATH` | VPS の接続先・配置先 |
| `DEPLOY_SSH_KEY` | デプロイ用 SSH 秘密鍵 |
| `GA_ID` | Google Analytics 測定 ID（本番: `G-1L5GGHRR5D`） |
| `BING_SITE_VERIFICATION` / `YANDEX_SITE_VERIFICATION` | サーチコンソール認証 |
| `ADSENSE_SLOT_BANNER` / `_INARTICLE` / `_STICKY` / `_BELOWRESULT` | AdSense 広告ユニット（承認後に設定） |
| `RAKUTEN_APP_ID` / `_ACCESS_KEY` / `_AFFILIATE_ID` / `_ORIGIN_URL` | 楽天API（サーバーサイドのみ。実行時に `.next/standalone/.env.local` 経由で渡る） |
| `AMAZON_PARTNER_TAG` | Amazon アソシエイト（承認後） |

**設定値を変えるには**: 該当 Secret を更新 → `main` へ push（または `gh workflow run deploy.yml`）で再デプロイ。

```bash
gh secret set GA_ID --repo appdevelopsk/toolify --body "G-XXXXXXXXXX"
```

ローカル開発は `site/.env.local`（コミット禁止）。未設定でも開発・ビルドは通る（プレースホルダ表示）。

> ⚠️ `RAKUTEN_*` は秘匿情報。`NEXT_PUBLIC_` を付けない（クライアントに露出しない）。楽天アプリ登録の Application URL を `RAKUTEN_ORIGIN_URL` と一致させること（不一致だと `HTTP_REFERRER_NOT_ALLOWED` で API が 403）。

## 3. VPS 初期セットアップ（新ドメイン追加時のみ）

nginx 設定 + SSL は workflow で自動化済み。`Actions` タブから手動実行（`workflow_dispatch`）:

- `setup-toolify365.yml` — toolify365.com の nginx 設定追加 + certbot で SSL 発行
- `restore-toolify365.yml` — リダイレクト等を解除して app プロキシ構成へ戻す

VPS 側の nginx 設定は `/etc/nginx/sites-available/toolify365.com`（`server_name toolify365.com www.toolify365.com` → `proxy_pass http://127.0.0.1:8500`）。

## 4. ロールバック

- リバートコミットを `main` に push → 自動で再デプロイ
- または `gh run list` で過去の成功 run を確認し、その時点のコミットに戻して再デプロイ

## 5. ads.txt の差し替え

AdSense 承認後、`site/public/ads.txt` の `pub-XXXXXXXXXXXXXXXX` を実 publisher ID に置換 → コミット → push で自動デプロイ。`https://toolify365.com/ads.txt` で確認。

## 6. Search Console / Analytics

1. **Google Search Console**: ドメインプロパティ追加 → DNS TXT 認証 → `https://toolify365.com/sitemap.xml` を送信
2. **Bing Webmaster Tools**: 同様に追加 + sitemap 送信
3. **GA4**: プロパティ作成 → 測定 ID を取得 → GitHub Secret `GA_ID` に設定 → 再デプロイ（本番は `G-1L5GGHRR5D`、GAプロパティ「Toolify365」）
4. **IndexNow**（Bing/Yandex/Naver 即時通知）:

   ```bash
   # 初回セットアップ（一度だけ）
   KEY=$(openssl rand -hex 32)
   echo "$KEY" > site/public/$KEY.txt
   git add site/public/$KEY.txt && git commit -m "feat: IndexNow key" && git push

   # 通知（デプロイ後に実行）
   cd site
   INDEXNOW_KEY=$KEY SITE_URL=https://toolify365.com npm run indexnow
   ```

   sitemap.xml から全 URL を取得して Bing API に送信（Yandex/Naver/Seznam にも転送）。

## 7. AdSense 申請

`docs/ADSENSE_SETUP.md` を参照。チェックリスト:

- [ ] 30〜50ツール公開済み
- [ ] privacy / terms / about / contact 完備
- [ ] 独自ドメインで HTTPS 配信
- [ ] sitemap.xml + robots.txt + ads.txt 配信
- [ ] CWV: モバイル Lighthouse 90+
- [ ] AI生成色を消した固有コンテンツ（FAQ・ロングフォーム）
- [ ] CMP（Google Funding Choices）設定（EU向け）

## 8. デプロイ後チェック

```bash
curl -I https://toolify365.com/
curl -I https://toolify365.com/en/
curl -I https://toolify365.com/en/tools/bmi-calculator
curl https://toolify365.com/sitemap.xml | head -20
curl https://toolify365.com/robots.txt
curl https://toolify365.com/ads.txt
# OG 画像（PNG マジックナンバー 8950 4e47）
curl -s 'https://toolify365.com/api/og?title=Test&locale=en' | head -c 4 | xxd
```

## 9. CI

`.github/workflows/ci.yml` が PR / push ごとに validate + build + Lighthouse を実行。本番デプロイは `deploy.yml`（push to `main`）が担当。

## 注意事項

- `node_modules` はリポジトリに含めない（`site/.gitignore` 済み）
- `NEXT_PUBLIC_` プレフィックスの env はクライアントに露出する。秘匿情報を入れない
- `main` への push は **すべて** `deploy.yml`（VPS本番デプロイ）をトリガーする。docs だけの変更でも再ビルド・再デプロイが走る点に注意
