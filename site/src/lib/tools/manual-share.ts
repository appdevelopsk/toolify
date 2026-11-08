/**
 * 自前で useShareableState を持つツールの slug。
 *
 * これらは ToolInteractionTracker の汎用 DOM スナップショット取得
 * (useAutoShareableState)を無効にする。手動フックと汎用フックが同時に
 * コピー要求へ応答すると、異なる形式の状態が衝突するため。
 *
 * 一覧は手書きだが、registry.test.ts で実ソースと突き合わせて検証している
 * （新たに useShareableState を採用したツールを足し忘れると失敗する）。
 */
export const MANUAL_SHARE_SLUGS: ReadonlySet<string> = new Set([
  "body-fat-calculator",
  "age-calculator",
  "bmi-calculator",
  "bmr-calculator",
  "calorie-calculator",
  "one-rep-max-calculator",
  "pace-calculator",
  "percentage-calculator",
  "timezone-converter",
  "water-intake-calculator",
  "workdays-calculator",
]);
