export type ToolCategory = "health" | "math" | "converter" | "datetime" | "text" | "color" | "finance";

export interface ToolMeta {
  slug: string;
  category: ToolCategory;
  /** Lighthouse・CWV計算・schema.orgで使う */
  applicationCategory: string;
  /** lastModified: ISO date */
  updatedAt: string;
  /** related slugs for internal linking mesh */
  related: string[];
  /** 主要キーワード（OG/meta生成用、locale別に上書き可） */
  primaryKeyword: Record<string, string>;
  /** Schema.org HowTo steps があるか */
  hasHowTo: boolean;
  /** FAQ schema を出力するか */
  hasFaq: boolean;
  /**
   * E-E-A-T: 計算式・基準の一次情報（出典）。locale 非依存の実在 URL のみ。
   * 例: 健康系は WHO/CDC、数学/単位は NIST/定義元、金融は計算式の標準。
   * ページに「Sources」として表示し、JSON-LD の citation にも出す。
   * 自然な一次情報が無いツールでは省略（捏造した出典は付けない）。
   */
  sources?: { label: string; url: string }[];
}
