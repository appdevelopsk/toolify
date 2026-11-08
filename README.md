# Toolify365 — free browser tools

[Open Toolify365](https://toolify365.com/en) · [日本語](https://toolify365.com/ja)

Toolify365 provides **223 free tools** (calculators, converters and text/data utilities) in **17 interface languages**. Tools are accessible without creating an account. Many calculations run directly in the browser; tool-specific privacy notes and sharing behavior apply.

### What you can do

- **Plan dates:** calculate date differences, business days and time zones.
- **Compare purchases:** discount, sales tax and unit price calculators.
- **Work with text:** word counting, case conversion and URL slugs.
- **Clean data:** CSV/JSON conversion, JSON formatting and YAML output.

A new **guided workflows** prototype connects these existing tools into four three-step journeys. Its source is on a review branch and **is not deployed** until the full manual release gate and mobile QA pass.

### Privacy and measurement

The site uses GA4 consent handling and optional result sharing. The **review-only** implementation does not place tool inputs in the browser URL as a user types. “Copy result link” creates a fragment-based `#s=` URL, retains only validated `wf`/`ws` workflow context, and removes unrelated query parameters (including IDs and tokens). Older `?s=` links still restore. Fragments are not sent in HTTP requests but remain visible to page scripts and recipients; **never share secrets**. GA4 sends path-only page URLs. Clarity is disabled by default unless its privacy review is explicitly approved. This branch is **not deployed** until the full manual release gate passes.

### Developer overview

Next.js 15 + React 19 + next-intl + TypeScript. The repository contains website source, localization, SEO audits and manual deployment scripts.


## Quick start

```bash
cd site
npm install
npm run dev
# → http://localhost:3000  (redirects to /en or /ja)
```

## Project structure

- `site/` — Next.js application
- `pipeline/` — YAML specs and Claude prompts for mass-producing new tools
- `docs/` — architecture / AdSense setup / tool pipeline guides
- `CLAUDE.md` — operating rules (read first)

## Adding a new tool

1. Copy `pipeline/specs/_template.yaml` to `pipeline/specs/<slug>.yaml` and fill in
2. In Claude Code, follow `pipeline/prompts/01_implement.md`, `02_seo.md`, `03_translate.md` in order
3. `cd site && npm run validate && npm run build`

## Analytics: GA4 `calculate` ranking

Tool usage events (`calculate`, `copy_result`, `preset_click`) carry the params
`tool_slug`, `locale`, `category` (plus legacy `tool`). To report on them:

1. GA4 Admin > Data display > Custom definitions: register **event-scoped custom
   dimensions** `tool_slug`, `locale`, `category` (event parameter names identical).
   Data is only collected from the registration date onwards.
2. Grant the service account *Viewer* on the GA4 property, then:

```bash
cd site
GA4_PROPERTY_ID=123456789 GOOGLE_APPLICATION_CREDENTIALS=/path/sa.json \
  npm run report:calculate -- --days 28 --limit 50   # --by category | --json
```

## Documentation

- [ARCHITECTURE.md](./docs/ARCHITECTURE.md)
- [ADSENSE_SETUP.md](./docs/ADSENSE_SETUP.md)
- [TOOL_PIPELINE.md](./docs/TOOL_PIPELINE.md)
