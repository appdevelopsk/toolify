import type { PromptCategory } from "./types";

/**
 * Curated mapping from prompt category → 2-3 calculator slugs that the
 * same audience plausibly uses alongside the prompt.
 *
 * Why not auto-derive: tools and prompts have orthogonal taxonomies. A
 * "research" prompt isn't the same audience as a "math" calculator unless
 * we cherry-pick the math tools that researchers actually use (statistics,
 * scientific notation, etc.). Same for the other categories.
 *
 * If you add a new prompt category, add at least 2 tool slugs here.
 */
export const RELATED_TOOLS: Record<PromptCategory, string[]> = {
  coding: ["regex-tester", "json-formatter", "uuid-generator"],
  writing: ["case-converter", "wpm-counter", "word-counter"],
  design: ["color-converter", "gradient-generator", "contrast-checker"],
  research: ["statistics-calculator", "scientific-notation-converter", "fraction-calculator"],
  business: ["roi-calculator", "compound-interest-calculator", "salary-converter"],
  marketing: ["roas-calculator", "discount-calculator", "vat-calculator"],
};
