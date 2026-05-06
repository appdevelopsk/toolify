import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

const TOOLS_DIR = path.resolve(__dirname, "../../tools");
const REGISTRY_FILE = path.resolve(__dirname, "./registry.ts");
const TYPES_FILE = path.resolve(__dirname, "./types.ts");

const VALID_CATEGORIES = ["health", "math", "converter", "datetime", "text", "color", "finance"];

function listToolDirs(): string[] {
  return fs
    .readdirSync(TOOLS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith("_"))
    .map((d) => d.name)
    .sort();
}

describe("tool registry consistency", () => {
  const slugs = listToolDirs();
  const registrySource = fs.readFileSync(REGISTRY_FILE, "utf8");

  it("has at least 30 tools (AdSense recommended threshold)", () => {
    expect(slugs.length).toBeGreaterThanOrEqual(30);
  });

  it("every tool directory has Component.tsx, index.ts, and messages/", () => {
    for (const slug of slugs) {
      const dir = path.join(TOOLS_DIR, slug);
      expect(fs.existsSync(path.join(dir, "Component.tsx")), `${slug}: Component.tsx`).toBe(true);
      expect(fs.existsSync(path.join(dir, "index.ts")), `${slug}: index.ts`).toBe(true);
      expect(fs.existsSync(path.join(dir, "messages")), `${slug}: messages/`).toBe(true);
    }
  });

  it("every tool has en and ja message files", () => {
    for (const slug of slugs) {
      const msgs = path.join(TOOLS_DIR, slug, "messages");
      expect(fs.existsSync(path.join(msgs, "en.json")), `${slug}: en.json`).toBe(true);
      expect(fs.existsSync(path.join(msgs, "ja.json")), `${slug}: ja.json`).toBe(true);
    }
  });

  it("every tool is registered in registry.ts", () => {
    for (const slug of slugs) {
      // Either via @/tools/<slug> import path
      const escaped = slug.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const re = new RegExp(`@/tools/${escaped}`);
      expect(registrySource, `${slug} registered`).toMatch(re);
    }
  });

  it("each tool has a meta.slug matching its directory", () => {
    for (const slug of slugs) {
      const indexSource = fs.readFileSync(path.join(TOOLS_DIR, slug, "index.ts"), "utf8");
      const m = indexSource.match(/slug:\s*"([^"]+)"/);
      expect(m, `${slug}: index.ts has slug`).toBeTruthy();
      expect(m?.[1], `${slug}: slug matches dir`).toBe(slug);
    }
  });

  it("each tool meta declares a valid category", () => {
    for (const slug of slugs) {
      const indexSource = fs.readFileSync(path.join(TOOLS_DIR, slug, "index.ts"), "utf8");
      const m = indexSource.match(/category:\s*"([^"]+)"/);
      expect(m, `${slug}: has category`).toBeTruthy();
      expect(VALID_CATEGORIES, `${slug}: valid category`).toContain(m![1]);
    }
  });

  it("category set is exhaustively covered by ToolCategory type", () => {
    const types = fs.readFileSync(TYPES_FILE, "utf8");
    for (const cat of VALID_CATEGORIES) {
      expect(types).toContain(`"${cat}"`);
    }
  });

  it("each en.json has required SEO fields", () => {
    for (const slug of slugs) {
      const en = JSON.parse(fs.readFileSync(path.join(TOOLS_DIR, slug, "messages/en.json"), "utf8"));
      expect(en.title, `${slug}: en.title`).toBeTruthy();
      expect(en.metaDescription, `${slug}: en.metaDescription`).toBeTruthy();
      expect(Array.isArray(en.keywords), `${slug}: en.keywords array`).toBe(true);
      expect(Array.isArray(en.faq), `${slug}: en.faq array`).toBe(true);
      expect(en.faq.length, `${slug}: en.faq length >= 5`).toBeGreaterThanOrEqual(5);
    }
  });

  it("each ja.json has required SEO fields", () => {
    for (const slug of slugs) {
      const ja = JSON.parse(fs.readFileSync(path.join(TOOLS_DIR, slug, "messages/ja.json"), "utf8"));
      expect(ja.title, `${slug}: ja.title`).toBeTruthy();
      expect(ja.metaDescription, `${slug}: ja.metaDescription`).toBeTruthy();
    }
  });
});
