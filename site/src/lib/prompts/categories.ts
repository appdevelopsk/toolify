import type { PromptCategory } from "./types";

export const PROMPT_CATEGORY_CONFIG: Record<PromptCategory, { emoji: string; label: string; iconBg: string }> = {
  coding: {
    emoji: "💻",
    label: "Coding",
    iconBg: "bg-violet-100 dark:bg-violet-950/50",
  },
  writing: {
    emoji: "✍️",
    label: "Writing",
    iconBg: "bg-sky-100 dark:bg-sky-950/50",
  },
  design: {
    emoji: "🎨",
    label: "Design",
    iconBg: "bg-pink-100 dark:bg-pink-950/50",
  },
  research: {
    emoji: "🔬",
    label: "Research",
    iconBg: "bg-emerald-100 dark:bg-emerald-950/50",
  },
  business: {
    emoji: "💼",
    label: "Business",
    iconBg: "bg-amber-100 dark:bg-amber-950/50",
  },
  marketing: {
    emoji: "📣",
    label: "Marketing",
    iconBg: "bg-orange-100 dark:bg-orange-950/50",
  },
};
