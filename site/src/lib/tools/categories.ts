import type { ToolCategory } from "./types";

export const CATEGORY_CONFIG: Record<ToolCategory, { emoji: string; label: string; iconBg: string }> = {
  health: {
    emoji: "❤️",
    label: "Health & Fitness",
    iconBg: "bg-rose-100 dark:bg-rose-950/50",
  },
  math: {
    emoji: "🔢",
    label: "Math & Numbers",
    iconBg: "bg-blue-100 dark:bg-blue-950/50",
  },
  converter: {
    emoji: "🔄",
    label: "Unit Converters",
    iconBg: "bg-emerald-100 dark:bg-emerald-950/50",
  },
  datetime: {
    emoji: "📅",
    label: "Date & Time",
    iconBg: "bg-violet-100 dark:bg-violet-950/50",
  },
  text: {
    emoji: "📝",
    label: "Text & Code",
    iconBg: "bg-amber-100 dark:bg-amber-950/50",
  },
  color: {
    emoji: "🎨",
    label: "Color & Design",
    iconBg: "bg-pink-100 dark:bg-pink-950/50",
  },
  finance: {
    emoji: "💰",
    label: "Finance",
    iconBg: "bg-green-100 dark:bg-green-950/50",
  },
};
