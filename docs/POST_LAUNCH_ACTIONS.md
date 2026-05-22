# Post-Launch User Actions

サイトのコード側準備は完了済み。残るは Google/Microsoft アカウントへのログインが必要なダッシュボード操作のみ。各操作 5〜10 分で完了。

## 1. Bing Webmaster Tools 接続 (IndexNow 403 解消)

### 現状
- IndexNow API を api.indexnow.org (Bing 経由) に投げると `403 UserForbiddedToAccessSite`
- Bing が `tools.appdevelopsk.com` をまだ自分のエコシステムで認識していないため
- Yandex (202) と Naver (200) は受理済み

### 解決方法 A: Google Search Console から自動 import (推奨、最速)

1. https://www.bing.com/webmasters にアクセス
2. Microsoft アカウント (個人 Outlook/Hotmail でも可) でサインイン
3. ダッシュボードで「Import sites from Google Search Console」をクリック
4. Google アカウント (`app.develop.sk@gmail.com`) で OAuth 認可
5. Bing が GSC で検証済みのサイトを自動取り込み (tools.appdevelopsk.com / appdevelopsk.com 両方)
6. 完了 — 数分以内に IndexNow 403 が解消される

**コード側の追加変更は不要**。

### 解決方法 B: Meta タグで個別認証 (A が動かない場合の代替)

1. BWT で「Add a site」 → tools.appdevelopsk.com を入力
2. 「HTML meta tag」方式を選択
3. 表示される `<meta name="msvalidate.01" content="XXXXXX..." />` の `content` 値をコピー
4. GitHub リポジトリ Secrets に追加:
   - Settings → Secrets and variables → Actions → New repository secret
   - Name: `BING_SITE_VERIFICATION`
   - Value: コピーした content 値 (XXXXXX... のみ)
5. 任意のコミットを push して再 deploy (または「Re-run」で既存 workflow を再実行)
6. BWT で「Verify」ボタンをクリック

### 検証

```bash
# meta タグが入っていれば msvalidate.01 が見つかる
curl -s https://tools.appdevelopsk.com/en | grep msvalidate

# Bing IndexNow が 200/202 を返すようになる
curl -X POST https://api.indexnow.org/indexnow \
  -H "Content-Type: application/json" \
  -d '{"host":"tools.appdevelopsk.com","key":"d45f7912a81e83effa81e12a1d4a236d68b59eda03321478e620411b2d7ca09f","keyLocation":"https://tools.appdevelopsk.com/d45f7912a81e83effa81e12a1d4a236d68b59eda03321478e620411b2d7ca09f.txt","urlList":["https://tools.appdevelopsk.com/en"]}'
```

### 接続後にやること
- BWT ダッシュボードで「Submit sitemap」 → `https://tools.appdevelopsk.com/sitemap.xml`
- 数日〜数週間で Bing インデックス開始
- IndexNow 経由の更新通知が即時反映される

---

## 2. AdSense 申請ステータス確認

### 現状
- 申請: 「準備中」(2026-05 時点)
- Apex (`appdevelopsk.com`) 側準備:
  - `/privacy` `/terms` `/about` `/contact` 全 200 OK
  - `ads.txt` 配置済み (`google.com, pub-4927026308242118, DIRECT, f08c47fec0942fa0`)
  - AdSense 検証スクリプト配置済み
  - Subdomain `tools.appdevelopsk.com` も同一 ads.txt
  - 108 ツール × 6 言語 = 648 ツールページ存在

### 確認手順

1. https://www.google.com/adsense/ にログイン (`app.develop.sk@gmail.com`)
2. 「サイト」セクションで `appdevelopsk.com` のステータス確認:
   - **「準備中」** → 待機継続 (通常 2〜4 週間、最大 2〜3 ヶ月)
   - **「準備完了」** → セクション 3 (広告ユニット作成) へ
   - **「拒否」** → 拒否理由を確認、対応

### よくある拒否理由と対応

