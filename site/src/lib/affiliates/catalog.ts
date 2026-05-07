import type { AffiliateOffer, AffiliatePolicy } from "./types";

/**
 * アフィリエイトオファーのカタログ。
 *
 * 各エントリは ASP (もしも / A8 / バリューコマース / Amazonアソシエイト等) で
 * 案件承認を取得後、`url` フィールドに本物のアフィリエイトリンクを設定する。
 *
 * 承認待ち期間は `pending: true` のままで、UIは無効化された
 * 「準備中」表示になる。AdSense審査中もこの状態でOK。
 *
 * 案件追加チェックリスト:
 *   1. ASP管理画面で案件を見つける → 提携申請
 *   2. 承認されたら、専用アフィリリンクを発行
 *   3. ここに新規 entry を追加 (またはpendingエントリのurlとpendingを更新)
 *   4. category が ToolCategory と一致していることを確認
 *   5. markets を JP/US/global で適切に設定 (locale prefilter のため)
 *
 * 開示ルール (景表法・特商法):
 *   - 必ず「PR」「広告」ラベルが各オファーに表示される (RelatedServices側で実装)
 *   - 各ページフッターから /disclosure へのリンクが確保されている
 */

export const POLICY: AffiliatePolicy = {
  maxPerSlot: 3,
  disclosureLabel: {
    en: "Sponsored",
    ja: "広告",
    "zh-CN": "广告",
  },
};

/**
 * カタログ初期データ。実際のアフィリリンクはASP承認後に差替え。
 * すべて pending: true で起動 → UI上は淡色・クリック不可。
 */
