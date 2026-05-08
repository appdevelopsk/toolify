# Affiliate Runbook — pending → live

このドキュメントは `site/src/lib/affiliates/catalog.ts` で `pending: true` になっているオファーを、ASP承認後に本物のアフィリエイトリンクに差し替えるための手順書です。

## ステップ

1. 該当ASPで会員登録（既に登録済みの場合はスキップ）
2. 案件を検索 → 提携申請
3. 承認されたら、専用アフィリリンクを発行（バナー or テキストリンク）
4. `catalog.ts` の該当エントリの `url.default` を発行されたURLに置換し `pending: true` を削除
5. `npm run build` で型チェック通ること確認 → commit → push

---

## ASP別 — 登録URL

| ASP | 登録URL | 主な対応サイト |
|---|---|---|
| **A8.net** (国内最大手) | https://www.a8.net/as/as_pro/registration.html | 楽天カード, 楽天証券, SBI証券, ライフネット生命, ConoHa, あすけん, Klaviyo, MoneyForward |
| **もしもアフィリエイト** | https://af.moshimo.com/af/register/ | 楽天市場, Amazon, 価格.com保険, iHerb（楽天） |
| **バリューコマース** | https://www.valuecommerce.ne.jp/ | 一部大手サービス（Yahoo!ショッピング系） |
| **アクセストレード** | https://www.accesstrade.ne.jp/ | 仮想通貨取引所、FX系 |
| **Amazonアソシエイト** | https://affiliate.amazon.co.jp/ / .com | Amazon全商品 |
| **楽天アフィリエイト** | https://affiliate.rakuten.co.jp/ | 楽天市場全商品（要楽天会員） |
| **Impact** (米向け) | https://impact.com/ | Wealthfront, Empower(旧PersonalCapital), Policygenius, Credit Karma |
| **PartnerStack** (SaaS米向け) | https://partnerstack.com/ | Klaviyo, Shopify, Notion, 1Password |
| **Awin** (グローバル) | https://www.awin.com/ | Adobe CC, Canva, Grammarly, Todoist, MyProtein(海外) |

---

## 案件別 — 取得手順チェックリスト

### 🇯🇵 日本向け（最優先）

- [ ] **rakuten-securities-jp** — もしも → 「楽天証券」検索 → 提携 → リンク発行
- [ ] **sbi-securities-jp** — A8 → 「SBI証券」検索 → 提携 → リンク発行
- [ ] **rakuten-card-jp** — A8 → 「楽天カード」検索 → 提携 → リンク発行
- [ ] **lifenet-jp** — A8 → 「ライフネット生命」検索 → 提携 → リンク発行
- [ ] **kakaku-hoken-jp** — もしも → 「価格.com保険」検索 → 提携 → リンク発行
- [ ] **moneyforward-jp** — A8 → 「マネーフォワード」検索 → 提携 → リンク発行
- [ ] **conoha-jp** — A8 → 「ConoHa WING」検索 → 提携 → リンク発行
- [ ] **myprotein-jp** — A8 → 「MyProtein」検索 → 提携 → リンク発行
- [ ] **asken-jp** — A8 → 「あすけん」検索 → 提携 → リンク発行
- [ ] **iherb-global** — 楽天アフィリエイト → iHerb商品リンク（または直接 https://www.iherb.com/info/affiliate）

### 🇺🇸 米向け（高単価）

- [ ] **wealthfront-us** — Impact / 直接 https://www.wealthfront.com/affiliate
- [ ] **policygenius-us** — Impact → Policygenius検索 → 提携
- [ ] **credit-karma-us** — Impact / 直接アフィリエイトプログラム
- [ ] **empower-us** (Personal Capital) — Impact → Empower検索
- [ ] **klaviyo-us** — PartnerStack → Klaviyo Partner Program
- [ ] **shopify-global** — Shopify Affiliates: https://www.shopify.com/affiliates

### 🌐 グローバル

- [ ] **adobe-cc-global** — Awin → Adobe検索 → Adobe Affiliate Program
- [ ] **canva-global** — Awin / Impact → Canva検索
- [ ] **grammarly-en** — PartnerStack / Impact → Grammarly Partner
- [ ] **1password-global** — PartnerStack → 1Password Partner
- [ ] **todoist-global** — 直接 https://todoist.com/business/affiliate
- [ ] **notion-global** — 直接 https://www.notion.so/affiliates

---

## 差替え手順（コード）

`site/src/lib/affiliates/catalog.ts` の該当エントリを編集:

```diff
  {
    id: "rakuten-card-jp",
    category: "finance",
    markets: ["JP"],
    locales: ["ja"],
    name: { ja: "楽天カード" },
    description: { ja: "..." },
    cta: { ja: "公式サイトを見る" },
-   url: { default: "#pending-rakuten-card" },
+   url: { default: "https://px.a8.net/svt/ejp?a8mat=XXXXXXXX..." },
    network: "a8",
    badge: "💳",
-   pending: true,
+   // pending: true  ← この行を削除またはコメントアウト
  },
```

`pending: true` を削除すると、UI側で実リンクとして表示されるようになります（淡色の「準備中」表示が解除）。

---

## 報酬の目安（参考値・2026年時点）

| 案件 | 1件あたり報酬 | 備考 |
|---|---|---|
| 楽天カード新規 | 5,000-10,000円 | 国内アフィリ最高峰の単価 |
| SBI証券口座開設 | 5,000-15,000円 | NISA口座も可 |
| 楽天証券口座開設 | 4,000-8,000円 | キャンペーン時更に増額 |
| ライフネット生命資料請求 | 3,000-5,000円 | 成約より資料請求型なので決定率高 |
| ConoHa WING契約 | 5,000-10,000円 | 12ヶ月以上契約で増額 |
| Wealthfront (US) | $50-100 | $500預入で発生 |
| Policygenius (US) | $30-80 | リードベース |
| Klaviyo (US) | 30% recurring | SaaS型・継続報酬 |
| Shopify | $58 + 20% recurring | 高LTVで人気 |

---

## 開示・コンプライアンス

- すべてのオファーカードに「PR」「広告」ラベルが自動表示される（`POLICY.disclosureLabel` 経由）
- フッターに `/disclosure` へのリンク必須（既に実装済み）
- 景表法（JP）/FTC Endorsement Guides（US）に準拠した記述になるよう description 内で誇大表現を避ける
- 「絶対」「100%」「劇的」などの過剰語は禁止
