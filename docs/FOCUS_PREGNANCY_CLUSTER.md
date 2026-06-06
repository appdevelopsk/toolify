# フォーカス戦略 — 妊娠・妊活クラスタで topical authority を作る

> 量産（218本×17言語＝3,706枚）が HCU でサイト全体を沈めている。
> 散弾をやめ、**1クラスタを狭く深く**して権威を作り、次の core/HCU 更新で回復を狙う長期戦。
> 前提診断は `docs/RECOVERY_PRUNE_PLAN.md` と memory `gsc-traffic-collapse-may2026` を参照。

## なぜ妊娠・妊活か（データ根拠）

GSC ページ別（2026-04-01〜06-05、toolify365.com）で健康系の表示が固まっているのはここ:

| tool | impressions | 状態 |
|---|---|---|
| ovulation-calculator | 67 | 既存・index済 |
| pregnancy-week-calculator | 61 | 既存・index済 |
| due-date-calculator | 20 | 既存・index済 |
| water-intake / bmr / calorie / bmi … | 6〜17 | コモディティ・分散 |

- 需要が**連続したジャーニー**（妊活→排卵→受精→週数→出産予定日）に集中 → スイートとして束ねやすい。
- YMYL かつ **AdSense RPM が高い**ジャンル。
- 既に WHO/CDC/ACOG/NICHD 等の一次情報引用を入れ始めている（`ToolMeta.sources`）= E-E-A-T の土台がある。
- 「狭く深い専門サイト」は HCU が最も評価する形。BMI/％計算のような無差別コモディティは権威ゼロのうちは永久に勝てない。

## 二層構成（demand を捨てない）

**Tier 1 — 主役。投資を集中するクラスタ**
妊娠・妊活スイート。既存3本を深掘り＋新規を足してクラスタを「完結」させ、ハブページと相互リンクで topical authority を作る。

**Tier 2 — 維持。実需のあるエバーグリーン**
GSC で表示が付いている定番（date-calculator 181, word-counter 67, reverse-text 54, age-difference 59, percentage 52, roman-numeral 38 等）は index 維持。**拡張しない・薄いまま放置しない**が、主役ではない。需要を自ら捨てない。

**Tier 3 — 剪定。残り約160本**
noindex 継続（6/5設定済、再クロール待ち）。sitemap 除外・内部リンク遮断を徹底し「薄いページへの導線」を残さない。復帰させない。

---

## Tier 1：各ツールの差別化スペック（SERP上位に“無い”ものを足す）

上位（calculator.net / babycenter / 各種）はほぼ「LMP＋28日周期で固定計算」。差別化の核は **入力の現実性（不規則周期・複数起点）と、出力の実用性（日付・カレンダー・スケジュール）**。

### 1. ovulation-calculator（排卵・妊娠可能日）
- 周期長を **可変**に（不規則周期は min/max レンジ入力 → 妊娠可能日もレンジで提示）
- 黄体期長のカスタム（既定14日を上書き可）
- **次の6周期分**の妊娠可能日 + 排卵日 + 着床想定日を一覧
- **.ics カレンダー書き出し**（妊娠可能日にイベント）
- 妊娠検査薬の最速判定日、生理予定日を併記
- 基礎体温・排卵検査薬（LH）との併用法を引用付き解説（ACOG/NICHD）

### 2. pregnancy-week-calculator（妊娠週数）
- 起点を **LMP / 受精日 / 胚移植日 / 超音波CRL** から選択し、ズレを照合表示
- **妊娠齢 vs 受精齢**の区別を明示（混同が多い＝検索意図）
- 三半期境界、各週の発達を引用付き（既存 sources 活用）
- **検診・スクリーニングの日付を自動算出**（NIPT 推奨週、胎児ドック/解剖スキャン、妊娠糖尿病検査、Tdap、GBS）→ 単なる週数表示を超える唯一性
- 出産予定日カウントダウン

### 3. due-date-calculator（出産予定日）
- Naegele 法 ＋ **周期長補正**（28日固定をやめる）
- **IVF（移植 day3/day5）/ 受精日 / 超音波** からの算出を切替
- 予定日**ぴったりは約4%**である事実を示し、**正期産レンジ（37〜42週）の日付幅**を提示
- 受精可能日レンジを逆算して併記（conception ツールへ送客）

### 新規（クラスタ完結のため・YMYL逸脱は避ける）
擬似科学（性別占い等）は作らない。実需と医学的根拠があるものだけ:
- **conception-date-calculator**（出産予定日 or 出生日 → 受精時期レンジを逆算）— 検索多い
- **period / menstrual-cycle-calculator**（生理予定日・周期記録）— 妊活の入口、ovulation へ送客
- **pregnancy-weight-gain-calculator**（妊娠前BMI別の IOM 推奨増加量）— 既存 BMI と連携、引用：IOM/NASEM
- **hcg-calculator**（β-hCG 倍加時間）— 妊娠初期、引用付き（あくまで参考値・受診を促す YMYL 文言必須）

> 各ページに既存の YMYL ディスクレーマ（医療助言ではない/受診を促す）を必ず付与。`sources` に一次情報。

---

## クラスタ構造（topical authority の作り方）

- **ハブページ** `/[locale]/pregnancy`（クラスタ landing）: 妊活〜出産のジャーニーで各ツールへ導線＋引用付き概説。internal link の中心。
- 各ツールの `related` をクラスタ内で相互リンク（ジャーニー順: period → ovulation → conception → due-date → pregnancy-week → weight-gain）。
- パンくず・スキーマ（既存 JSON-LD 基盤）でクラスタを構造化。

## 言語戦略（recovery モードの例外）

- まず **en + ja を完全ローカライズ**で深掘り。残り15言語はクラスタが en/ja で順位を取るまで noindex 維持。
- ⚠️ これは CLAUDE.md の「17言語揃えてから公開」原則と**意図的に矛盾**する。量産フットプリント自体が HCU の原因なので、回復局面では「薄い17言語 < 厚い2言語」を優先する。core 回復確認後に言語を戻す。

## 実行順

1. **Tier 1 既存3本を差別化実装**（ovulation → due-date → pregnancy-week の順）。1本ずつ en/ja を厚く。
2. **ハブ `/pregnancy` 新設** ＋ クラスタ相互リンク。
3. **新規4本**を順次（conception → period → weight-gain → hcg）。
4. INDEXED_SLUGS をクラスタ＋Tier2 に整理（Tier1 全部 index、Tier3 は noindex 維持）。
5. Tier2 の薄いものを軽く差別化（深追いしない）。
6. 被リンク施策（クラスタの独自性で自然リンク）。

## 成功指標 / 計測

- 次回 GSC/GA4 再取得 **≈2026-07-01**（経路構築済: `scripts/gsc-login.sh` + SA キー、手順は memory 参照）。
- 見る指標: クラスタ4〜7本の **クリック>0 が出るか**（現状クラスタ全体でほぼ0）、平均掲載順位が 30〜90 から 10台へ動くか、GA4 でクラスタ流入セッションが増えるか。
- 単月で動かなくても異常ではない（アルゴリズム回復は core 更新待ち）。velocity を上げてツールを増やさないこと。
