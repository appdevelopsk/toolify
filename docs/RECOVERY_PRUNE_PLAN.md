# Recovery — Prune / Noindex / Consolidate Plan

> 作成: 2026-06-05。Search Console API 実測（過去6か月、2ドメイン合算）に基づく分析リスト。**この時点では破壊的変更は未実施**。`KEEP` / `WATCH` / `NOINDEX` の振り分け案。

## 診断サマリ

- 対象: 218ツール × 17言語 ≈ 3,700ページ
- 過去6か月の検索実績（toolify365.com + 旧 tools.appdevelopsk.com 合算）: **クリック合計9 / 表示合計4,120**
- 表示が1回でも出たツール: **129** / ゼロ表示: **89**
- 2026-05-19 に新サイト、~05-27 に旧サイトがほぼ同時に検索から消滅（手動対策なし＝アルゴリズム降格）
- 旧ドメインは同一ツール slug の重複コンテンツ。→ 301 で toolify365 へ一本化（別途手順）

## 振り分け基準

- **KEEP**: GSC表示 ≥20、または実需が明確なエバーグリーン定番（low impr でも残す）
- **WATCH**: GSC表示 5〜19。indexは当面維持しつつ、差別化対象の候補
- **NOINDEX**: GSC表示 <5（特に6か月ゼロの89本）。`robots: noindex` でGoogle索引から除外（ページ自体は残す＝後で戻せる）

## KEEP — 残して投資する中核（52本）

| slug | impr(6mo) | clicks |
|---|---|---|
| `fuel-economy-converter` | 890 | 0 |
| `roman-numeral-converter` | 551 | 1 |
| `date-calculator` | 229 | 1 |
| `age-difference-calculator` | 225 | 0 |
| `markup-calculator` | 129 | 0 |
| `paint-calculator` | 129 | 0 |
| `ovulation-calculator` | 78 | 0 |
| `pregnancy-week-calculator` | 74 | 0 |
| `word-counter` | 71 | 0 |
| `number-base-converter` | 56 | 0 |
| `reverse-text-generator` | 55 | 0 |
| `roas-calculator` | 54 | 0 |
| `unit-price-calculator` | 54 | 0 |
| `percentage-calculator` | 52 | 0 |
| `power-converter` | 52 | 0 |
| `due-date-calculator` | 51 | 0 |
| `pace-calculator` | 51 | 0 |
| `compound-interest-calculator` | 50 | 0 |
| `workdays-calculator` | 44 | 0 |
| `car-loan-calculator` | 43 | 0 |
| `fraction-calculator` | 40 | 0 |
| `investment-fee-impact-calculator` | 40 | 0 |
| `one-rep-max-calculator` | 40 | 0 |
| `cagr-calculator` | 38 | 0 |
| `time-converter` | 36 | 0 |
| `speed-converter` | 33 | 1 |
| `iso-week-calculator` | 29 | 0 |
| `age-calculator` | 28 | 1 |
| `caesar-cipher` | 28 | 0 |
| `pressure-converter` | 28 | 0 |
| `character-frequency` | 27 | 0 |
| `text-replace` | 26 | 0 |
| `timezone-converter` | 26 | 1 |
| `discount-calculator` | 23 | 0 |
| `water-intake-calculator` | 23 | 0 |
| `bmi-calculator` | 22 | 0 |
| `salary-converter` | 22 | 1 |
| `stopwatch` | 20 | 0 |
| `wpm-counter` | 20 | 1 |
| `length-converter` | 15 | 0 |
| `mortgage-calculator` | 15 | 0 |
| `weight-converter` | 12 | 0 |
| `bmr-calculator` | 10 | 0 |
| `loan-calculator` | 10 | 0 |
| `calorie-calculator` | 9 | 0 |
| `gpa-calculator` | 9 | 0 |
| `temperature-converter` | 6 | 0 |
| `loan-amortization-schedule` | 4 | 0 |
| `tip-calculator` | 3 | 0 |
| `sales-tax-calculator` | 2 | 0 |
| `currency-converter` | 1 | 0 |
| `password-generator` | 0 | 0 |

## WATCH — 当面index維持・要差別化（44本）

