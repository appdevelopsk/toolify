# Indexing Acceleration — User Action Plan

**現状 (2026-05-08 確認):**
- Google: ホーム1ページのみインデックス、`/tools` 未認知、ツール詳細は「Discovered, not indexed」
- 90日間 Search 表示回数 0、クリック 0
- Bing IndexNow: 403継続 (BWT propagation 中、最大数日)
- Yandex/Naver: 全 756 URL 受理済み

**Claude側で完了したこと:**
- ✅ ホームに全120ツールへのリンク (A-Z 一覧) 追加 → Google が home から直接全URLを発見可能に
- ✅ /tools に ItemList 構造化データ追加 (120 items)
- ✅ /opensearch.xml 配信 + `<link rel="search">` 設置
- ✅ /feed.xml RSS、/tools.json (machine-readable directory) 既存
- ✅ Yandex IndexNow に全 756 URL 一括通知
- ✅ Naver IndexNow に全 756 URL 一括通知
- ✅ Wayback Machine に主要ページを永続archive (18ページ)
- ✅ GitHub repo `appdevelopsk/toolify` の description, homepage, topics 設定 (検索発見性UP)
- ✅ Sitemap を Google Search Console に再送信 (756 URL)

---

## あなたが今やること (優先度順)

### 🔴 最優先 — 今日中 (合計 30分)

#### 1. GSC URL Inspection で手動 indexing 申請 (10分)

Google は API 経由の indexing 申請を一般用途では受け付けないため、**ダッシュボードから手動申請が最強の手段**。1日10件まで、手動でしか押せない「インデックス登録をリクエスト」ボタン。

1. https://search.google.com/search-console を開く
2. プロパティ `https://tools.appdevelopsk.com/` を選択
3. 上部の URL検査バーに以下を1個ずつ貼り付けて Enter → 結果ページで **「インデックス登録をリクエスト」** ボタン

**今日申請すべき優先10URL (en/ja の人気ツール):**

```
https://tools.appdevelopsk.com/en/tools
https://tools.appdevelopsk.com/ja/tools
https://tools.appdevelopsk.com/en/tools/bmi-calculator
https://tools.appdevelopsk.com/ja/tools/bmi-calculator
https://tools.appdevelopsk.com/en/tools/mortgage-calculator
https://tools.appdevelopsk.com/en/tools/mortgage-refinance-calculator
https://tools.appdevelopsk.com/en/tools/loan-calculator
https://tools.appdevelopsk.com/en/tools/compound-interest-calculator
https://tools.appdevelopsk.com/en/tools/retirement-calculator
https://tools.appdevelopsk.com/en/tools/cost-of-living-comparison
```

**明日の10件 (高RPMツール優先):**
```
https://tools.appdevelopsk.com/en/tools/lease-vs-buy-calculator
https://tools.appdevelopsk.com/en/tools/investment-fee-impact-calculator
https://tools.appdevelopsk.com/en/tools/debt-to-income-ratio-calculator
https://tools.appdevelopsk.com/en/tools/life-insurance-needs-calculator
https://tools.appdevelopsk.com/en/tools/credit-utilization-calculator
https://tools.appdevelopsk.com/en/tools/roi-calculator
https://tools.appdevelopsk.com/en/tools/tax-bracket-calculator
https://tools.appdevelopsk.com/en/tools/salary-converter
https://tools.appdevelopsk.com/en/tools/roas-calculator
https://tools.appdevelopsk.com/en/tools/cagr-calculator
```

#### 2. Bing Webmaster Tools 上で同じ申請 (5分)

https://www.bing.com/webmasters → 「URL Inspection」タブ。Bing は API 経由を受け付けないが Webmaster UI 経由なら 1日10件 OK。

#### 3. SK APPS apex (`appdevelopsk.com`) から `tools.appdevelopsk.com` への内部リンク追加 (15分)

apex は既にインデックスされているはず。apex の Header / Footer / 関連リンクから tools 子ドメインへの contextual link を入れると、リンクジュース が一気に流れる。
- 各 app ページの「便利ツール」セクションで関連ツール 2-3 個を href リンクで埋め込む
- フッターで `https://tools.appdevelopsk.com` への永続リンク

(apex のソースが別 repo なら、そちらで PR 作成 → 1日経過後に GSC で URL Inspection を再実行)

---

