# Toolify — web advertisement project rules

> 量産型ツールサイト。AdSense + 多言語 + 機能差別化で2026年のGoogle検索/HCUを生き残ることが目的。

---

## アーキテクチャ要点

- **1ドメイン集約**: AdSense審査が1回で済み、ドメインオーソリティが集中する
- **Next.js 15 App Router** (SSG, ISR for data tools)
- **VPS（Ubuntu + nginx + PM2）** にデプロイ。GitHub Actions `deploy.yml` が standalone ビルドを VPS へ rsync → PM2 プロセス `toolify`（:8500）を reload。詳細は `docs/DEPLOY.md`
- **next-intl** で多言語、URL prefix は `/[locale]/...`
- 言語: **17言語すべて active**（en, ja, zh-CN, zh-TW, ko, es, pt-BR, fr, de, it, ru, ar, hi, id, th, vi, tr）。`lib/i18n/locales.ts` で定義。各ツールの `messages/{locale}.json` も17言語分翻訳済みで本番公開中。新規ツール追加時は **必ず17言語の messages/ を揃える**（一部欠落のまま active 公開は HCU リスク）
- ジャンル: 「日常で使える計算/変換ツール」系から開始

## ⚠️ 守るべき方針（HCU生存条件）

1. **1ページ = 1機能**。記事だけのページは作らない
2. **ロングフォーム解説は削らない**（FAQ 8件、article.sections 3件以上）
3. **自動翻訳のみは禁止**。Claudeで翻訳した後、locale別の examples / 引用元 / 用語を必ずローカライズ
4. **AI生成色を消す**: 「In conclusion」「Furthermore」等の定型句、空虚な総論段落は禁止
5. **AdSense審査前**: 30〜50ツール + 法令ページ4種（privacy/terms/about/contact）を完成必須
6. **Auto Adsは使わない**: 手動配置で収益+30〜50%
7. **Consent Mode v2 必須**（EU向け、未対応 = EU広告ゼロ）

## ディレクトリ

```
site/                 Next.js本体
  src/app/[locale]/   ロケール付きルート
  src/tools/<slug>/   各ツールの実装 + i18n
  src/lib/seo/        構造化データ・metadata
  src/lib/i18n/       locale定義（17言語フル稼働）
  src/components/     共通UI + 広告ユニット
pipeline/
  specs/              ツール仕様 YAML（量産時の入力）
  prompts/            Claude Code 用プロンプト群
  scripts/generate.sh 量産エントリ
docs/                 ARCHITECTURE / ADSENSE_SETUP / TOOL_PIPELINE
```

## ツール量産フロー（標準）

1. `pipeline/specs/<slug>.yaml` を書く（5分）
2. Claude Code で:
   - `pipeline/prompts/01_implement.md` → Component / index.ts
   - `pipeline/prompts/02_seo.md` → en.json
   - `pipeline/prompts/03_translate.md` → 残り16言語（ja, zh-CN, zh-TW, ko, es, pt-BR, fr, de, it, ru, ar, hi, id, th, vi, tr）全て生成。一部だけで止めない
3. `cd site && npm run validate` で型/ i18n / SEO チェック
4. `npm run build` で全ビルド成功確認
5. `main` へ push すると GitHub Actions（`deploy.yml`）が VPS へ自動デプロイ

## チェックスクリプト

| 用途 | コマンド |
|---|---|
| TypeScript | `npm run typecheck` |
| i18n キー一致 | `npm run audit:i18n` |
| SEO最低基準 | `npm run audit:seo` |
| 全部まとめて | `npm run validate` |
| ビルド | `npm run build` |

## 環境変数

**ローカル開発**: `site/.env.local`（コミット禁止）。未設定でも開発・ビルドは通る（プレースホルダ表示）。

```
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_ORG_NAME=Toolify
NEXT_PUBLIC_CONTACT_EMAIL=contact@example.com
NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXXXXXX
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

**本番**: ビルド時の env は GitHub リポジトリの Secrets から `deploy.yml` 経由で注入される（`GA_ID`, `RAKUTEN_*`, `ADSENSE_SLOT_*` 等）。設定変更は Secret 更新 → `main` へ push で再デプロイ。詳細は `docs/DEPLOY.md`。

## 翻訳ルール（Claude Code 自身が実行）

App側のCLAUDE.mdに準拠 — 外部翻訳API禁止、Claude Code (=自分) が直接翻訳する。
詳細は `pipeline/prompts/03_translate.md`。

## デプロイ前チェック

1. `npm run validate` PASS
2. `npm run build` PASS（`output: "standalone"`。`.next/standalone/` に Node サーバが出力され VPS で PM2 稼働）
3. Lighthouse モバイル 各カテゴリ 90+
4. `/sitemap.xml` `/robots.txt` `/ads.txt` がアクセス可能
5. プライバシー・規約・お問い合わせの3ページが完備

## アンチパターン（過去の事故ベース）

- ❌ 機械翻訳API（DeepL / Google Translate 等）に依存して翻訳する → AI生成色が残り HCUペナルティ。翻訳は必ず Claude Code 自身が文脈考慮で行い、ロケール固有の examples / 用語 / 引用元をローカライズする
- ❌ 新規ツールを一部言語だけで公開する → 17言語の messages/ を揃えてから push（揃わないツールは追加してはいけない）
- ❌ 広告枠を本体上部に詰めすぎる → Better Adsポリシー違反
- ❌ ツール数が10未満で AdSense申請 → ほぼ落ちる
- ❌ Auto Adsで放置 → 収益低 + UI崩壊
- ❌ プライバシーポリシーの雛形コピペで運営者情報なし → 審査落ち
