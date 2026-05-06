# Prompt 01 — Implement tool component

You are extending the Toolify codebase. Read the YAML spec at
`pipeline/specs/<slug>.yaml`, then create the following files:

1. `site/src/tools/<slug>/Component.tsx` — a `"use client"` React component
   - Must use `useTranslations(\`tools.<slug>\`)` for all user-facing strings
   - Must use `useLocale()` and `Intl.NumberFormat` / `Intl.DateTimeFormat` for locale-aware formatting
   - Must include `aria-live="polite"` on the result region
   - Must NOT call any network APIs — pure client computation only
   - Must handle invalid input by returning null (do NOT throw)
   - Use Tailwind utility classes following the patterns in existing tools (bmi-calculator)

2. `site/src/tools/<slug>/index.ts` — exports a `ToolDefinition`
   - Use `updatedAt: <today's ISO date>`
   - Set `hasHowTo` and `hasFaq` to true unless spec says otherwise
   - `related` from spec (verify the slugs exist in registry.ts)

3. Add the import + entry to `site/src/lib/tools/registry.ts` `TOOLS` array.

After generation, run `pnpm validate` (or `npx tsx scripts/validate.ts`) and fix any issues.

Reference the existing tools as templates:
- `site/src/tools/bmi-calculator/Component.tsx` — toggle + 2 inputs + categorized output
- `site/src/tools/length-converter/Component.tsx` — 1 input + 2 selects + all-units panel
- `site/src/tools/age-calculator/Component.tsx` — 2 dates + structured multi-field output
