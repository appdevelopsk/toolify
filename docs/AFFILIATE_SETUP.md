# アフィリエイト ASP 登録 & カタログ更新ガイド

> AdSense 承認待ち期間 (2-4週間) に並行して進める。承認後すぐ広告 + アフィリ両配信できる状態を作るための手順書。

---

## 概要

サイトの収益チャネル設計:

| 収益源 | 設置難度 | 期待 RPM | 担当ツールカテゴリ |
|---|---|---|---|
| Google AdSense | ★ (申請のみ) | $2-15 | 全ページ (横断) |
| もしもアフィリエイト | ★★ | 案件次第 | finance / health |
| A8.net | ★★ | 案件次第 | finance / 開発系 |
| バリューコマース | ★★ | 案件次第 | health / 旅行系 |
| 楽天アフィリエイト | ★ (即時) | 1-10% | 物販全般 |
| Amazon アソシエイト | ★★ (審査) | 3-10% | 物販全般 |
| 直接プログラム (Adobe/Notion等) | ★★★ | 高単価 | デザイン / 生産性 |

---

## Phase 1: 即時登録できる ASP (Day 1-3)

### 1. もしもアフィリエイト
**最重要 — 日本市場の高単価金融案件が豊富。W報酬で12%上乗せ。**

- URL: https://af.moshimo.com/
- 登録に必要な情報:
  - 名前・住所 (個人事業主名義可)
  - 銀行口座 (報酬振込先)
  - サイトURL: `https://tools.appdevelopsk.com`
  - サイト紹介文: 「無料の計算ツール集サイト。BMI・カロリー・住宅ローン・退職金など60+ツールを3言語(日英中)で提供。月間1万PV目標 (2026年5月時点新規開設)」
- 審査: 通常 1-3営業日
- 優先案件 (承認されたら catalog.ts に追加):
  - **楽天証券**: NISA口座開設 → 5,000-15,000円/件
  - **iHerb**: 物販 5%
  - **マイプロテイン**: 物販 5-10%

### 2. A8.net
**国内最大手。豊富な金融・SaaS案件。**

- URL: https://www.a8.net/
- 必要情報: もしもと同じ + 自己アフィリOK (自分で買って初回報酬)
- 優先案件:
  - **SBI証券**: 口座開設 5,000-15,000円
  - **三井住友カード**: 8,000-12,000円
  - **楽天カード**: 5,000円
  - **ConoHa WING**: 8,000円 (本サイトで使う紹介もOK)
  - **あすけん**: 食事記録アプリ 1,000-3,000円

### 3. バリューコマース
**ヤフー系。健康・旅行・ECに強い。**

- URL: https://www.valuecommerce.ne.jp/
- 必要情報: 同上
- 優先案件:
  - **iHerb 公式**: 物販 5-10%
  - **Yahoo!ショッピング**: 1%
  - **じゃらん / 楽天トラベル**: 旅行系 (datetime カテゴリ向け)

### 4. 楽天アフィリエイト
**審査なし即時開始。楽天市場の全商品が対象。**

- URL: https://affiliate.rakuten.co.jp/
- 必要情報: 楽天IDだけ
- 案件: 楽天市場全商品 1-10% (カテゴリ別)
- 利点: 即日リンク発行可。ニッチカテゴリにも対応 (例: ペット、書籍)

### 5. Amazon アソシエイト
**英語・中国語ページ向けに必須。**

- URL: https://affiliate.amazon.co.jp/ (JP) / https://affiliate-program.amazon.com/ (US)
- 必要情報: Amazonアカウント + サイトURL + 銀行口座 + 税情報 (W-8BEN)
- 審査: 申請後180日以内に**3件以上の販売**で正式承認 (それまで仮承認)
- 注意: 承認前にリンク貼っても可だが、180日以内売上0だとアカウント取消

---

## Phase 2: 直接プログラム (Day 3-7)

直接申請するパートナープログラム。承認には実トラフィックが要求されることもあるので AdSense 承認後でもOK。

| サービス | URL | 単価 | 対象カテゴリ |
|---|---|---|---|
| Adobe Affiliate | https://www.adobe.com/affiliates.html | 8.33% (年) | color |
| 1Password | https://1password.com/affiliate | 25% (年) | text (security) |
| Notion | https://www.notion.so/affiliate | $5-10/件 | math (productivity) |
| Canva | https://www.canva.com/affiliates/ | $36 (Pro 月) | color |
| ConoHa WING (GMO) | https://www.conoha.jp/wing/affiliate/ | 高単価 | text (web hosting) |
| Cloudflare Partner | (招待制・大規模時) | — | text |

---

## Phase 3: catalog.ts への登録手順

ASP/直接プログラムから個別アフィリエイトリンクが発行されたら:

