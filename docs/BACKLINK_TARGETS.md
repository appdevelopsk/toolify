# Backlink Targets — submission queue

技術SEOで勝負がつかないため、外部からの**ドメインオーソリティ供給**が必要。  
以下のリストは「自分でフォーム送信できる」「reddit/forum 系の手投稿で被リンク取れる」ターゲット。月3-5件のペースで送信していくのが現実的（一括送信は spam 判定リスク）。

## 機械可読フィード（既に公開）

- `https://tools.appdevelopsk.com/sitemap.xml` — Google/Bing 用
- `https://tools.appdevelopsk.com/tools.json` — 全ツール一覧（json）。ディレクトリ系の登録時に貼り付け
- `https://tools.appdevelopsk.com/feed.xml` — RSS フィード（最新50件）。ツール直近更新を流す

`tools.json` は、Product Hunt や AlternativeTo の手動登録時に「サイト全体一覧」として参照可能。  
`feed.xml` は IFTTT/Zapier 経由で Twitter X 自動投稿にも使える。

---

## Tier 1 — 高効果・無料ディレクトリ（最優先・先に終わらせる）

| サイト | URL | 期待DA | 備考 |
|---|---|---|---|
| **Product Hunt** | https://www.producthunt.com/posts/new | 91 | 1ツール = 1 launch ではなく「Toolify」全体を1つのプロダクトとして登録。launch日に SNS拡散重要 |
| **AlternativeTo** | https://alternativeto.net/contributors/submit-software/ | 84 | 「BMI Calculator」を既存の代替として、それ以外も個別申請可能 |
| **ToolFinder** | https://toolfinder.io/submit | 41 | AI/ツール系特化。手動承認 |
| **G2** | https://www.g2.com/products/new | 92 | カテゴリ「Calculator software」「Web utilities」 |
| **Capterra** | https://www.capterra.com/vendors/sign-up | 89 | B2B寄りだが計算ツールも掲載可 |
| **SaaSHub** | https://www.saashub.com/submit | 49 | 無料SaaS含むディレクトリ |
| **Tinylauncher** | https://tinylauncher.com/ | 35 | small SaaS 専用 |
| **BetaList** | https://betalist.com/submit | 70 | β段階扱いで初期ユーザ獲得 |

## Tier 2 — ニッチ計算機ディレクトリ

| サイト | URL | 用途 |
|---|---|---|
| **Calculator.net で言及されているか** | https://calculator.net | 直接登録は不可だが、彼らの古い計算機リストの代替として AlternativeTo に登録 |
| **MathTools.net** | https://www.mathtools.net/contact.html | 数学系ツール |
| **CSS-Tricks Roundup** | (記事内Mention) | コンタクト経由で「カラーツール集」記事に追加依頼 |
| **Smashing Magazine Resources** | (記事内Mention) | 同上 |

## Tier 3 — Reddit / 手動投稿

被リンクとしての価値は低いが、**初期トラフィックと有機的バックリンクの種**になる:

| Subreddit | フィット |
|---|---|
| r/InternetIsBeautiful | 一般向けツール紹介専用。但しモデレータ厳しい |
| r/coolguides | ガイド系（記事ロングフォームを抜粋して投稿） |
| r/personalfinance | DTI, life-insurance, ROAS, credit-utilization, annuity 各ツール |
| r/financialindependence | retirement, compound interest |
| r/loseit | weight-loss, calorie, BMR |
| r/learnprogramming | json-formatter, regex-tester, jwt-decoder |
| r/webdev | color-converter, hash-generator, base64 |

Reddit は spam 判定回避のため「自社サイトのリンク投稿」は週1まで。ベターは:
1. 通常のコメントで「この計算ならこのツールが楽」と紹介
2. アカウントの karma が 100+ 溜まってから本格運用

## Tier 4 — 技術系ニュースアグリゲータ

| サイト | URL | 投稿方法 |
|---|---|---|
| **Hacker News** | https://news.ycombinator.com/submit | "Show HN: Toolify — 116 calculators in 6 languages" |
| **Lobste.rs** | https://lobste.rs/ | 招待制。tag: "show" |
| **DEV Community** | https://dev.to/new | 記事投稿。「Toolify を作った話」「100ツールを多言語対応した話」 |
| **Indie Hackers** | https://www.indiehackers.com/post | "Show IH" カテゴリ |

---

## 投稿スクリプト（Show HN 用テンプレート）

```
Show HN: Toolify — 116 free browser-based calculators (6 languages)

I built a multi-language tool site — calculators, converters, and validators
that all run in-browser with no signup. Currently 116 tools across finance,
health, math, datetime, text, color, converter categories. All available in
English, Japanese, simplified/traditional Chinese, Korean, and Spanish.

Key choices:
- 1 tool = 1 page (no SEO doorway clusters)
- Long-form explainers with FAQ on each tool (HCU compliance)
- No tracking — calculations stay in the browser
- machine-readable directory at /tools.json and RSS at /feed.xml

Built with Next.js 15 + next-intl. Deployed to Cloudflare Pages.

Site: https://tools.appdevelopsk.com
Directory: https://tools.appdevelopsk.com/tools.json

Curious to hear what tools you'd want added.
```

## 追跡

提出ステータスは Notion / スプレッドシート / GitHub Issue で管理推奨。各サイトについて:
- [ ] 提出済み
- [ ] 承認済み (URL記録)
- [ ] バックリンク確認済み（Ahrefs / Search Console）

承認まで2-8週間が普通。1ヶ月後に承認チェック → 漏れは再申請。

---

## Anti-pattern（やってはいけない）

- ❌ PBN（Private Blog Network）から購入リンク → Google ペナルティ
- ❌ 無料ディレクトリ100件一括送信 → spam判定で逆効果
- ❌ Fiverr のバックリンクサービス → ほぼ全て低品質、回復に半年かかる
- ❌ 同一アンカーテキストで多数のリンク → 不自然なリンクプロファイル
- ❌ 同日に複数の同種フォーラムへ投稿 → BOT 認定
