export type PromptCategory =
  | "coding"
  | "writing"
  | "design"
  | "research"
  | "business"
  | "marketing";

/** Which LLM/tool this prompt is tuned for. "any" means model-agnostic. */
export type RecommendedModel = "chatgpt" | "claude" | "gemini" | "midjourney" | "perplexity" | "cursor" | "any";

export interface PromptMeta {
  slug: string;
  category: PromptCategory;
  /** Models this prompt is known to work well with — used for filtering and SEO. */
  recommendedFor: RecommendedModel[];
  /** ISO date — drives sitemap lastmod and "updated" structured data. */
  updatedAt: string;
  /** related slugs for internal-link mesh */
  related: string[];
  /** primary keyword per locale, used in OG/meta */
  primaryKeyword: Record<string, string>;
}

/**
 * A prompt is content, not interactive code. Unlike ToolDefinition,
 * we don't ship a React Component — the prompt page renders entirely
 * from the locale-keyed messages JSON.
 */
export interface PromptDefinition {
  meta: PromptMeta;
}
