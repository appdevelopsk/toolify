# AdSense審査直前チェックリスト

申請ボタンを押す前に、このリストを上から順に確認してください。1つでも未達の項目があれば審査落ちのリスクが上がります。

## A. 必須インフラ（10/10 達成必須）

- [ ] 独自ドメインで HTTPS 配信されている（`*.pages.dev` でも通る場合があるが審査落ち事例多数）
- [ ] `https://<domain>/sitemap.xml` にアクセスでき、有効なXML（最低50 URL以上推奨）
- [ ] `https://<domain>/robots.txt` にアクセスでき、Sitemapを指している
- [ ] `https://<domain>/ads.txt` にアクセスでき、`pub-XXXXXXXXXXXXXXXX` が実IDに置換されている
- [ ] Search Console でドメイン認証済み・sitemap.xml 送信済み
- [ ] GA4 が稼働している（最低1〜2週間の流入データを推奨）
- [ ] Cloudflare Pages のビルドが成功し、最新コミットが本番反映されている
- [ ] モバイルでのページ表示が崩れていない（Chrome DevTools Device Modeで確認）
- [ ] 主要ツール5本でJavaScriptエラー無し（DevTools Console）
- [ ] `/api/og` で動的OG画像がPNGで返る

## B. コンテンツ品質（HCU耐性）

- [ ] **30ツール以上**公開（推奨50+。現状: 54ツール ✓）
- [ ] 各ツールが**実際に動作**する（プレースホルダ・404・「Coming soon」NG）
- [ ] 各ツールに**8件以上のFAQ + 3セクション以上のロングフォーム**（現状: 全ツール準拠 ✓）
- [ ] 「In conclusion」「Furthermore」等のAI生成定型句が含まれていない（手動目視 or grep）
- [ ] 各ツールに**最終更新日**（`updatedAt`）が表示される
- [ ] 関連ツールへの内部リンクが各ページに5本以上
- [ ] パンくずナビゲーションがすべてのツールページに表示される

```bash
# 定型句チェック（grep）
cd site && grep -r "In conclusion" src/tools/ src/messages/ | head -5
grep -r "Furthermore" src/tools/ src/messages/ | head -5
```

## C. 法令・運営者情報（審査の落とし穴）

- [ ] `/about` に**実体ある運営者情報**（個人名 or 法人名 + 所在地 or 連絡先）
- [ ] `/contact` に**実メアドかフォーム**（捨てメアドNG、`mailto:` 直リンクOK）
- [ ] `/privacy` に以下を記載:
  - [ ] Cookie使用の説明
  - [ ] Google Analytics 使用の明記
  - [ ] AdSense 使用の明記 + Googleの広告ポリシーへのリンク
  - [ ] GDPR/CCPA/個人情報保護法に基づく権利行使の連絡先
  - [ ] 最終更新日
- [ ] `/terms` に免責事項・準拠法・連絡先
- [ ] フッターに 4ページすべてへのリンク（現状: 完備 ✓）

## D. SEO・技術品質

- [ ] Lighthouse モバイル全カテゴリ 90+
  - [ ] Performance ≥ 90
  - [ ] Accessibility ≥ 95
  - [ ] Best Practices ≥ 90
  - [ ] SEO ≥ 95
- [ ] CWV: LCP < 2.5s / INP < 200ms / CLS < 0.1
- [ ] 各ツールページに `<title>` と `<meta description>` 設定（現状: 全ツール準拠 ✓）
- [ ] schema.org 構造化データが Google Rich Results Test を通る
- [ ] hreflang が全アクティブlocaleで出力されている
- [ ] 4xx/5xx エラーがアクセスログにない（CFアナリティクスで確認）

```bash
# Lighthouse 計測（CI または手動）
cd site && npm run lighthouse  # スクリプトは要実装、暫定で:
npx lhci autorun --collect.url=https://<domain>/en --collect.url=https://<domain>/en/tools/bmi-calculator
```

## E. 広告枠の準備

