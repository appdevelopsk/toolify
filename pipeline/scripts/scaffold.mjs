#!/usr/bin/env node
/**
 * scaffold.mjs <slug>
 *
 * Mechanical half of the tool pipeline. Reads pipeline/specs/<slug>.yaml and writes:
 *   site/src/tools/<slug>/index.ts            — ToolMeta from the spec
 *   site/src/tools/<slug>/Component.tsx       — working generic form skeleton
 *   site/src/tools/<slug>/messages/<loc>.json — en filled from spec, all other
 *                                               active locales seeded as en copies
 *   site/src/lib/tools/registry.ts            — import + TOOLS entry inserted
 *
 * Why seed every locale as an en copy: audit-i18n requires key parity across all
 * 17 active locales, so the structure must exist on day one. The seeded files are
 * placeholders — run pipeline/prompts/03_translate.md to localize them, then
 * `npm run validate` enforces SEO length budgets per locale.
 *
 * Idempotent: re-running updates files in place and never double-registers.
 *
 * ⚠️ VELOCITY FREEZE (2026-06): toolify365.com is in AdSense "low value /
 * scaled content" remediation. Mass-producing commodity calculators is an
 * active spam signal. Do NOT bulk-scaffold tools. A newly scaffolded tool is
 * noindex by default (it is NOT added to INDEXED_SLUGS in registry.ts) and must
 * stay that way until it has genuine, differentiating value — only then add its
 * slug to INDEXED_SLUGS, gradually. See docs/ADSENSE_RECOVERY_PLAN.md and the
 * memory note adsense-low-value-remediation.
 *
 * Usage:
 *   node pipeline/scripts/scaffold.mjs my-new-tool
 *   node pipeline/scripts/scaffold.mjs my-new-tool --dry   # print plan only
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const SITE = path.join(ROOT, "site");
const yaml = require(path.join(SITE, "node_modules", "js-yaml"));

const slug = process.argv[2];
const dry = process.argv.includes("--dry");
if (!slug || slug.startsWith("--")) {
  console.error("usage: node pipeline/scripts/scaffold.mjs <slug> [--dry]");
  process.exit(1);
}

const specPath = path.join(ROOT, "pipeline", "specs", `${slug}.yaml`);
if (!fs.existsSync(specPath)) {
  console.error(`spec not found: ${specPath}\ncopy pipeline/specs/_template.yaml and fill it in first.`);
  process.exit(1);
}
const spec = yaml.load(fs.readFileSync(specPath, "utf8"));

// ---- derive active locales from the source of truth ----
const localesSrc = fs.readFileSync(path.join(SITE, "src/lib/i18n/locales.ts"), "utf8");
const ACTIVE = [...localesSrc.matchAll(/code:\s*"([^"]+)",.*?active:\s*true/g)].map((m) => m[1]);

function camel(s) {
  return s.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase()).replace(/^[0-9]/, (d) => `_${d}`);
}
const varName = camel(slug);

const writes = [];
const queue = (file, content) => writes.push({ file, content });

// ---- index.ts ----
const relatedArr = (spec.related ?? []).map((r) => `"${r}"`).join(", ");
const pk = spec.primaryKeyword ?? { en: slug };
const pkLines = Object.entries(pk)
  .map(([k, v]) => `${/^[a-z]+$/i.test(k) ? k : `"${k}"`}: ${JSON.stringify(v)}`)
  .join(", ");
queue(
  path.join(SITE, "src/tools", slug, "index.ts"),
  `import type { ToolMeta } from "@/lib/tools/types";

const meta: ToolMeta = {
  slug: "${slug}",
  category: "${spec.category}",
  applicationCategory: "${spec.applicationCategory ?? "UtilitiesApplication"}",
  updatedAt: "${new Date().toISOString().slice(0, 10)}",
  related: [${relatedArr}],
  primaryKeyword: { ${pkLines} },
  hasHowTo: true,
  hasFaq: true,
};

export default meta;
`,
);

// ---- Component.tsx (generic, working skeleton) ----
const inputs = spec.inputs ?? [];
const stateLines = inputs
  .map((i) => `  const [${camel(i.name)}, set${cap(camel(i.name))}] = useState("${i.options?.[0] ?? ""}");`)
  .join("\n");
const fields = inputs
  .map((i) => {
    const v = camel(i.name);
    const setter = `set${cap(v)}`;
    if (i.type === "select") {
      const opts = (i.options ?? [])
        .map((o) => `            <option value="${o}">{t("option.${o}")}</option>`)
        .join("\n");
      return `        <label className="block">
          <span className="text-sm font-medium">{t("${i.label_key ?? `input.${i.name}`}")}</span>
          <select value={${v}} onChange={(e) => ${setter}(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
${opts}
          </select>
        </label>`;
    }
    const mode = i.type === "number" ? ' inputMode="decimal"' : "";
    return `        <label className="block">
          <span className="text-sm font-medium">{t("${i.label_key ?? `input.${i.name}`}")}</span>
          <input${mode} value={${v}} onChange={(e) => ${setter}(e.target.value)} placeholder="${i.placeholder ?? ""}" className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
        </label>`;
  })
  .join("\n");
const numericInputs = inputs.filter((i) => i.type === "number").map((i) => camel(i.name));
const guard = numericInputs.length
  ? numericInputs.map((n) => `!isFinite(parseFloat(${n}))`).join(" || ")
  : "false";

queue(
  path.join(SITE, "src/tools", slug, "Component.tsx"),
  `"use client";

import { useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";

export default function ${cap(varName)}() {
  const t = useTranslations("tools.${slug}");
  const locale = useLocale();
${stateLines}

  const result = useMemo(() => {
    if (${guard}) return null;
    // TODO(${slug}): implement per spec.logic
    //   ${(spec.logic ?? "").split("\n").join("\n    //   ")}
    return null as number | string | null;
  }, [${numericInputs.join(", ")}${numericInputs.length ? "" : ""}]);

  const fmt = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }), [locale]);

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
${fields}
      </div>
      <div className="mt-6 rounded-lg bg-brand-50 p-4 dark:bg-slate-800">
        {result === null ? (
          <p className="text-slate-600 dark:text-slate-400">{t("result.empty")}</p>
        ) : (
          <p className="text-2xl font-bold">
            {t("result.label")}: {typeof result === "number" ? fmt.format(result) : result}
          </p>
        )}
      </div>
    </div>
  );
}
`,
);

// ---- messages: en filled from spec, others seeded as en copies ----
const optionKeys = {};
for (const i of inputs) for (const o of i.options ?? []) optionKeys[o] = o;
const inputLabels = {};
for (const i of inputs) inputLabels[i.name] = i.name;

const enMsg = {
  title: pk.en ?? slug,
  shortDescription: `${pk.en ?? slug} — instant browser-based calculation.`,
  description: `${pk.en ?? slug}. Works entirely in your browser — no signup, no data sent to a server.`,
  metaDescription: `Free online ${pk.en ?? slug}. Fast, accurate, and private — runs entirely in your browser with no signup. Get your result instantly.`,
  keywords: [pk.en ?? slug, `${spec.category} tool`, "free online tool"],
  input: inputLabels,
  ...(Object.keys(optionKeys).length ? { option: optionKeys } : {}),
  result: { label: "Result", empty: "Enter values to see the result." },
  article: {
    sections: [
      { heading: "TODO heading 1", paragraphs: ["TODO: long-form paragraph (filled by 02_seo + 03_translate)."] },
      { heading: "TODO heading 2", paragraphs: ["TODO: long-form paragraph."] },
    ],
    howTo: [{ name: "TODO step", text: "TODO step text." }],
  },
  faq: Array.from({ length: 5 }, (_, i) => ({ q: `TODO question ${i + 1}?`, a: `TODO answer ${i + 1}.` })),
};

// Guard: next-intl resolves keys by splitting on ".", so a key literally
// containing "." (at any nesting level) silently MISSES in every locale and
// ships a broken tool UI. Refuse to emit such a structure.
// See memory: toolify-i18n-flat-key-bug.
function assertNoDottedKeys(obj, trail = "") {
  if (!obj || typeof obj !== "object") return;
  for (const [k, v] of Object.entries(obj)) {
    if (k.includes(".")) {
      console.error(`error: dotted i18n key "${trail}${k}" — next-intl cannot resolve it (use nested objects, not flat dotted keys).`);
      process.exit(1);
    }
    if (v && typeof v === "object" && !Array.isArray(v)) assertNoDottedKeys(v, `${trail}${k}.`);
  }
}
assertNoDottedKeys(enMsg);

for (const loc of ACTIVE) {
  queue(
    path.join(SITE, "src/tools", slug, "messages", `${loc}.json`),
    JSON.stringify(enMsg, null, 2) + "\n",
  );
}

// ---- registry.ts edit ----
const registryPath = path.join(SITE, "src/lib/tools/registry.ts");
let registry = fs.readFileSync(registryPath, "utf8");
let registryChanged = false;
if (!registry.includes(`@/tools/${slug}"`)) {
  // insert import after the last `import ... from "@/tools/..."` line
  const importLine = `import ${varName} from "@/tools/${slug}";`;
  const lastImport = [...registry.matchAll(/^import .* from "@\/tools\/.*";$/gm)].pop();
  if (lastImport) {
    const idx = lastImport.index + lastImport[0].length;
    registry = registry.slice(0, idx) + "\n" + importLine + registry.slice(idx);
  }
  // insert into the TOOLS array, before the closing `];`
  registry = registry.replace(/(\n)(\];\s*\n\s*const SLUG_INDEX)/, `$1  ${varName},\n$2`);
  registryChanged = true;
}

function cap(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ---- apply ----
console.log(`scaffold: ${slug}  (locales: ${ACTIVE.length}, var: ${varName})`);
for (const w of writes) {
  console.log(`  ${dry ? "would write" : "write"}  ${path.relative(ROOT, w.file)}`);
  if (!dry) {
    fs.mkdirSync(path.dirname(w.file), { recursive: true });
    fs.writeFileSync(w.file, w.content);
  }
}
console.log(`  ${registryChanged ? (dry ? "would register" : "register") : "already registered"}  src/lib/tools/registry.ts`);
if (!dry && registryChanged) fs.writeFileSync(registryPath, registry);

console.log(
  dry
    ? "\n(dry run — no files written)"
    : `\n✓ scaffolded (noindex by default — NOT added to INDEXED_SLUGS). Next: fill logic in Component.tsx, then run 02_seo + 03_translate, then \`cd site && npm run validate\`.\n  ⚠️ Velocity freeze: only add this slug to INDEXED_SLUGS once it has genuine differentiating value (AdSense remediation).`,
);
