# AdSense「有用性の低いコンテンツ」再建プラン

> 対象: toolify365.com（2026年6月時点 / 173ツール本番・dev 218ツール・17言語・約3,300 URL）
> 目的: AdSense ポリシー違反「有用性の低いコンテンツ」を解消し、再審査を通す
> 方針（確定）: **言語は17維持** / ①コモディティ重複の剪定 ②量産を即停止＋E-E-A-T強化 ③機能差別化を本物にする

---

## 0. 診断サマリ（なぜ落ちたか）

ページ単位の品質は **問題ではない**。実機確認の結果：

- BMIページ = FAQ8・article3節・howTo を完備、文章は人間的で正確
- 翻訳は本物のローカライズ（JA版に「サルコペニア肥満」「アジア基準BMI23」等、locale固有内容あり）
- legalページ4種（privacy/terms/about/contact）+ disclosure 完備
- sitemap 3,298 URL すべて到達可能、robots/Host も正常

落ちている原因は **サイト全体のマクロ署名**：

| 要因 | 実態 | リスク |
|---|---|---|
| コモディティ題材 | BMI・年齢・単位換算・ローン等、既に世界中に同一ツールが無数 | 「このサイトが存在する理由」が示せない＝有用性が低い の本質 |
| スケール署名 | 173ツール×17言語≈3,298 URL を自動WFで6個ずつ量産 | 2024年以降 Google が deindex する "scaled content abuse" の見た目 |
| ドメイン新しさ | 2026年5月作成・被リンクほぼ無し | 新規ドメイン×数千ページは AdSense が最も警戒 |
| 言語17倍増幅 | 翻訳品質は良いが量がscaled署名を17倍に | — |
| ツール一辺倒 | About37行・編集/専門性シグナル希薄 | 「実在事業者」の証拠が弱い |

**結論：ツール追加・各ページ長文化では直らない。直すべきはサイト全体のプロフィール。**

---

## フェーズ1 — 即時凍結（今日 / 30分）

> velocity 自体がスパム信号。再審査が通るまで新規ツールを足さない。

- [ ] `pipeline/specs/` の未コミット6本（cat-age / dog-age / half-life / ratio-simplifier / sip / square-root）を**マージしない**。`feat/growth-prototypes` の量産はここで停止
- [ ] 「add N more calculators via parallel i18n workflow」型コミットを再審査完了まで禁止（チーム/自分ルール）
- [ ] 本番 main に未反映の量産分があれば push を保留

**完了条件:** 本番のツール数が固定され、増加が止まっている

---

## フェーズ2 — コモディティ重複の剪定（2〜3日）

> 目的: 「同一ツールが無数にある単機能ページ」を index から外し、scaled署名を下げる。
> **削除ではなく noindex 中心**（URL保持・後で差別化して復帰可能にする）。

### 剪定対象クラスタ（現218から抽出）

**C-1. 単一単位コンバータ（最優先で整理）** — 1ページ1単位は重複の塊
```
angle-converter, area-converter, length-converter, volume-converter,
weight-converter, speed-converter, temperature-converter, pressure-converter,
power-converter, data-size-converter, fuel-economy-converter, css-unit-converter,
time-converter, scientific-notation-converter, number-base-converter, density-calculator
```
→ 方針: **「Universal Unit Converter」1ページに統合**（カテゴリ切替UI）＋各旧URLは統合先へ301。
   どうしても個別維持するものは「その単位ならではの実用表/換算早見」を足したものだけ index 継続。

**C-2. 幾何ボリューム重複** — 形状ごとの別ページは薄い
```
box-volume, cone-volume, cylinder-volume, sphere-volume, circle-calculator,
triangle-calculator, geometric-shapes-calculator
```
→ 方針: 「Volume / Geometry Calculator」へ統合 or 代表1〜2本を残し他は noindex。

**C-3. 新規性ノベルティ（コンテンツ上限が低い）**
```
dice-roller, random-number-generator, countdown-timer, stopwatch,
reverse-text-generator, lorem-ipsum-generator, coffee-ratio-calculator,
cat-age-calculator, dog-age-calculator, moon-phase-calculator
```
→ 方針: 再審査までは **noindex**（消さずに残すが index 対象から外す）。