### 該当エントリを更新する手順 (例: 楽天証券)

1. ASPから発行された URL をコピー
   ```
   https://m.r10.to/r5XXXX...   (楽天 / もしも経由)
   https://px.a8.net/svt/...    (A8 経由)
   ```

2. `site/src/lib/affiliates/catalog.ts` を編集:
   ```diff
     {
       id: "rakuten-securities-jp",
       category: "finance",
       markets: ["JP"],
       locales: ["ja"],
       name: { ja: "楽天証券" },
       description: { ja: "NISA・iDeCo・米国株が..." },
       cta: { ja: "口座開設を見る" },
   -   url: { default: "#pending-rakuten-securities" },
   +   url: { default: "https://m.r10.to/r5ABCDE" },
       network: "moshimo",
       badge: "📈",
   -   pending: true,
   +   pending: false,
     },
   ```

3. (任意) 新規エントリ追加: 同じ構造でCATALOG配列の末尾に追加

4. `npm run build` でビルド確認 → push → 自動デプロイ

### 重要: クリック先の URL 検証

公開前に必ず:
- [ ] リンクをクリックして遷移先サイトに到達すること
- [ ] 提携先サイトのページが想定どおりであること
- [ ] アフィリエイトIDがURLに含まれていること

---

## カテゴリと案件のマッピング目安

カタログ既存 + 推奨追加:

| カテゴリ | 既存 (pending) | 推奨追加案件 |
|---|---|---|
| finance | 楽天証券・SBI証券・楽天カード・Wealthfront | 三井住友カード、auじぶん銀行ローン、SoFi (US) |
| health | マイプロテイン・iHerb・あすけん | プロテイン特化 (DNS, ザバス) |
| text | Grammarly・1Password・ConoHa | NordVPN、Bitwarden、JetBrains |
| color | Adobe CC・Canva | Figma、Shutterstock |
| datetime | Todoist | Google Workspace |
| math | Notion | Microsoft 365、Obsidian |

---

## 開示・コンプライアンス チェックリスト

景表法ステマ規制 (2023.10〜) + 特商法 + AdSenseポリシー対応:

- [x] `RelatedServices` の各カードに「広告」「Sponsored」「广告」ラベルを表示
- [x] `/disclosure` ページに詳細開示 (3言語)
- [x] フッターから `/disclosure` への到達導線
- [x] privacy / terms 内にもアフィリエイト言及
- [x] 特商法表記 (`/disclosure` 内に統合)
- [x] `rel="sponsored noopener noreferrer"` 属性付与 (Google ガイドライン準拠)
- [ ] (Phase 4) Google Tag Manager / GA4 でアフィリクリック計測

---

## 実装後の動作確認

```bash
# 開発サーバ起動
cd site && npm run dev

# 任意のツールページをブラウザで開く
# → 下部に「おすすめサービス」セクションが表示されるか確認
# → 「広告」ラベル + クリック (pending: true なら無効化表示)

# 本番ビルドで /disclosure 確認
curl -sS https://tools.appdevelopsk.com/ja/disclosure | grep -o "広告.*$" | head
curl -sS https://tools.appdevelopsk.com/en/disclosure | grep -o "Sponsored.*$" | head
curl -sS https://tools.appdevelopsk.com/zh-CN/disclosure | grep -o "广告" | head
```

---

## トラブルシューティング

| 症状 | 原因 | 対処 |
|---|---|---|
| カードが表示されない | カテゴリ一致なし or 全エントリ pending | catalog.ts のcategoryを確認、または `pending: false` に変更 |
| 「広告」ラベルが出ない | i18n キー欠落 | `npm run audit:i18n` でチェック |
| クリック計測されない | GA4 イベント未実装 | Phase 4 で対応 |
| ASP却下 | サイトの内容が薄い | ツール数を増やす、コンテンツを充実 (現在62本で十分なはず) |

---

## 想定スケジュール

```
今日 (2026-05-07)  AdSense申請 + ASP 4社登録
+1日              ASP 仮承認来始め
+3日              個別案件提携申請
+1週間            初回案件承認 → catalog 更新
+2週間            主要15案件のpending解除
+3週間            AdSense承認 → 本格収益化開始
+1ヶ月            最初のアフィリ報酬発生
+3ヶ月            月50K PV → Mediavine 申請可能
```

---

## 緊急時の停止方法

万一規約違反で警告を受けた場合の即時対応:

1. `catalog.ts` の問題エントリの `pending: true` に戻す → コミット → push
2. 自動デプロイ後 (1-2分)、該当オファーは無効化される
3. ASP管理画面で該当案件を停止
4. 警告内容を確認して原因対処

`/disclosure` ページの内容も同様に監査・修正可能。