| 理由 | 対応 |
|---|---|
| サイト要件未達 | プライバシー/規約/問い合わせは全配置済み (確認のみ) |
| 価値の低いコンテンツ | 各ツールに 8件 FAQ + 3+ section 記事配置済 (HCU 対策済み) |
| トラフィック不足 | 関係なし — AdSense は新規サイトでも審査する |
| 必須情報不足 | `/about` の運営者情報を見直す |

---

## 3. AdSense 承認後: 広告ユニット作成 + Secrets 設定

承認されたら以下を実行:

### 3a. AdSense ダッシュボードで広告ユニットを 4 つ作成

| 名前 | タイプ | 推奨配置 |
|---|---|---|
| Toolify Banner | ディスプレイ広告 (レスポンシブ) | ヘッダー直下 |
| Toolify In-Article | インフィード広告 | 記事中段 (article セクション間) |
| Toolify Sticky | アンカー / オーバーレイ広告 | モバイル下部固定 |
| Toolify Below-Result | ディスプレイ広告 (レスポンシブ) | ツール結果直下 |

各ユニットの「データソース ID」(slot ID、数字 10桁) をコピー。

### 3b. GitHub Secrets に追加

Settings → Secrets and variables → Actions → New repository secret:

```
ADSENSE_SLOT_BANNER       = 1234567890
ADSENSE_SLOT_INARTICLE    = 2345678901
ADSENSE_SLOT_STICKY       = 3456789012
ADSENSE_SLOT_BELOWRESULT  = 4567890123
GA_ID                     = G-1L5GGHRR5D  (Google Analytics — 設定済み)
```

`deploy.yml` に既にこれら env の受け口が用意されているので、Secrets を追加して任意のコミットを push すれば次の deploy で広告が自動配信される。

### 3c. 配信確認

```bash
# slot ID が反映されているか
curl -s https://tools.appdevelopsk.com/en/tools/bmi-calculator | grep -oE 'data-ad-slot="[^"]*"'

# Page Speed Insights / Lighthouse を 1 回かけて広告が原因の遅延がないか確認
```

### 3d. AdSense ポリシー (運用後)

- **Auto Ads は使わない** (CLAUDE.md より) — 手動配置で +30〜50% RPM
- 各ページの広告は 3〜4 個まで (Better Ads ポリシー遵守)
- ファーストビューに 1 個までに留める
- 配置後 24〜48 時間でレポートに数値が出始める

---

## 4. 月次オペレーション

### 毎月 1 回チェック

| 項目 | 確認場所 | 健全水準 |
|---|---|---|
| AdSense RPM | AdSense ダッシュボード | $5+ (ja/en 比率による) |
| AdSense 不正クリック | AdSense > ポリシーセンター | 0 件 (アラートあれば即対応) |
| GSC インデックス | search.google.com/search-console | 増加トレンド |
| Bing インデックス | bing.com/webmasters | 増加トレンド |
| Core Web Vitals | GSC > 拡張 > Core Web Vitals | All "Good" |
| サーバ稼働 | VPS の uptime / nginx logs | 99%+ |

### 不正クリック / Invalid Traffic 対策
- AdSense ポリシーセンターの「Invalid Traffic」アラートをすぐ対応
- 自分でクリックしない (絶対!)
- 知り合いにクリックを頼まない (絶対!)
- 異常に高い CTR (>15%) は要確認 — 通常は 1〜5%

---

## 5. 関連ファイル

| ファイル | 役割 |
|---|---|
| `.github/workflows/deploy.yml` | env スロット (verification + AdSense slots + GA) |
| `site/src/app/[locale]/layout.tsx` | verification meta tag 出力ロジック |
| `site/src/components/ads/AdSlot.tsx` | AdSense ユニットレンダリングロジック |
| `site/src/lib/config.ts` | env → siteConfig 集約 |
| `site/public/d45f7912....txt` | IndexNow 鍵ファイル (404 にしないこと) |
| `site/public/ads.txt` | 静的 ads.txt (AdSense クライアント ID) |

---

最終更新: 2026-05-08