**C-4. 飽和コモディティ（差別化前提で残すか判断）**
```
bmi-calculator, password-generator, word-counter, qr-code-generator,
base64-encoder, url-encoder, hash-generator, uuid-generator, case-converter
```
→ 方針: フェーズ4で**本物の差別化機能を入れたものだけ index 継続**。入れられないものは noindex。

### 実装メモ
- noindex は「該当 slug 群」を registry にフラグ追加 → `generateMetadata` で `robots: { index: false }` 付与 → **sitemap生成からも除外**（noindex なのに sitemap 掲載は矛盾信号なので必ず両方）
- 301 統合は nginx or Next の `redirects()` で旧slug→統合先（**全17 locale 分**）

**目標 index 面積:** 218 → **差別化済みコア 40〜60ツール** を17言語で index（≈700〜1,000 URL）。残りは noindex で温存し、承認後に差別化しながら段階復帰。

**完了条件:** sitemap が「差別化済みコアのみ」になり、noindexページが sitemap から消えている

---

## フェーズ3 — E-E-A-T / 実在事業者シグナル強化（2〜3日）

> AdSense審査員は「裏に本物の事業者がいるか」を見る。About37行では弱い。

- [ ] **About を実在情報で再構築**（17言語）
  - 運営者/法人名・所在国・設立背景・「なぜ作っているか」を実名で
  - 「計算式の検証方針」「データは送信しない（client-side）設計の理由」を明記
  - 連絡先が実在に見える形（contact フォーム＋返信ポリシー）
- [ ] **各ツールに出典/監修シグナル**
  - 健康系（BMI/BMR/カロリー等）: WHO/CDC等の出典を本文に明示（一部既にあり→全健康ツールへ展開）
  - 金融系: 計算式の前提・免責（"not financial advice"）を統一フッターで
  - 「最終更新日」「式の根拠」をツールページに表示
- [ ] **著者/組織の構造化データ** (`Organization` / `author`) を SEO JSON-LD に追加
- [ ] disclosure ページにアフィリエイト/広告の開示を明確化（既存を強化）

**完了条件:** About が実在事業者として読め、健康/金融ツールに出典・免責・更新日が出ている

---

## フェーズ4 — 機能差別化を「本物」にする（1〜2週・コア40〜60本に集中）

> CLAUDE.md の「機能差別化」を口先でなく実装する。全218ではなく **index継続するコアだけ** に投資。

カテゴリ別の「競合に無い実機能」案：

- **金融（mortgage / retirement / debt-payoff / amortization / FIRE）**
  - 償却スケジュール表のCSV/印刷エクスポート、複数シナリオの横並び比較、URLに条件を埋めて共有
- **健康（calorie / macro / BMR / pregnancy）**
  - 入力の保存（localStorage、サーバ送信なしを明示）、経時トラッキング、locale別の単位・基準自動切替
- **開発系（regex / cron / subnet / jwt / json-formatter）**
  - リアルタイム解説パネル、サンプルライブラリ、共有可能パーマリンク（competitor が弱い領域＝勝ち筋）
- **変換/数学（統合後のUniversal Converter, statistics 等）**
  - 換算早見表の自動生成、計算過程のステップ表示

各差別化ツールには「**この機能は他にない**」と分かる UI と、機能を説明する固有の本文段落を足す（テンプレ流用に見せない）。

**完了条件:** index継続コアの各ツールに、競合に無い実機能＋固有説明文が入っている

### 実行手順（戻ってからの着手順 / 安全・高ROI順）

> 対象は `INDEXED_SLUGS` のコア67本のみ。1ツールずつ実装→`npm run build` で MISSING_MESSAGE 0 を確認→ブラウザ目視→push。
> **盲目的に67本を一括量産しない**（テンプレ感＝HCUの逆効果）。週あたり数本ずつ、固有文章とセットで。

1. **横断の共通基盤（1回作れば全コアに効く・最優先）**
   - `useToolPermalink()`: 入力 state を URLクエリに encode/decode するフック。「条件を保存・共有」ボタン。サーバ送信なしを明記＝privacy 差別化と両立。
   - `<ResultActions>`: コピー / CSV / 印刷（`window.print()` + print CSS）の共通コンポーネント。
   - `<LastReviewed>`: `tool.updatedAt` を各ツール下部に表示（E-E-A-T）。