| slug | impr(6mo) | clicks |
|---|---|---|
| `countdown-timer` | 19 | 1 |
| `inflation-calculator` | 19 | 0 |
| `leap-year-checker` | 17 | 0 |
| `case-converter` | 16 | 0 |
| `color-palette-generator` | 16 | 0 |
| `gcd-lcm-calculator` | 16 | 0 |
| `vat-calculator` | 16 | 0 |
| `angle-converter` | 15 | 0 |
| `factorial-calculator` | 14 | 0 |
| `prime-checker` | 14 | 0 |
| `target-heart-rate-calculator` | 14 | 0 |
| `subnet-calculator` | 13 | 0 |
| `aspect-ratio-calculator` | 12 | 0 |
| `crypto-profit-calculator` | 12 | 0 |
| `random-number-generator` | 12 | 0 |
| `base64-encoder` | 11 | 0 |
| `tax-bracket-calculator` | 11 | 0 |
| `mortgage-refinance-calculator` | 10 | 0 |
| `scientific-notation-converter` | 9 | 0 |
| `statistics-calculator` | 9 | 0 |
| `weight-loss-calculator` | 9 | 0 |
| `debt-to-income-ratio-calculator` | 8 | 0 |
| `dice-roller` | 8 | 0 |
| `lease-vs-buy-calculator` | 8 | 0 |
| `pomodoro-timer` | 8 | 0 |
| `triangle-calculator` | 8 | 0 |
| `uuid-generator` | 8 | 0 |
| `color-converter` | 7 | 0 |
| `gradient-generator` | 7 | 0 |
| `ideal-weight-calculator` | 7 | 0 |
| `url-encoder` | 7 | 0 |
| `emergency-fund-calculator` | 6 | 0 |
| `fuel-cost-calculator` | 6 | 0 |
| `retirement-calculator` | 6 | 0 |
| `rule-of-72-calculator` | 6 | 0 |
| `shadow-generator` | 6 | 0 |
| `credit-card-validator` | 5 | 0 |
| `device-info-checker` | 5 | 0 |
| `email-validator` | 5 | 0 |
| `lorem-ipsum-generator` | 5 | 0 |
| `password-strength-tester` | 5 | 0 |
| `simple-interest-calculator` | 5 | 0 |
| `stock-profit-calculator` | 5 | 0 |
| `waist-hip-ratio-calculator` | 5 | 0 |

## NOINDEX — 索引から除外候補（122本）

