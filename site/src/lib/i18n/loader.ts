import type { Locale } from "./locales";
import { DEFAULT_LOCALE } from "./locales";
import { listTools } from "@/lib/tools/registry";

type Messages = Record<string, unknown>;

async function loadCommon(locale: string): Promise<Messages> {
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

export async function loadMessages(locale: Locale | string): Promise<Messages> {
  const [common, tools] = await Promise.all([loadCommon(locale), loadToolMessages(locale)]);
  return { ...common, tools };
}