2. **金融コア（最も収益・intent が高い → 先に差別化）**
   - mortgage / loan-amortization-schedule / car-loan / debt-payoff: **償却スケジュール表**（月次の元金・利息内訳）＋CSV出力＋複数シナリオ横並び比較。competitor の多くは表を出さない＝明確な勝ち筋。
   - retirement / compound-interest / savings-goal: 年次推移グラフ（軽量SVG、依存追加なし）。
3. **開発コア（competitor が弱く実装が軽い → ROI高）**
   - regex-tester: マッチのリアルタイムハイライト＋グループ表＋よく使うパターン集。
   - cron-expression-tester: 次回実行時刻リスト＋人間可読の説明文。
   - subnet-calculator: 分割サブネット表。jwt-decoder: クレーム説明ツールチップ。
4. **健康コア**: 入力の localStorage 保存（「端末内のみ・サーバ送信なし」明記）＋locale別の単位/基準自動切替（既存の良いローカライズを機能面でも）。
5. 実装した順に固有の解説段落（その機能の使い方・根拠）を `messages/` 17言語へ追加。`audit:i18n` の flat-key ガードと MISSING_MESSAGE 0 を必ず通す。

> 復帰運用: もし noindex 中のツールを差別化して戻す場合は、`INDEXED_SLUGS` へ slug を追加。**一度に大量復帰しない**（velocity 信号）。

---

## フェーズ5 — 再審査前チェック & 申請（1日）

- [ ] `cd site && npm run validate` PASS（型/i18n/SEO）
- [ ] `npm run build` PASS（standalone）
- [ ] sitemap = 差別化済みコアのみ / noindexページが混在していない
- [ ] 全 index ページが17言語で**英語フォールバックなし**（fallbackページはthin扱い）
- [ ] 404/工事中/空ページ ゼロ（要全locale巡回チェック）
- [ ] Lighthouse モバイル 各90+
- [ ] robots / ads.txt / sitemap 到達可能
- [ ] Consent Mode v2 稼働（EU広告のため）
- [ ] 数日〜1週 放置して Search Console で index 状況が安定→ **AdSense「問題を修正しました」を申請**

---

## 優先順位（効果×手間）

| 優先 | 施策 | 効果 | 手間 |
|---|---|---|---|
| ★1 | フェーズ1 凍結 | 高（悪化を止める） | 極小 |
| ★2 | フェーズ2 noindex剪定（C-1/C-3） | **最大**（scaled署名を直接下げる） | 中 |
| ★3 | フェーズ3 E-E-A-T | 高 | 中 |
| ★4 | フェーズ4 差別化（コア集中） | 高（恒久的な存在理由） | 大 |
| ★5 | フェーズ5 申請 | — | 小 |

> 速攻で効くのは **★2 の noindex剪定**。3,300→1,000 URL規模に絞ると新規ドメインの scaled署名が大きく下がる。
> 言語17維持の方針下では「ツール数を絞る×17言語」で面積を作るのが最短。

---

## やってはいけないこと（再発防止）

- ❌ 落ちている間にツールを量産で増やす（velocityが悪化信号）
- ❌ noindex したのに sitemap に残す（矛盾信号）
- ❌ 一部言語だけ英語フォールバックで公開（thin判定）
- ❌ 「機能差別化」をコピーで主張するだけで実装しない
- ❌ 承認直後に全noindexツールを一斉復帰（再びvelocity信号）→ 段階的に

---

## 実装状況（2026-06-03 セッション）

