# Deploying to Cloudflare Pages

Toolify は Next.js 15 (Node ランタイム) 構成のため、Cloudflare Pages の **Next.js (Pages Functions)** ビルドプリセットでデプロイします。Workers の `next-on-pages` 経由でも可能。

## 1. ドメイン取得

1. ドメインを取得（CF Registrar / Squarespace / お名前.com 等）
2. ネームサーバーを Cloudflare に変更（取得時に CF Registrar なら自動）
3. Cloudflare ダッシュボードでサイト追加 → DNS 確認

ドメイン候補例: `toolify.tools`, `genie-tools.com`, `quicktools.io` 等。短く覚えやすい .com / .io / .tools が SEO・ブランド両面で有利。

## 2. リポジトリ準備

```bash
cd /Users/ken/Dropbox/web_advertisement
git init
git add -A
git commit -m "Initial commit: 46 tools, en/ja active, 17-locale infra"
git remote add origin git@github.com:YOUR_GH/web_advertisement.git
git push -u origin main
```

## 3. Cloudflare Pages 設定

ダッシュボード → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**

| 項目 | 値 |
|---|---|
| プロジェクト名 | toolify |
| Production branch | `main` |
| Framework preset | **Next.js** |
| Build command | `npm run build` |
| Build output directory | `.next` |
| Root directory (advanced) | `site` |
| Node version | `20` (環境変数 `NODE_VERSION=20`) |

### 環境変数（Production）

`Settings` → `Environment variables`:

```
NEXT_PUBLIC_SITE_URL=https://toolify.example
NEXT_PUBLIC_ORG_NAME=Toolify
NEXT_PUBLIC_CONTACT_EMAIL=contact@toolify.example
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXXXXXX
NEXT_PUBLIC_ADSENSE_SLOT_BANNER=
NEXT_PUBLIC_ADSENSE_SLOT_INARTICLE=
NEXT_PUBLIC_ADSENSE_SLOT_STICKY=
NEXT_PUBLIC_ADSENSE_SLOT_BELOWRESULT=
```

審査前は AdSense Slot ID は空のまま OK（プレースホルダ表示）。承認後に slot ID を埋めて再デプロイ。

## 4. カスタムドメイン

Pages → 該当プロジェクト → **Custom domains** → ドメイン名追加。CNAME レコードが自動設定される。HTTPS は自動で有効化。

### メインドメイン vs `*.pages.dev`

- 開発・PoC: `toolify.pages.dev` で OK
- AdSense 申請前: カスタムドメインに移行推奨（審査通過率向上）
- 設定後: `NEXT_PUBLIC_SITE_URL` を本番ドメインに更新して再デプロイ

## 5. ads.txt の差し替え

AdSense承認後、`site/public/ads.txt` の `pub-XXXXXXXXXXXXXXXX` を実 publisher ID に置換 → コミット → 自動デプロイ。

`https://toolify.example/ads.txt` でアクセス確認。

## 6. Search Console / Analytics 設定

1. **Google Search Console**: ドメインプロパティを追加 → DNS TXT 認証 → 認証済み後、 `https://toolify.example/sitemap.xml` を送信
2. **Bing Webmaster Tools**: 同様に追加 + sitemap 送信
3. **GA4**: プロパティ作成 → 測定 ID を取得 → CF Pages の `NEXT_PUBLIC_GA_ID` に設定 → 再デプロイ
4. **IndexNow**（Bing/Yandex/Naver 即時通知）:

   ```bash
   # 初回セットアップ（一度だけ）
   KEY=$(openssl rand -hex 32)
   echo "$KEY" > site/public/$KEY.txt
   git add site/public/$KEY.txt && git commit -m "feat: IndexNow key" && git push

   # 通知（デプロイ後に実行）
   cd site
   INDEXNOW_KEY=$KEY SITE_URL=https://toolify.example npm run indexnow
   ```

   sitemap.xml から全 URL を自動取得して Bing API に送信（Yandex/Naver/Seznam にも転送）。Google は IndexNow 未対応だが、Bing 経由でクロール頻度が大幅向上。

## 7. AdSense 申請

`docs/ADSENSE_SETUP.md` を参照。チェックリスト:

- [ ] 30〜50ツール公開済み（現在46ツール ✓）
- [ ] privacy / terms / about / contact 完備 ✓
- [ ] 独自ドメインで HTTPS 配信 ✓
- [ ] sitemap.xml + robots.txt + ads.txt 配信 ✓
- [ ] CWV: モバイル Lighthouse 90+ （要計測）
- [ ] AI生成色を消した固有コンテンツ（FAQ・ロングフォーム） ✓
- [ ] CMP（Google Funding Choices）設定（EU向け、後日）

## 8. デプロイ後チェック

```bash
# 1. ホームページ
curl -I https://toolify.example/

# 2. ロケール
curl -I https://toolify.example/en/
curl -I https://toolify.example/ja/

# 3. ツールページ
curl -I https://toolify.example/en/tools/bmi-calculator

# 4. SEO ファイル
curl https://toolify.example/sitemap.xml | head -20
curl https://toolify.example/robots.txt
curl https://toolify.example/ads.txt

# 5. OG 画像（PNG ヘッダー確認）
curl -s 'https://toolify.example/api/og?title=Test&locale=en' | head -c 4 | xxd
# → 8950 4e47 が PNG マジックナンバー
```

## 9. CI 連携（既設定済み）

`.github/workflows/ci.yml` で PR ごとに validate + build が自動実行。デプロイは CF Pages 側の Git 連携で自動。

`main` への push:
1. GitHub Actions: validate + build
2. Cloudflare Pages: build & deploy（並行）
3. Production URL に反映（通常 1-3 分）

## 10. ロールバック

CF Pages → Deployments → 過去のデプロイを選択 → **Rollback to this deployment**

PR ベースで `main` へ commit する運用にすれば、問題があった時はリバートコミットを push するだけで自動再デプロイされる。

## 注意事項

- **node_modules はリポジトリに含めない**（`site/.gitignore` で除外済み）
- **環境変数の `NEXT_PUBLIC_` プレフィックス**: クライアントへ露出するため、シークレットを入れない
- **Build cache**: CF Pages は build キャッシュを保持。`.next` の構造が大きく変わったら手動でキャッシュ削除推奨
