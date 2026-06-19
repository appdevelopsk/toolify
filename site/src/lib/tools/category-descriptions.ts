import type { ToolCategory } from "./types";

/**
 * Per-category SEO copy for /tools/category/[cat] pages.
 *
 * Why hand-authored: a category hub that renders only a card grid + the generic
 * site description is thin/duplicate content in Google's eyes (HCU risk). 60-100
 * words of category-specific prose gives each hub its own SERP intent and a real
 * reason to exist, and turns it into a link target backlinks can point at.
 *
 * Each entry: { headline, body, tip } per locale. 'body' is the intro paragraph,
 * 'tip' renders as a callout. Locales fall back to `en` if missing, but every
 * category ships all 17 active locales (partial = language-mismatch HCU risk).
 * Translations are hand-localized (no machine-only output) per project rules.
 */
import extra from "./category-descriptions.extra.json";

export type CategoryCopy = { headline: string; body: string; tip: string };

// en + ja are hand-authored here; the other 15 active locales live in
// category-descriptions.extra.json (hand-localized via translation pass) and are
// merged in below. en/ja here take precedence over the JSON if both exist.
const BASE: Record<ToolCategory, Record<string, CategoryCopy>> = {
  health: {
    en: {
      headline: "Free health & fitness calculators — BMI, body fat, calories, BMR",
      body: "Every calculator here turns a number you can measure at home into something you can act on. BMI and body-fat estimates that flag where you actually stand, a BMR and calorie calculator that sets a daily target instead of a vague goal, ideal-weight and one-rep-max tools for training. No signup, no app — just the formula, the result, and what it means.",
      tip: "These give estimates, not a diagnosis. For body composition or training load, pair the numbers with how you feel and a professional's input before making big changes.",
    },
    ja: {
      headline: "無料の健康・フィットネス計算機 — BMI・体脂肪・カロリー・基礎代謝",
      body: "ここの計算機はどれも、自宅で測れる数値を「次に何をするか」に変える。今の立ち位置がわかるBMI・体脂肪率、曖昧な目標ではなく1日の目安をくれる基礎代謝(BMR)・カロリー計算、トレーニング用の理想体重・1RM。登録もアプリも不要、式と結果と意味だけ。",
      tip: "これらは推定値で診断ではない。体組成やトレーニング負荷は、数値だけでなく体感と専門家の助言を合わせて判断を。",
    },
  },
  math: {
    en: {
      headline: "Free math & number tools — percentages, fractions, statistics, equations",
      body: "The math you actually look up: a percentage calculator that handles increase, decrease and 'what percent of', fraction and GCD/LCM tools that show the steps, a statistics calculator for mean, median and standard deviation, plus a quadratic solver and prime checker. Each one shows the working, not just the answer, so it doubles as a quick way to check homework or a spreadsheet.",
      tip: "Most of these show intermediate steps — use them to verify a calculation you did by hand, not just to get the final number.",
    },
    ja: {
      headline: "無料の数学・数値ツール — 百分率・分数・統計・方程式",
      body: "実際に調べたくなる計算がそろう。増加・減少・「全体の何%か」に対応した百分率計算、途中式を見せる分数・最大公約数/最小公倍数、平均・中央値・標準偏差の統計計算、二次方程式ソルバー、素数判定。答えだけでなく過程を表示するので、宿題や表計算の検算にも使える。",
      tip: "多くは途中の計算過程を表示する。最終結果を得るだけでなく、手計算の検算に使うのが賢い。",
    },
  },
  converter: {
    en: {
      headline: "Free unit converters — length, weight, temperature, volume, speed",
      body: "Straight unit conversions without the ad maze: length and distance, weight and mass, temperature, volume, speed, area, pressure and data size. Type a value, pick the units, get an exact result you can trust — handy for recipes, travel, shipping, lab work or homework where one wrong factor changes everything.",
      tip: "For recipes and trade use, watch the unit system (metric vs US/imperial) — a 'cup' or a 'ton' isn't the same everywhere. Each converter labels which standard it uses.",
    },
    ja: {
      headline: "無料の単位変換 — 長さ・重さ・温度・体積・速度",
      body: "広告の迷路なしで素直に単位変換。長さ・距離、重さ・質量、温度、体積、速度、面積、圧力、データサイズ。値を入れて単位を選ぶだけで信頼できる正確な結果。レシピ・旅行・配送・実験・宿題など、係数ひとつのミスが結果を変える場面に。",
      tip: "レシピや商取引では単位系(メートル法 vs ヤード・ポンド法)に注意。「カップ」や「トン」は国で違う。各変換器がどの基準かを明記している。",
    },
  },
  datetime: {
    en: {
      headline: "Free date & time tools — age, countdown, workdays, time zones",
      body: "Everything that needs counting between two dates: your exact age in years, months and days, a countdown to any event, business-day and date math that skips weekends, ISO week numbers, leap-year checks and a time-zone converter for scheduling across countries. Useful for contracts, deadlines, payroll, travel and planning calls that span the globe.",
      tip: "For contracts and payroll, confirm whether the count should include the start and end day — each tool states its convention so you can match your paperwork.",
    },
    ja: {
      headline: "無料の日付・時間ツール — 年齢・カウントダウン・営業日・タイムゾーン",
      body: "2つの日付の間を数える作業をまとめて。年齢を年・月・日で正確に、任意のイベントまでのカウントダウン、週末を除く営業日・日数計算、ISO週番号、うるう年判定、国をまたぐ予定調整のタイムゾーン変換。契約・締切・給与計算・旅行・海外との通話設定に。",
      tip: "契約や給与計算では、開始日・終了日を数えに含めるかを確認。各ツールが採用する数え方を明記しているので、書類と合わせられる。",
    },
  },
  text: {
    en: {
      headline: "Free text & code tools — word count, JSON, Base64, regex, hashing",
      body: "Quick utilities for writers and developers: a word and character counter, JSON formatter, Base64 and URL encode/decode, a regex tester that shows live matches, text diff, case converter, hashing and UUID generation. They run in your browser, so text and code you paste stay on your machine — fast for debugging, content work or cleaning up data.",
      tip: "Everything runs client-side — pasted text and code never leave your browser, which matters for anything sensitive. Still, don't paste secrets like private keys into any online tool.",
    },
    ja: {
      headline: "無料のテキスト・コードツール — 文字数・JSON・Base64・正規表現・ハッシュ",
      body: "ライターと開発者向けの小回りの効くユーティリティ。文字数・単語数カウント、JSON整形、Base64・URLのエンコード/デコード、リアルタイムにマッチを表示する正規表現テスター、テキスト差分、大文字小文字変換、ハッシュ・UUID生成。ブラウザ内で動くので貼り付けたテキストやコードは手元に留まる。デバッグ・原稿・データ整形に。",
      tip: "すべてブラウザ内(クライアント側)で動き、貼り付けた内容は外に出ない。とはいえ秘密鍵などの機密はオンラインツールに貼らないこと。",
    },
  },
  color: {
    en: {
      headline: "Free color & design tools — pickers, palettes, contrast, gradients",
      body: "Practical color work for the web: a color picker with HEX/RGB/HSL, palette and gradient generators, a WCAG contrast checker to keep text readable, color-blindness simulation and CSS shadow tools. Built for designers and front-end developers who need the exact value and the accessible choice, copy-paste ready.",
      tip: "Run text/background pairs through the contrast checker before shipping — WCAG AA needs 4.5:1 for body text. Passing it is the difference between a design that looks fine and one everyone can actually read.",
    },
    ja: {
      headline: "無料のカラー・デザインツール — ピッカー・パレット・コントラスト・グラデーション",
      body: "Web制作で実用的なカラー作業。HEX/RGB/HSL対応のカラーピッカー、パレット・グラデーション生成、文字を読みやすく保つWCAGコントラストチェッカー、色覚多様性シミュレーション、CSSシャドウ。正確な値とアクセシブルな選択をコピペで欲しいデザイナー・フロントエンド開発者向け。",
      tip: "公開前に文字色と背景色をコントラストチェッカーへ。WCAG AAは本文で4.5:1が必要。これを満たすかどうかが「見た目OK」と「誰もが読める」の差になる。",
    },
  },
  finance: {
    en: {
      headline: "Free finance calculators — loan, mortgage, compound interest, savings",
      body: "Money math you can check yourself: loan and mortgage payments with the real amortization, compound-interest and savings projections, car loans, retirement and inflation, sales tax and discounts. Each one shows how the number is built — principal, rate, term — so you can compare offers instead of trusting a single quote. No signup, no data leaves your browser.",
      tip: "These are planning estimates, not financial advice. Confirm the exact rate, fees and compounding frequency with the lender — small differences in those inputs move the total a lot.",
    },
    ja: {
      headline: "無料の金融計算機 — ローン・住宅ローン・複利・貯蓄",
      body: "自分で検算できるお金の計算。実際の償却に基づくローン・住宅ローンの返済額、複利・貯蓄のシミュレーション、自動車ローン、老後資金、インフレ、消費税、割引。元本・金利・期間からどう数字ができるかを見せるので、ひとつの見積もりを鵜呑みにせず比較できる。登録不要、データはブラウザ外に出ない。",
      tip: "これらは計画用の概算で金融アドバイスではない。正確な金利・手数料・複利頻度は貸し手に確認を。これらの入力の小さな差が総額を大きく動かす。",
    },
  },
};

const extraTyped = extra as Record<ToolCategory, Record<string, CategoryCopy>>;

export const CATEGORY_DESCRIPTIONS: Record<ToolCategory, Record<string, CategoryCopy>> =
  Object.fromEntries(
    (Object.keys(BASE) as ToolCategory[]).map((cat) => [
      cat,
      { ...(extraTyped[cat] ?? {}), ...BASE[cat] },
    ]),
  ) as Record<ToolCategory, Record<string, CategoryCopy>>;