| フェーズ | 状態 | 内容 |
|---|---|---|
| 1. 凍結 | ✅ | 未コミットの量産6本（cat-age/dog-age/half-life/ratio-simplifier/sip/square-root specs）はマージせず据え置き＝増加停止 |
| 2. 剪定 | ✅ デプロイ済 | 第1段: `NOINDEX_SLUGS`(48) → 第2段で **allowlist 方式 `INDEXED_SLUGS`(コア67本)** に変更（finance14/health12/text12/math10/converter8/datetime7/color4）。`sitemap.ts` が非コアを除外、`buildMetadata({noindex})` で robots index:false。**ツールURL 3,706→1,139（151本noindex）**。残151本はページ存続・noindex温存し差別化後に段階復帰 |
| 3. E-E-A-T | ✅ コード完了 | About に「ツールの作り方と検証方法」「修正受付CTA」「最終確認日」を追加し全17言語翻訳。About に Organization JSON-LD を出力 |
| 4. 差別化 | ✅ 実装済(2026-07-10) | コア26本に実装: 金融=償却表+CSV+シナリオ比較+SVGグラフ+出典(CFPB/SEC/FINRA)、健康=localStorage保存+単位自動切替+妊娠マイルストーン表+出典(ACOG/WHO/NHS/厚労省)、変換=実用早見表8本+祝日プリセットUS/JP/UK/DE+会議プランナー。17言語約4,100文字列手翻訳 |
| 5. 検証 | ✅ | `typecheck` / `audit:i18n` / `audit:seo` / `build`(exit 0) PASS。Lighthouse は要実行。AdSense「問題を修正しました」申請はユーザー操作 |

### 副次的に発見・修正した壊れたツール（審査の致命傷だった）
ビルドログから **2,792件の MISSING_MESSAGE** を検出。`audit:i18n` はロケール間一致しか見ないため見逃していた。

- **json-to-yaml-converter / typing-speed-tester / unix-permissions-calculator**: メッセージJSONが `"action.copy"` のような**フラットなドットキー**で定義され、next-intl が `t("action.copy")`（ネスト解決）と一致せず、ボタン等に**生キー文字列が表示される壊れたUI**だった（en含む全17言語）。→ ドットキーをネスト構造へ変換（3ツール×17言語=51ファイル）。値（翻訳）は保持。
- **calorie-deficit-calculator**: `String(1.0)="1"` で `goal.kg_1` を要求するが実キーは `goal.kg_1_0`。整数 goal のラベルがキー欠落。→ `goalKey()` ヘルパーで `_0` を付与。
- **再発防止**: `audit:i18n` に「トップレベルのドット入りキー検出」ガードを追加（`[flat-key]`）。今後パイプラインが同型バグを入れたら CI で落ちる。

> 教訓: 量産パイプラインは「壊れたまま全言語公開」する事故を起こしていた。これは AdSense「低品質」の直接要因。**承認前に全ツールを実際にレンダリングして生キー/空表示が無いか巡回すべき**（ビルドログの MISSING_MESSAGE 監視で代替可）。

### 残タスク（ユーザー判断/操作が必要）
1. **実在事業者情報**: CI(`deploy.yml`)の `NEXT_PUBLIC_CONTACT_EMAIL` は実Gmail(`app.develop.sk@gmail.com`)済み。`NEXT_PUBLIC_ORG_NAME` は "Toolify"（ブランド名）。実法人名があれば E-E-A-T 強化。
2. ~~剪定の深掘り~~ → **完了**（コア67本 allowlist にデプロイ済み）。さらに攻める/緩めるは `INDEXED_SLUGS` を増減。
3. **フェーズ4**: コア67本へ競合に無い実機能を順次実装。承認後、差別化したものから `INDEXED_SLUGS` へ戻して段階復帰。
4. **Search Console**: sitemap 再送信 → index 反映待ち → 安定後に **AdSense「問題を修正しました」申請**（Claude では不可）。
5. （任意）`deploy.yml` の `actions/checkout@v4`・`setup-node@v4` を Node24対応版へ（2026-06-16 以降の非推奨対応）。

---

## 2回目却下(2026-07-09)への対応記録

- 2026-07-09: フェーズ1〜3実施済みの状態で再申請するも「有用性の低いコンテンツ」で再却下
- 2026-07-10: 未着手だったフェーズ4（機能差別化）をコア26本に実装・デプロイ（上表参照）
- **再々審査の申請条件**: デプロイから最低1週間待ち、Search Console のカバレッジが安定し、GA4で新機能ページのエンゲージが記録されてから AdSense「問題を修正しました」を押す（連続再申請は悪化信号）
- 並行施策: docs/BACKLINK_TARGETS.md / 00_集客統合のtoolify-backlink-*を実行して被リンク・実流入を増やす（新規ドメイン×低流入がマクロ署名の残る一因）