export const CATALOG: AffiliateOffer[] = [
  // ───────── Finance / 金融 ─────────
  {
    id: "rakuten-securities-jp",
    category: "finance",
    markets: ["JP"],
    locales: ["ja"],
    name: {
      ja: "楽天証券",
    },
    description: {
      ja: "NISA・iDeCo・米国株が手数料無料。楽天ポイントが貯まる・使える証券口座。",
    },
    cta: { ja: "口座開設を見る" },
    url: { default: "#pending-rakuten-securities" },
    network: "moshimo",
    badge: "📈",
    pending: true,
  },
  {
    id: "sbi-securities-jp",
    category: "finance",
    markets: ["JP"],
    locales: ["ja"],
    name: { ja: "SBI証券" },
    description: { ja: "国内株式手数料0円・米国株・iDeCoまで網羅。総合力No.1のネット証券。" },
    cta: { ja: "詳細を見る" },
    url: { default: "#pending-sbi" },
    network: "a8",
    badge: "📊",
    pending: true,
  },
  {
    id: "rakuten-card-jp",
    category: "finance",
    markets: ["JP"],
    locales: ["ja"],
    name: { ja: "楽天カード" },
    description: { ja: "年会費無料・新規入会で5,000ポイント。家計簿アプリ連携で支出可視化に最適。" },
    cta: { ja: "公式サイトを見る" },
    url: { default: "#pending-rakuten-card" },
    network: "a8",
    badge: "💳",
    pending: true,
  },
  {
    id: "wealthfront-us",
    category: "finance",
    markets: ["US"],
    locales: ["en"],
    name: { en: "Wealthfront" },
    description: {
      en: "Robo-advisor with auto-tax-loss harvesting. Hands-off portfolio management from 0.25% AUM.",
    },
    cta: { en: "Learn more" },
    url: { default: "#pending-wealthfront" },
    network: "direct",
    badge: "🤖",
    pending: true,
  },

  // ───────── Health / 健康 ─────────
  {
    id: "myprotein-jp",
    category: "health",
    markets: ["JP", "global"],
    name: {
      ja: "マイプロテイン",
      en: "MyProtein",
    },
    description: {
      ja: "ヨーロッパNo.1のフィットネスブランド。プロテイン・サプリ・スポーツウェアが直送。",
      en: "Europe's #1 fitness brand. Protein, supplements, and sportswear shipped worldwide.",
    },
    cta: { ja: "公式サイトを見る", en: "Visit site" },
    url: { default: "#pending-myprotein" },
    network: "a8",
    badge: "💪",
    pending: true,
  },
  {
    id: "iherb-global",
    category: "health",
    markets: ["global", "JP", "US"],
    name: {
      ja: "iHerb",
      en: "iHerb",
      "zh-CN": "iHerb",
    },
    description: {
      ja: "海外サプリ・自然派食品の世界最大級ストア。日本語サポートあり。",
      en: "World's largest store for natural supplements and health foods.",
      "zh-CN": "全球最大的天然保健品与健康食品商店。",
    },
    cta: { ja: "詳細を見る", en: "Learn more", "zh-CN": "了解更多" },
    url: { default: "#pending-iherb" },
    network: "rakuten-affiliate",
    badge: "🌿",
    pending: true,
  },
  {
    id: "asken-jp",
    category: "health",
    markets: ["JP"],
    locales: ["ja"],
    name: { ja: "あすけん" },
    description: { ja: "管理栄養士監修の食事記録アプリ。BMI・カロリー計算と組合わせて使うと効果倍増。" },
    cta: { ja: "アプリを見る" },
    url: { default: "#pending-asken" },
    network: "a8",
    badge: "🥗",
    pending: true,
  },

  // ───────── Text / Developer tools ─────────
  {
    id: "grammarly-en",
    category: "text",
    markets: ["US", "global"],
    locales: ["en"],
    name: { en: "Grammarly" },
    description: {
      en: "AI writing assistant catches grammar, tone, and clarity issues in real time. Free + Premium plans.",
    },
    cta: { en: "Try free" },
    url: { default: "#pending-grammarly" },
    network: "direct",
    badge: "✍️",
    pending: true,
  },
  {
    id: "1password-global",
    category: "text",
    markets: ["global"],
    name: {
      en: "1Password",
      ja: "1Password",
    },
    description: {
      en: "Industry-leading password manager. End-to-end encrypted vaults, Watchtower alerts, family sharing.",
      ja: "業界標準のパスワードマネージャ。家族共有・Watchtower監視・E2E暗号化。",
    },
    cta: { en: "Try 1Password", ja: "詳細を見る" },
    url: { default: "#pending-1password" },
    network: "direct",
    badge: "🔐",
    pending: true,
  },
  {
    id: "conoha-jp",
    category: "text",
    markets: ["JP"],
    locales: ["ja"],
    name: { ja: "ConoHa WING" },
    description: { ja: "国内最速のレンタルサーバー。WordPressサイト構築・独自ドメイン無料・初期費用0円。" },
    cta: { ja: "詳細を見る" },
    url: { default: "#pending-conoha" },
    network: "a8",
    badge: "🌐",
    pending: true,
  },

  // ───────── Color / Design ─────────
  {
    id: "adobe-cc-global",
    category: "color",
    markets: ["global", "JP"],
    name: {
      en: "Adobe Creative Cloud",
      ja: "Adobe Creative Cloud",
    },
    description: {
      en: "Photoshop, Illustrator, and 20+ creative apps in one subscription. Free trial available.",
      ja: "Photoshop・Illustrator など20以上のアプリが使える定額サブスク。7日間無料体験。",
    },
    cta: { en: "Free trial", ja: "無料体験を見る" },
    url: { default: "#pending-adobe-cc" },
    network: "direct",
    badge: "🎨",
    pending: true,
  },
  {
    id: "canva-global",
    category: "color",
    markets: ["global"],
    name: {
      en: "Canva Pro",
      ja: "Canva Pro",
      "zh-CN": "Canva Pro",
    },
    description: {
      en: "Drag-and-drop design tool with 100M+ assets. SNS posts, presentations, and brand kits.",
      ja: "ドラッグ&ドロップで作れるデザインツール。1億以上の素材・SNS投稿・プレゼン資料に最適。",
      "zh-CN": "拖放式设计工具, 含 1 亿+素材库。社交媒体、演示、品牌套件适用。",
    },
    cta: { en: "Try Canva Pro", ja: "詳細を見る", "zh-CN": "了解更多" },
    url: { default: "#pending-canva" },
    network: "direct",
    badge: "🖼️",
    pending: true,
  },

  // ───────── Datetime / 日付 ─────────
  {
    id: "todoist-global",
    category: "datetime",
    markets: ["global"],
    name: {
      en: "Todoist",
      ja: "Todoist",
    },
    description: {
      en: "Capture and organize tasks across web, mobile, and desktop. Natural-language scheduling.",
      ja: "Web・モバイル・デスクトップでタスク管理。自然文での予定入力に対応。",
    },
    cta: { en: "Learn more", ja: "詳細を見る" },
    url: { default: "#pending-todoist" },
    network: "direct",
    badge: "✅",
    pending: true,
  },

  // ───────── Math / Converter — generic productivity ─────────
  {
    id: "notion-global",
    category: "math",
    markets: ["global"],
    name: {
      en: "Notion",
      ja: "Notion",
      "zh-CN": "Notion",
    },
    description: {
      en: "All-in-one workspace for notes, databases, and team docs. AI-assisted writing built in.",
      ja: "ノート・データベース・チームドキュメント統合ワークスペース。AI機能標準搭載。",
      "zh-CN": "笔记、数据库、团队文档一体化工作空间, 内置 AI 写作辅助。",
    },
    cta: { en: "Get Notion", ja: "詳細を見る", "zh-CN": "了解更多" },
    url: { default: "#pending-notion" },
    network: "direct",
    badge: "📓",
    pending: true,
  },
];

/**
 * 指定カテゴリ + ロケール + マーケットに合うオファーを返す。
 * pendingは含めるが、UIで disabled 表示にする責任は呼び出し側。
 */
export function getOffersFor(category: string, locale: string, opts: { includePending?: boolean } = {}): AffiliateOffer[] {
  const market = inferMarketFromLocale(locale);
  return CATALOG.filter((o) => {
    if (o.category !== category) return false;
    if (o.locales && !o.locales.includes(locale)) return false;
    if (o.markets && !o.markets.includes(market) && !o.markets.includes("global")) return false;
    if (!opts.includePending && o.pending) return false;
    return true;
  }).slice(0, POLICY.maxPerSlot);
}

function inferMarketFromLocale(locale: string): "JP" | "US" | "CN" | "global" {
  if (locale === "ja") return "JP";
  if (locale === "zh-CN") return "CN";
  if (locale === "en") return "US";
  return "global";
}