- [ ] **AdSense アカウント開設**（Googleアカウントから）
- [ ] サイトURLを AdSense に登録 → 審査用コードが提供される
- [ ] `NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXXXXXX` を設定済み
- [ ] `public/ads.txt` の実IDが正しい
- [ ] AdScript（`<script>`）が全ページの `<body>` 末尾に挿入される（現状: AdScript コンポーネントで対応 ✓）
- [ ] 4種の広告ユニットIDを取得して環境変数に設定（審査通過後でOK）:
  - `NEXT_PUBLIC_ADSENSE_SLOT_BANNER`
  - `NEXT_PUBLIC_ADSENSE_SLOT_INARTICLE`
  - `NEXT_PUBLIC_ADSENSE_SLOT_STICKY`
  - `NEXT_PUBLIC_ADSENSE_SLOT_BELOWRESULT`

## F. CMP（EU向け）

- [ ] **Google Funding Choices** でメッセージ作成済み
- [ ] `NEXT_PUBLIC_FC_ID` 設定済み
- [ ] EU からのアクセスで同意バナーが表示されることを VPN で確認
- [ ] 「Accept all」「Reject all」「Customize」3択が表示される
- [ ] 拒否時は非パーソナライズ広告のみ配信される

未対応の場合: EU/UK からの広告収益がゼロになります。

## G. ポリシー違反になりやすい NG パターン

- [ ] 自動生成色が強いコピー量産になっていない（手動目視）
- [ ] 1ページの広告占有率が30%以下（Better Ads Standards）
- [ ] 広告とボタンが密接していない（誤クリック誘発防止）
- [ ] 「広告をクリック」「Click here」等の誘導表現がない
- [ ] 自分のサイトの広告をクリックしていない（即BAN対象）
- [ ] スクレイピング・コピペコンテンツがない
- [ ] アダルト・違法コンテンツがない（明らか）

## H. 申請

ここまで全部 ✓ なら申請可能:

1. AdSense ダッシュボード → 該当サイト → **「審査をリクエスト」**
2. 提供された確認コード（`<script>`）が `<head>` に挿入されているか確認（AdScript コンポーネントで対応済み）
3. **何もしないで2〜30日待つ**（最近は長期化傾向）

## I. 審査落ち時の対処

落ちた場合、AdSense は具体的なポリシー違反箇所を教えてくれません。最頻出の原因:

| 原因 | 対処 |
|---|---|
| Low value content / Insufficient content | ツール数を増やす + ロングフォームを長くする |
| Site navigation | フッター・ナビ・パンくず・関連リンクを再確認 |
| Page experience | Lighthouse スコア改善、CWV改善 |
| Policy compliance: medical/financial advice | 医療・金融系ツールに「専門家相談を」の文言追加 |
| Privacy violations | プライバシーポリシーに不足項目を追加 |

修正してから再申請。再申請の間隔制限はないが、同じ内容で連続申請しても結果は変わらない。

## J. 承認後の運用

承認されたら以下を即時実行:

1. **広告ユニットIDを設定 → 再デプロイ**
2. **CMP を有効化**（`NEXT_PUBLIC_FC_ID` 設定 + `fundingchoices.google.com` でメッセージON）
3. **AdSense Policy Center を週1で確認**（違反検出は自動でメール来るが、念のため）
4. **収益最適化**（数週間後）:
   - **Auto Ads は使わない**（手動配置の方が +30〜50%）
   - 広告ユニットの位置・サイズを A/B テスト
   - **Ezoic** へ昇格検討（10K セッション/月以降、+20〜40%）
   - **Mediavine / Raptive** へ昇格検討（50K セッション/月以降、2-5x）

## K. 緊急避難策（BAN になった時）

AdSense でアカウント停止された場合の代替:

- **Ezoic** — AdSense より審査ゆるい（要 10K MAU）
- **Adsterra / PropellerAds** — 審査ほぼ無し、収益単価は低め
- **アフィリエイト**（Amazon Associates、A8.net 等）— ツール文脈で関連商品を紹介
- **メンバーシップ / 寄付** — Buy Me a Coffee、GitHub Sponsors など

CFG 構造（`AdScript` コンポーネントが client ID を環境変数で参照）になっているため、別ネットワークへの差し替えは数行の編集で可能。
