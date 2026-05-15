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
}