| slug | impr(6mo) | clicks |
|---|---|---|
| `annuity-payout-calculator` | 4 | 0 |
| `body-fat-calculator` | 4 | 1 |
| `cooking-unit-converter` | 4 | 0 |
| `data-size-converter` | 4 | 0 |
| `net-worth-calculator` | 4 | 0 |
| `regex-tester` | 4 | 0 |
| `credit-utilization-calculator` | 3 | 0 |
| `cron-expression-tester` | 3 | 0 |
| `electricity-cost-calculator` | 3 | 0 |
| `geometric-shapes-calculator` | 3 | 0 |
| `life-insurance-needs-calculator` | 3 | 0 |
| `markdown-to-html` | 3 | 0 |
| `cost-of-living-comparison` | 2 | 0 |
| `css-unit-converter` | 2 | 0 |
| `heat-index-calculator` | 2 | 0 |
| `resistor-color-code` | 2 | 0 |
| `text-diff` | 2 | 0 |
| `volume-converter` | 2 | 0 |
| `ascii-table` | 1 | 0 |
| `blood-pressure-checker` | 1 | 0 |
| `contrast-checker` | 1 | 0 |
| `macro-calculator` | 1 | 0 |
| `moon-phase-calculator` | 1 | 0 |
| `morse-code-translator` | 1 | 0 |
| `number-sequence-generator` | 1 | 0 |
| `paycheck-calculator` | 1 | 0 |
| `percent-error-calculator` | 1 | 0 |
| `reading-level-checker` | 1 | 0 |
| `roi-calculator` | 1 | 0 |
| `savings-goal-calculator` | 1 | 0 |
| `significant-figures-calculator` | 1 | 0 |
| `slug-generator` | 1 | 0 |
| `timestamp-converter` | 1 | 0 |
| `wind-chill-calculator` | 1 | 0 |
| `a1c-calculator` | 0 | 0 |
| `area-converter` | 0 | 0 |
| `average-speed-calculator` | 0 | 0 |
| `bill-split-calculator` | 0 | 0 |
| `board-feet-calculator` | 0 | 0 |
| `body-surface-area-calculator` | 0 | 0 |
| `box-volume-calculator` | 0 | 0 |
| `break-even-calculator` | 0 | 0 |
| `calorie-deficit-calculator` | 0 | 0 |
| `cat-age-calculator` | 0 | 0 |
| `circle-calculator` | 0 | 0 |
| `coffee-ratio-calculator` | 0 | 0 |
| `color-blindness-simulator` | 0 | 0 |
| `color-name-finder` | 0 | 0 |
| `color-shades-generator` | 0 | 0 |
| `combination-calculator` | 0 | 0 |
| `concrete-calculator` | 0 | 0 |
| `cone-volume-calculator` | 0 | 0 |
| `cost-per-use-calculator` | 0 | 0 |
| `csv-json-converter` | 0 | 0 |
| `cylinder-volume-calculator` | 0 | 0 |
| `day-of-week-calculator` | 0 | 0 |
| `debt-payoff-calculator` | 0 | 0 |
| `density-calculator` | 0 | 0 |
| `dog-age-calculator` | 0 | 0 |
| `down-payment-calculator` | 0 | 0 |
| `duplicate-line-remover` | 0 | 0 |
| `effective-annual-rate-calculator` | 0 | 0 |
| `exercise-calorie-calculator` | 0 | 0 |
| `exponent-calculator` | 0 | 0 |
| `expression-evaluator` | 0 | 0 |
| `fibonacci-calculator` | 0 | 0 |
| `fire-number-calculator` | 0 | 0 |
| `future-value-calculator` | 0 | 0 |
| `grade-calculator` | 0 | 0 |
| `gravel-calculator` | 0 | 0 |
| `half-life-calculator` | 0 | 0 |
| `hash-generator` | 0 | 0 |
| `hours-calculator` | 0 | 0 |
| `house-affordability-calculator` | 0 | 0 |
| `html-entity-encoder` | 0 | 0 |
| `html-to-markdown` | 0 | 0 |
| `json-formatter` | 0 | 0 |
| `json-to-yaml-converter` | 0 | 0 |
| `jwt-decoder` | 0 | 0 |
| `keycode-finder` | 0 | 0 |
| `kinetic-energy-calculator` | 0 | 0 |
| `logarithm-calculator` | 0 | 0 |
| `matrix-calculator` | 0 | 0 |
| `max-heart-rate-calculator` | 0 | 0 |
| `meeting-cost-calculator` | 0 | 0 |
| `midpoint-calculator` | 0 | 0 |
| `modulo-calculator` | 0 | 0 |
| `molarity-calculator` | 0 | 0 |
| `number-to-words` | 0 | 0 |
| `ohm-law-calculator` | 0 | 0 |
| `overtime-pay-calculator` | 0 | 0 |
| `percentage-change-calculator` | 0 | 0 |
| `permutation-calculator` | 0 | 0 |
| `pixel-density-calculator` | 0 | 0 |
| `ponderal-index-calculator` | 0 | 0 |
| `present-value-calculator` | 0 | 0 |
| `price-compare` | 0 | 0 |
| `prime-factorization` | 0 | 0 |
| `probability-calculator` | 0 | 0 |
| `profit-margin-calculator` | 0 | 0 |
| `proportion-calculator` | 0 | 0 |
| `protein-intake-calculator` | 0 | 0 |
| `pythagorean-theorem-calculator` | 0 | 0 |
| `qr-code-generator` | 0 | 0 |
| `quadratic-equation-solver` | 0 | 0 |
| `ratio-simplifier` | 0 | 0 |
| `reading-time-calculator` | 0 | 0 |
| `sales-commission-calculator` | 0 | 0 |
| `sip-calculator` | 0 | 0 |
| `sleep-calculator` | 0 | 0 |
| `slope-calculator` | 0 | 0 |
| `sphere-volume-calculator` | 0 | 0 |
| `square-footage-calculator` | 0 | 0 |
| `square-root-calculator` | 0 | 0 |
| `steps-to-distance-calculator` | 0 | 0 |
| `text-sorter` | 0 | 0 |
| `text-to-binary` | 0 | 0 |
| `tile-calculator` | 0 | 0 |
| `typing-speed-tester` | 0 | 0 |
| `unix-permissions-calculator` | 0 | 0 |
| `waist-to-height-ratio-calculator` | 0 | 0 |
| `z-score-calculator` | 0 | 0 |

## 次フェーズ（承認後に実施）

1. `ToolMeta` に `noindex?: boolean` を追加 → NOINDEX群に付与 → `sitemap.ts`/各ページ `robots` meta が参照
2. 旧ドメイン tools.appdevelopsk.com → toolify365.com への 301（nginx）
3. KEEP群に固有 examples / E-E-A-T / 著者情報を追加（量産色の払拭）
4. `npm run validate && npm run build` → main へ push（GitHub Actions 自動デプロイ）
