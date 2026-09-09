/**
 * 自前で useShareableState を持つツールの slug。
 *
 * これらは ToolInteractionTracker の汎用 ?s= 書き込み(useAutoShareableState)を
 * 無効にする。両方が history.replaceState で同じ ?s= を奪い合うと、
 * 後勝ちで片方の形式が壊れるため。
 *
 * 一覧は手書きだが、registry.test.ts で実ソースと突き合わせて検証している
 * （新たに useShareableState を採用したツールを足し忘れると失敗する）。
 */
export const MANUAL_SHARE_SLUGS: ReadonlySet<string> = new Set([
  "body-fat-calculator",
  "bmi-calculator",
  "bmr-calculator",
  "calorie-calculator",
  "one-rep-max-calculator",
  "pace-calculator",
  "water-intake-calculator",
]);