### 🟡 高優先 — 今週中 (各 30分以内)

#### 4. Hacker News "Show HN" 投稿 (公開後の最大の流入源)

https://news.ycombinator.com/submit

**タイトル候補:**
- `Show HN: Toolify – 120+ free calculators in 6 languages, no signup`
- `Show HN: 120+ calculator tools with first-class i18n (en/ja/zh-CN/zh-TW/ko/es)`

**本文ガイド:**
- なぜ作ったか（AdSense + 多言語の量産型実験、HCU耐性検証）
- 技術スタック (Next.js 15 SSG, Cloudflare Pages, next-intl, opencc-js)
- 興味深い数字 (120 tools × 6 locales = 720 ページ pre-render)
- 何を学んでほしいか (HCU 対策、6言語の量産フロー)

**投稿後のフォロー:**
- 1時間以内に 5+ upvote / 1+ コメントで HN フロントページにリーチ可能
- コメントには丁寧に応答 (技術質問、批判、リクエスト全て)

#### 5. Reddit `/r/InternetIsBeautiful` `/r/SideProject` `/r/SaaS` 投稿 (各 1日空ける)

- /r/InternetIsBeautiful (3M users): 純粋に「便利」訴求
- /r/SideProject (350k): 個人開発色を出す
- /r/SaaS (180k): "monetization story" 寄り

各 sub に 1 週間空けて投稿 (spam 判定回避)。

#### 6. Product Hunt 投稿 (https://www.producthunt.com/posts/new)

- ローンチ日は 火-木 の太平洋時間 0:01 AM が伝統的に最強
- ハンター (有名アカウント) を確保できれば up vote 数倍に
- 最低限: スクリーンショット 5 枚、120 ツールのカテゴリ別 GIF

#### 7. AlternativeTo (https://alternativeto.net/software/calculator-net/)

- "calculator.net" の代替として登録
- カテゴリ: Online Service / Web App
- 無料 / 多言語の差別化を強調

---

### 🟢 中優先 — 今月中

#### 8. GitHub Awesome Lists へ PR

- `awesome-calculators` (もしあれば)
- `awesome-i18n` 系
- `awesome-static-sites` 系

`awesome-` で gh search → 関連 list の README に PR で追加。各 PR は被リンク 1 本。

#### 9. dev.to / Zenn / Qiita で技術記事

「120ツール × 6言語 量産型サイトをClaudeで作った話」のような体験記。

- dev.to (英語、weekly digest 流入大)
- Zenn (日本語、エンジニア層)
- Qiita (日本語、SEO 強い)

各記事から 2-3 ツールへの contextual link。

#### 10. GA4 + GSC 連携 + Search 表示開始の確認

- GSC を毎日チェック (impressions が 0→数 になる瞬間)
- GA4 でオーガニック trafficが入り始めたら最初の流入クエリを確認
- 上位 5 ツールを把握 → そこにアフィリエイト最優先で実装

---

## タイムライン期待値

| 時点 | 期待される状態 |
|---|---|
| **今日 (1-2日後)** | 手動申請したURL が「Crawled - currently not indexed」へ昇格 |
| **1週間後** | 申請した 20 URL のうち 10-15 が `Indexed` |
| **2-4週間後** | sitemap 全体の 30-50% がインデックス、最初の impressions が GSC に出始める |
| **1-2ヶ月後** | 60-80% インデックス、long-tail キーワードで 1日 5-50 セッション |
| **3-6ヶ月後** | 80-95% インデックス、月間数百〜数千セッション、AdSense 月 1,000-10,000円 |
| **6-12ヶ月後** | 被リンク獲得が効き始め、月間数千〜数万セッション、月収 ¥10,000-100,000 |

**重要:** これは「期待値」であって保証ではない。Reddit/HN で1本バズるとタイムラインが3ヶ月縮まることもあるし、競合が強すぎてランクインしない可能性もある。

## やってはいけないこと

- ❌ 短期間に 100 件以上 URL Inspection で申請 (spam 判定の懸念)
- ❌ 同じ Reddit sub に 1ヶ月以内に 2回以上投稿
- ❌ 自動化ツールで「人気サイト」へ大量被リンク (Google の手動ペナルティ対象)
- ❌ AdSense 承認前に過剰な広告枠を表示 (今は dev placeholder OFF にしてあるので OK)
