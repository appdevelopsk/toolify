import type { Locale } from "./locales";
import { DEFAULT_LOCALE } from "./locales";
import { listTools } from "@/lib/tools/registry";
import { listPrompts } from "@/lib/prompts/registry";

type Messages = { [key: string]: string | Messages };

export async function loadCommon(locale: string): Promise<Messages> {
  try {
    return (await import(`@/messages/${locale}.json`)).default;
  } catch {
    return (await import(`@/messages/${DEFAULT_LOCALE}.json`)).default;
  }
}

async function loadToolMessages(locale: string): Promise<Messages> {
  const tools = listTools();
  const out: Messages = {};
  for (const tool of tools) {
    try {
      const mod = await import(`@/tools/${tool.slug}/messages/${locale}.json`);
      out[tool.slug] = mod.default;
    } catch {
      try {
        const fallback = await import(`@/tools/${tool.slug}/messages/${DEFAULT_LOCALE}.json`);
        out[tool.slug] = fallback.default;
      } catch {
        out[tool.slug] = {};
      }
    }
  }
  return out;
}

async function loadPromptMessages(locale: string): Promise<Messages> {
  const prompts = listPrompts();
  const out: Messages = {};
  for (const prompt of prompts) {
    try {
      const mod = await import(`@/prompts/${prompt.slug}/messages/${locale}.json`);
      out[prompt.slug] = mod.default;
    } catch {
      try {
        const fallback = await import(`@/prompts/${prompt.slug}/messages/${DEFAULT_LOCALE}.json`);
        out[prompt.slug] = fallback.default;
      } catch {
        out[prompt.slug] = {};
      }
    }
  }
  return out;
}

/** Load a single tool's messages for the client-side nested provider on tool pages. */
export async function loadToolSlugMessages(locale: string, slug: string): Promise<Messages> {
  try {
    return (await import(`@/tools/${slug}/messages/${locale}.json`)).default;
  } catch {
    try {
      return (await import(`@/tools/${slug}/messages/${DEFAULT_LOCALE}.json`)).default;
    } catch {
      return {};
    }
  }
}

export async function loadMessages(locale: Locale | string): Promise<Messages> {
  const [common, tools, prompts] = await Promise.all([
    loadCommon(locale),
    loadToolMessages(locale),
    loadPromptMessages(locale),
  ]);
  return { ...common, tools, prompts };
}
