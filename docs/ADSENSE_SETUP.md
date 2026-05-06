# AdSense setup

## 0. Pre-application checklist

AdSense審査の通過率は2025-26で大きく落ちた。以下を全て揃えてから申請する:

- [ ] 30〜50ツール公開済み（10未満はほぼ落ちる）
- [ ] プライバシーポリシー（運営者情報・連絡先入り、雛形コピペ禁止）
- [ ] 利用規約
- [ ] About ページ（実体ある運営エンティティの記載）
- [ ] お問い合わせ手段（メール or フォーム）
- [ ] 独自ドメイン（`*.pages.dev` のままでも通る場合があるが審査落ち事例多）
- [ ] sitemap.xml + robots.txt がアクセス可能
- [ ] ads.txt が `/ads.txt` で配信される
- [ ] CWV: モバイル Lighthouse 全カテゴリ 90+
- [ ] HTTPSでアクセス可（CF Pagesは自動）
- [ ] 各ツールが「実際に動く」 = ロジック実装済み
- [ ] AI生成テキストの「におい」を消す（定型句なし、具体的な数値・式・出典あり）

## 1. AdSense アカウント作成

1. https://www.google.com/adsense/start/ で登録
2. サイトURLを登録（独自ドメイン推奨）
3. AdSenseコード（`<script>`）を提供されるが、すでに `AdScript` コンポーネントで対応済み
4. `.env.local` に `NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXXXXXX` を設定
5. `public/ads.txt` の `pub-XXXXXXXXXXXXXXXX` を実IDに置換
6. 審査用にデプロイ → AdSense管理画面で「審査に出す」

審査期間: 2〜30日（最近は長い傾向）。

## 2. 広告ユニット作成

審査通過後、以下4つの広告ユニットを作成し、ID（data-ad-slot）を `.env.local` に設定:

| 用途 | タイプ | 環境変数 |
|---|---|---|
| 上部レスポンシブ | Display ads → Square/Rectangle/Auto | `NEXT_PUBLIC_ADSENSE_SLOT_BANNER` |
| 記事中インフィード | In-article ads | `NEXT_PUBLIC_ADSENSE_SLOT_INARTICLE` |
| 結果直下 | Display ads → Auto | `NEXT_PUBLIC_ADSENSE_SLOT_BELOWRESULT` |
| サイドバー（PC） | Display ads → Vertical | `NEXT_PUBLIC_ADSENSE_SLOT_STICKY` |

## 3. CMP (Consent Management Platform) — EU/UK 必須

Google Funding Choices（無料）を使用:

1. https://fundingchoices.google.com/ にログイン
2. 新規メッセージ作成 → サイトドメイン登録
3. 提供される `<script>` を `app/[locale]/layout.tsx` の `<head>` に追加
4. 弊サイトの ConsentBanner と動作競合しないか確認（基本は Funding Choices のみで足りる）

未対応の場合、EUからのアクセスでは AdSense が広告を出さない（収益ゼロ）。

## 4. ポリシー遵守の運用

- **広告密度**: 1ページの広告は本文の30%以下（Better Ads Standards）
- **広告とコンテンツの距離**: ボタン直近の広告は誤クリック誘発で違反
- **クリック誘導NG**: "Click here", "広告をクリック" 等の文言禁止
- **自己クリックNG**: 自分のサイトの広告をクリックしない（即BAN）
- **トラフィック品質**: ボット流入や購入トラフィック禁止

## 5. 収益化フェーズ進行

| 月間セッション数 | 推奨アドネットワーク |
|---|---|
| 0〜10K | AdSense |
| 10K〜50K | Ezoic（AdSense置換 + 入札最適化、+20-40%） |
| 50K〜 | Mediavine / Raptive / Ezoic Premium（2-5x） |

切り替え時は AdScript / AdSlot を差し替えるだけで済む構造になっている。

## 6. トラブルシューティング

| 症状 | 原因 | 対処 |
|---|---|---|
| 審査落ち "Low value content" | ツール数 < 20、コンテンツ薄 | ロングフォーム解説とFAQを各ツールに追加 |
| 審査落ち "Site navigation" | フッター/プライバシーリンク欠落 | レイアウトを再確認 |
| 広告が表示されない | ads.txt 未配信、 client ID typo | `/ads.txt` を直接アクセスして確認 |
| EU からの広告ゼロ | CMP 未設定 | Funding Choices を組み込む |
| 急に収益が落ちた | ポリシー違反 | AdSense Policy Center を確認 |
