import type { PromptDefinition, PromptMeta } from "./types";

import codeReview from "@/prompts/code-review";
import emailRewriter from "@/prompts/email-rewriter";
import blogOutline from "@/prompts/blog-outline";
import midjourneyPortrait from "@/prompts/midjourney-portrait";
import researchSummary from "@/prompts/research-summary";
import meetingPrep from "@/prompts/meeting-prep";
import adCopyVariants from "@/prompts/ad-copy-variants";

const PROMPTS: PromptDefinition[] = [
  codeReview,
  emailRewriter,
  blogOutline,
  midjourneyPortrait,
  researchSummary,
  meetingPrep,
  adCopyVariants,
];

const SLUG_INDEX = new Map(PROMPTS.map((p) => [p.meta.slug, p]));

export function listPrompts(): PromptMeta[] {
  return PROMPTS.map((p) => p.meta);
}

export function getPrompt(slug: string): PromptDefinition | undefined {
  return SLUG_INDEX.get(slug);
}

export function listPromptsByCategory(category: string): PromptMeta[] {
  return PROMPTS.map((p) => p.meta).filter((m) => m.category === category);
}

export function getRelatedPrompts(slug: string, limit = 4): PromptMeta[] {
  const p = SLUG_INDEX.get(slug);
  if (!p) return [];
  const related = p.meta.related
    .map((s) => SLUG_INDEX.get(s)?.meta)
    .filter((m): m is PromptMeta => Boolean(m));
  if (related.length >= limit) return related.slice(0, limit);
  const fill = PROMPTS.map((q) => q.meta)
    .filter((m) => m.slug !== slug && m.category === p.meta.category && !related.includes(m))
    .slice(0, limit - related.length);
  return [...related, ...fill];
}
