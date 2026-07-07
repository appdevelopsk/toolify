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
  // === Awin配線 (pub 2887303) — AdSense代替収益。英語(en=US)流入の計上を有効化。
  //     ★markets:["US"]のみ(["US","global"]は不可): toolifyのフィルタは "global" を「全市場ワイルドカード」
  //     として扱うため global を含めるとJP訪問者にも出て既存a8勢を押しのける。US限定でJP(a8)を温存。
  //     RelatedServicesはurlを直接使用。VPN枠はNordVPNに集約(Surfshark DE/ATは粗い市場に不適合)。 ===
  {
    id: "nordvpn-awin",
    category: "text",
    alsoIn: ["finance", "math", "converter", "datetime", "color", "health"],
    markets: ["US"],
    name: { en: "NordVPN" },
    description: { en: "Strict no-logs VPN with 6,400+ servers in 111 countries. Threat Protection blocks ads, trackers, and malware while you work online." },
    cta: { en: "Get NordVPN" },
    url: { default: "https://www.awin1.com/cread.php?awinmid=15132&awinaffid=2887303&ued=https%3A%2F%2Fnordvpn.com%2F" },
    network: "awin",
    badge: "🛡️",
  },
  {
    id: "cloudways-awin",
    category: "text",
    alsoIn: ["converter", "datetime", "color", "math"],
    markets: ["US"],
    name: { en: "Cloudways" },
    description: { en: "Managed cloud hosting for WordPress and web apps on DigitalOcean, Vultr, and AWS. Fast setup, no server headaches." },
    cta: { en: "Try Cloudways" },
    url: { default: "https://www.awin1.com/cread.php?awinmid=89935&awinaffid=2887303&ued=https%3A%2F%2Fwww.cloudways.com%2F" },
    network: "awin",
    badge: "☁️",
  },
  {
    id: "fiverr-awin",
    category: "finance",
    alsoIn: ["text", "converter", "datetime"],
    markets: ["US"],
    name: { en: "Fiverr" },
    description: { en: "Hire freelancers for design, writing, dev, and marketing — or sell your own services. Millions of gigs at every budget." },
    cta: { en: "Browse Fiverr" },
    url: { default: "https://www.awin1.com/cread.php?awinmid=6288&awinaffid=2887303&ued=https%3A%2F%2Fwww.fiverr.com%2F" },
    network: "awin",
    badge: "💼",
  },
  {
    id: "ultrahuman-awin",
    category: "health",
    markets: ["US"],
    name: { en: "Ultrahuman Ring AIR" },
    description: { en: "Smart ring tracking sleep, HRV, glucose, and recovery — turn your health numbers into daily action." },
    cta: { en: "Shop Ultrahuman" },
    url: { default: "https://www.awin1.com/cread.php?awinmid=69428&awinaffid=2887303&ued=https%3A%2F%2Fultrahuman.com%2F" },
    network: "awin",
    badge: "💍",
  },
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

  {
    id: "credit-karma-us",
    category: "finance",
    markets: ["US"],
    locales: ["en"],
    name: { en: "Credit Karma" },
    description: {
      en: "Free credit scores, credit reports, and personalized recommendations for cards and loans.",
    },
    cta: { en: "Check free score" },
    url: { default: "#pending-credit-karma" },
    network: "direct",
    badge: "📊",
    pending: true,
  },
  {
    id: "policygenius-us",
    category: "finance",
    markets: ["US"],
    locales: ["en"],
    name: { en: "Policygenius" },
    description: {
      en: "Compare term life insurance quotes from top carriers in minutes. No phone calls, transparent pricing.",
    },
    cta: { en: "Compare quotes" },
    url: { default: "#pending-policygenius" },
    network: "direct",
    badge: "🛡️",
    pending: true,
  },
  {
    id: "lifenet-jp",
    category: "finance",
    markets: ["JP"],
    locales: ["ja"],
    name: { ja: "ライフネット生命" },
    description: { ja: "ネット完結型の定期保険。月々の保険料が手頃で、必要保障額に合わせた設計が可能。" },
    cta: { ja: "見積りを見る" },
    url: { default: "#pending-lifenet" },
    network: "a8",
    badge: "🛡️",
    pending: true,
  },
  {
    id: "kakaku-hoken-jp",
    category: "finance",
    markets: ["JP"],
    locales: ["ja"],
    name: { ja: "価格.com 保険" },
    description: { ja: "生命保険・医療保険を一括比較。ファイナンシャルプランナーへの無料相談も可能。" },
    cta: { ja: "保険を比較" },
    url: { default: "#pending-kakaku-hoken" },
    network: "moshimo",
    badge: "📋",
    pending: true,
  },
  {
    id: "moneyforward-jp",
    category: "finance",
    markets: ["JP"],
    locales: ["ja"],
    name: { ja: "マネーフォワード ME" },
    description: { ja: "クレカ・銀行・証券を自動連携して家計管理。DTI・利用率の見える化に最適。" },
    cta: { ja: "アプリを見る" },
    url: { default: "#pending-moneyforward" },
    network: "a8",
    badge: "💰",
    pending: true,
  },
  {
    id: "personal-capital-us",
    category: "finance",
    markets: ["US"],
    locales: ["en"],
    name: { en: "Empower (Personal Capital)" },
    description: {
      en: "Free dashboard to track net worth, retirement readiness, and fee analysis on your investment accounts.",
    },
    cta: { en: "Track free" },
    url: { default: "#pending-empower" },
    network: "direct",
    badge: "📈",
    pending: true,
  },
  {
    id: "klaviyo-us",
    category: "finance",
    markets: ["US"],
    locales: ["en"],
    name: { en: "Klaviyo" },
    description: {
      en: "Email + SMS marketing platform built for ecommerce. Segments, automations, and revenue attribution.",
    },
    cta: { en: "Free trial" },
    url: { default: "#pending-klaviyo" },
    network: "direct",
    badge: "📧",
    pending: true,
  },
  {
    id: "shopify-global",
    category: "finance",
    markets: ["global"],
    name: {
      en: "Shopify",
      ja: "Shopify",
    },
    description: {
      en: "Launch and grow an online store. Ad ROAS, sales, and inventory in one dashboard.",
      ja: "オンラインストアを開設・運営。広告ROASや売上・在庫を一元管理。",
    },
    cta: { en: "Start free trial", ja: "無料体験を見る" },
    url: { default: "#pending-shopify" },
    network: "direct",
    badge: "🛒",
    pending: true,
  },

  // ───────── Health / 健康 ─────────
  {
    // A8.net link → myprotein.jp (Japanese LP, JP shipping only)
    id: "myprotein-jp",
    category: "health",
    markets: ["JP"],
    locales: ["ja"],
    name: { ja: "マイプロテイン" },
    description: {
      ja: "ヨーロッパNo.1のフィットネスブランド。プロテイン・サプリ・スポーツウェアが直送。",
    },
    cta: { ja: "公式サイトを見る" },
    url: { default: "https://px.a8.net/svt/ejp?a8mat=4B3OR1+9IXP82+45DI+5ZU29" },
    network: "a8",
    badge: "💪",
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
    url: { default: "https://af.moshimo.com/af/c/click?a_id=5552959&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fwww.rakuten.co.jp%2Fiherb%2F" },
    network: "moshimo",
    badge: "🌿",
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
  // Ordered by EPC descending so the top 3 (maxPerSlot) are highest-value for ja locale.
  // NordVPN EPC 89.71 → xserver EPC 51.66 → ConoHa EPC 49.89 are the visible trio for ja.
  {
    // A8.net link → NordVPN Japanese LP. EPC 89.71 — keep first; alsoIn で全カテゴリへ展開
    id: "nordvpn-jp",
    category: "text",
    alsoIn: ["finance", "math", "converter", "datetime", "color", "health"],
    markets: ["JP"],
    locales: ["ja"],
    name: { ja: "NordVPN" },
    description: {
      ja: "厳格なノーログポリシーと6000台以上のサーバーで、安全かつ高速なネット接続を提供するVPN。",
    },
    cta: { ja: "詳細を見る" },
    url: { default: "https://px.a8.net/svt/ejp?a8mat=4B3OQX+CY6FG2+3YFI+61Z81" },
    network: "a8",
    badge: "🛡️",
  },
  {
    id: "xserver-jp",
    category: "text",
    alsoIn: ["math", "converter", "datetime", "color"],
    markets: ["JP"],
    locales: ["ja"],
    name: { ja: "エックスサーバー" },
    description: { ja: "国内シェアNo.1のレンタルサーバー。WordPress高速化・自動バックアップ・無料SSLで個人サイトに最適。" },
    cta: { ja: "詳細を見る" },
    url: { default: "https://px.a8.net/svt/ejp?a8mat=4B3OQX+CWZK8I+CO4+6HES1" },
    network: "a8",
    badge: "⚡",
  },
  {
    id: "conoha-jp",
    category: "text",
    alsoIn: ["math", "converter", "datetime", "color"],
    markets: ["JP"],
    locales: ["ja"],
    name: { ja: "ConoHa WING" },
    description: { ja: "国内最速のレンタルサーバー。WordPressサイト構築・独自ドメイン無料・初期費用0円。" },
    cta: { ja: "詳細を見る" },
    url: { default: "https://px.a8.net/svt/ejp?a8mat=4B3OR1+9HQU0I+50+5SS2PD" },
    network: "a8",
    badge: "🌐",
  },
  {
    id: "sakura-internet-jp",
    category: "text",
    markets: ["JP"],
    locales: ["ja"],
    name: { ja: "さくらのレンタルサーバ" },
    description: { ja: "ご利用件数48万件突破の老舗レンタルサーバー。月額換算最安水準、独自SSL対応。" },
    cta: { ja: "詳細を見る" },
    url: { default: "https://px.a8.net/svt/ejp?a8mat=4B3OQX+C08PYQ+D8Y+6R9PT" },
    network: "a8",
    badge: "🌸",
  },
  {
    // A8.net link → Surfshark Japanese LP. EPC 2.06 — shown only when slot 4+ available.
    id: "surfshark-antivirus-jp",
    category: "text",
    markets: ["JP"],
    locales: ["ja"],
    name: { ja: "Surfshark Antivirus" },
    description: {
      ja: "マルウェア等の脅威からデバイスを保護。VPN統合・軽量・複数デバイス対応の総合セキュリティ。",
    },
    cta: { ja: "詳細を見る" },
    url: { default: "https://px.a8.net/svt/ejp?a8mat=4B3OQX+C210S2+4LSW+BYLJL" },
    network: "a8",
    badge: "🔰",
  },
  {
    id: "mixhost-jp",
    category: "text",
    markets: ["JP"],
    locales: ["ja"],
    name: { ja: "mixhost" },
    description: { ja: "WordPressに最適な高速クラウド型レンタルサーバー。LiteSpeed Cache標準搭載で表示速度抜群。" },
    cta: { ja: "詳細を見る" },
    url: { default: "https://px.a8.net/svt/ejp?a8mat=4B3OQX+CXKZUA+3JTE+5YRHE" },
    network: "a8",
    badge: "🚀",
  },
  {
    id: "onamae-com-jp",
    category: "text",
    markets: ["JP"],
    locales: ["ja"],
    name: { ja: "お名前.com" },
    description: { ja: "国内シェアNo.1の独自ドメイン取得サービス。.com/.netが0円〜、ドメイン管理を一元化できる。" },
    cta: { ja: "詳細を見る" },
    url: { default: "https://px.a8.net/svt/ejp?a8mat=4B3LMO+7QMVW2+50+2HU3GX" },
    network: "a8",
    badge: "🔖",
  },
  {
    id: "grammarly-en",
    category: "text",
    markets: ["US"],
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

  // ───────── AI Pro plans (shown on /prompts pages, category "ai") ─────────
  {
    id: "claude-pro-global",
    category: "ai",
    markets: ["global"],
    name: { en: "Claude Pro", ja: "Claude Pro", "zh-CN": "Claude Pro" },
    description: {
      en: "Anthropic's flagship model with 5× usage and Projects. Best for code review, research, and long-context tasks.",
      ja: "Anthropic の主力モデル。利用枠5倍と Projects 機能。コードレビュー・リサーチ・長文脈タスクに最適。",
      "zh-CN": "Anthropic 的旗舰模型, 5 倍用量与 Projects 功能。最适合代码审查、研究和长上下文任务。",
    },
    cta: { en: "Try Claude Pro", ja: "Claude Pro を見る", "zh-CN": "尝试 Claude Pro" },
    url: { default: "#pending-claude-pro" },
    network: "direct",
    badge: "🤖",
    pending: true,
  },
  {
    id: "chatgpt-plus-global",
    category: "ai",
    markets: ["global"],
    name: { en: "ChatGPT Plus", ja: "ChatGPT Plus", "zh-CN": "ChatGPT Plus" },
    description: {
      en: "Access GPT-5 / GPT-4o, advanced data analysis, and custom GPTs. Reliable for daily writing and brainstorming.",
      ja: "GPT-5 / GPT-4o、高度データ分析、Custom GPTs にアクセス。日常の執筆とブレストに信頼できる。",
      "zh-CN": "可使用 GPT-5 / GPT-4o、高级数据分析和 Custom GPTs。日常写作和头脑风暴稳定可靠。",
    },
    cta: { en: "Get ChatGPT Plus", ja: "ChatGPT Plus を見る", "zh-CN": "订阅 ChatGPT Plus" },
    url: { default: "#pending-chatgpt-plus" },
    network: "direct",
    badge: "💬",
    pending: true,
  },
  {
    id: "cursor-pro-global",
    category: "ai",
    markets: ["global"],
    name: { en: "Cursor Pro", ja: "Cursor Pro", "zh-CN": "Cursor Pro" },
    description: {
      en: "AI-native code editor with Composer mode. Pairs perfectly with code-review prompts in real workflows.",
      ja: "Composer モード搭載 AI ネイティブコードエディタ。コードレビュー プロンプトと実用ワークフローで好相性。",
      "zh-CN": "原生 AI 代码编辑器, 含 Composer 模式。在真实工作流中与代码审查提示词完美配合。",
    },
    cta: { en: "Try Cursor", ja: "Cursor を見る", "zh-CN": "尝试 Cursor" },
    url: { default: "#pending-cursor" },
    network: "direct",
    badge: "✏️",
    pending: true,
  },
  {
    id: "perplexity-pro-global",
    category: "ai",
    markets: ["global"],
    name: { en: "Perplexity Pro", ja: "Perplexity Pro", "zh-CN": "Perplexity Pro" },
    description: {
      en: "Search-grounded LLM that cites sources. Pairs with research-summary prompts to verify claims fast.",
      ja: "出典を引用する検索ベース LLM。リサーチ要約プロンプトと組み合わせて主張を素早く検証。",
      "zh-CN": "引用来源的搜索型 LLM。与研究摘要提示词配合, 快速验证主张。",
    },
    cta: { en: "Try Perplexity Pro", ja: "Perplexity を見る", "zh-CN": "尝试 Perplexity" },
    url: { default: "#pending-perplexity" },
    network: "direct",
    badge: "🔍",
    pending: true,
  },
  {
    id: "midjourney-global",
    category: "ai",
    markets: ["global"],
    name: { en: "Midjourney", ja: "Midjourney", "zh-CN": "Midjourney" },
    description: {
      en: "Top-tier text-to-image model. The portrait prompts on this site are tuned for v6.1 and v7.",
      ja: "最高峰の画像生成モデル。本サイトの人物プロンプトは v6.1 と v7 用に調整済み。",
      "zh-CN": "顶级文生图模型。本站人像提示词为 v6.1 和 v7 调优。",
    },
    cta: { en: "Subscribe", ja: "Midjourney を見る", "zh-CN": "订阅" },
    url: { default: "#pending-midjourney" },
    network: "direct",
    badge: "🎨",
    pending: true,
  },
];

/**
 * カテゴリ非依存の「おすすめサービス」を返す（トップ / 一覧ページ用）。
 * ロケール + マーケットに合う **ライブ案件のみ**（pending除外）をカタログ順
 * （= EPC降順に並べてある）で拾い、ID重複を除いて limit 件返す。
 * カテゴリ別の getOffersFor と違い、面に縛られず最高値のオファーを横断表示する。
 */
export function getFeaturedOffers(locale: string, limit = POLICY.maxPerSlot): AffiliateOffer[] {
  const market = inferMarketFromLocale(locale);
  const seen = new Set<string>();
  const out: AffiliateOffer[] = [];
  for (const o of CATALOG) {
    if (o.pending) continue;
    if (o.locales && !o.locales.includes(locale)) continue;
    if (o.markets && !o.markets.includes(market) && !o.markets.includes("global")) continue;
    if (seen.has(o.id)) continue;
    seen.add(o.id);
    out.push(o);
    if (out.length >= limit) break;
  }
  return out;
}

/**
 * 指定カテゴリ + ロケール + マーケットに合うオファーを返す。
 * pendingは含めるが、UIで disabled 表示にする責任は呼び出し側。
 */
export function getOffersFor(category: string, locale: string, opts: { includePending?: boolean } = {}): AffiliateOffer[] {
  const market = inferMarketFromLocale(locale);
  const matches = (o: AffiliateOffer) => {
    const inCategory = o.category === category || (o.alsoIn?.includes(category as AffiliateOffer["category"]) ?? false);
    if (!inCategory) return false;
    if (o.locales && !o.locales.includes(locale)) return false;
    if (o.markets && !o.markets.includes(market) && !o.markets.includes("global")) return false;
    if (!opts.includePending && o.pending) return false;
    return true;
  };
  // Primary-category entries first, then alsoIn entries (lower priority)
  const primary = CATALOG.filter((o) => o.category === category && matches(o));
  const secondary = CATALOG.filter((o) => o.category !== category && matches(o));
  return [...primary, ...secondary].slice(0, POLICY.maxPerSlot);
}

function inferMarketFromLocale(locale: string): "JP" | "US" | "CN" | "global" {
  if (locale === "ja") return "JP";
  if (locale === "zh-CN") return "CN";
  if (locale === "en") return "US";
  return "global";
}
