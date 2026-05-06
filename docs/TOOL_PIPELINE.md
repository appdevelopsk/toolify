# Tool production pipeline

新規ツール = `pipeline/specs/<slug>.yaml` 1ファイル → Claude Code 経由で全ファイル自動生成 → ビルド → デプロイ。

## 1ツールあたりの所要時間

- 仕様書記述（人）: 5分
- Claude実装＋翻訳: 10〜20分（自動）
- レビュー＋微調整: 5〜10分
- **合計: 20〜35分/ツール**

## 標準フロー

### Step 1: spec を書く

```bash
cp pipeline/specs/_template.yaml pipeline/specs/my-new-tool.yaml
$EDITOR pipeline/specs/my-new-tool.yaml
```

最低限必要な項目:
- `slug`: URL slug（kebab-case）
- `category`: health / math / converter / datetime / text / color / finance
- `applicationCategory`: schema.org値（HealthApplication, UtilitiesApplication, FinanceApplication 等）
- `primaryKeyword`: { en, ja }
- `inputs[]`: type は number / select / toggle / date / text
- `output`: type と label_key
- `logic`: 自然言語で計算式を記述（Claudeが実装する）
- `locales`: en, ja から始める

### Step 2: Claude Code でコード生成

リポジトリ内で Claude Code を起動し、以下を依頼:

```
pipeline/specs/my-new-tool.yaml を読んで、pipeline/prompts/01_implement.md
の手順で実装してください。
```

これだけで:
- `site/src/tools/my-new-tool/Component.tsx`
- `site/src/tools/my-new-tool/index.ts`
- `site/src/lib/tools/registry.ts` への登録追加

が完了する。

### Step 3: SEOコンテンツ生成

```
pipeline/prompts/02_seo.md の手順で en.json を作ってください。
```

→ `site/src/tools/my-new-tool/messages/en.json`（タイトル・description・keywords・FAQ・ロングフォーム解説）

### Step 4: 翻訳

```
pipeline/prompts/03_translate.md の手順で ja.json を作ってください。
```

→ `site/src/tools/my-new-tool/messages/ja.json`

Phase 2で17言語拡張する際は、各 locale を順次追加。

### Step 5: 検証

```bash
cd site
npm run validate     # typecheck + i18n diff + SEO audit
npm run build        # 全 [locale]/[slug] が pre-render される
```

赤が出たら修正。validate が通ったらコミット。

### Step 6: デプロイ

GitHub に push → Cloudflare Pages が自動デプロイ。Sitemap も再生成される。

## 品質ゲート（自動チェック）

| ゲート | スクリプト | 失敗条件 |
|---|---|---|
| TypeScript | `npm run typecheck` | 型エラー |
| i18n キー一致 | `npm run audit:i18n` | locale間でキー過不足 |
| SEO 最低基準 | `npm run audit:seo` | title/desc/faq/sections不足 |
| ビルド | `npm run build` | render エラー |

## ツール選定ガイド

### ✅ 量産に向く
- 計算機系（BMI、税額、ローン、複利、退職金、各種比率）
- 単位変換（長さ、重さ、面積、体積、温度、速度、エネルギー）
- 日時系（年齢、日数、タイマー、世界時計、カレンダー差）
- テキスト処理（文字数、単語数、Base64、URLエンコード、JSON整形）
- カラー（HEX↔RGB↔HSL、コントラスト比、パレット）
- 暗号系（ハッシュ、QRコード、UUID）

### ❌ 避ける（Google競合過多 or HCUリスク）
- 「○○とは」型の解説のみのページ
- レシピ・How-to型のテキストコンテンツ
- ニュース・トレンド系（早期に陳腐化）

## 一括量産時の注意

20ツール以上を短期間に一気に公開すると Google が「量産サイト」シグナルとして
検出する可能性がある。**1日1〜3ツール**のペースで段階公開し、Search Console
で各ツールがインデックスされたことを確認してから次を公開するのが安全。

## メンテナンス

- 各ツールの `meta.updatedAt` は計算式や引用元を変更した時に更新する
- 半年に1回、全ツールのFAQ・解説を見直し（Last updatedの新しさはGoogleが見る）
- AdSense Policy Center を毎月確認
- Search Console の Coverage / Core Web Vitals を毎月確認
