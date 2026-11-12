# Toolify365 — Free Online Calculators, Converters & Developer Utilities

**Try Toolify365:** https://toolify365.com/en — free browser-based tools, with no account required.

Find the right tool for a specific task rather than installing an app or creating a login. The live site has **17 language interfaces**. Search engine indexing is intentionally limited to selected localized pages; not every translated page is intended to appear in search.

## Start with a tool

| Task | Open |
| --- | --- |
| Format or validate JSON | [JSON Formatter](https://toolify365.com/en/tools/json-formatter) |
| Compare time zones for meetings | [Timezone Converter](https://toolify365.com/en/tools/timezone-converter) |
| Count words and estimate reading time | [Word Counter](https://toolify365.com/en/tools/word-counter) |
| Compare unit prices | [Unit Price Calculator](https://toolify365.com/en/tools/unit-price-calculator) |
| Resize images in your browser | [Image Resizer](https://toolify365.com/en/tools/image-resizer) |
| Explore all tools by category | [All Tools](https://toolify365.com/en/tools) |

Each tool has a direct URL that you can bookmark or share. Individual tools may have their own data-handling and browser requirements; check the on-page guidance before entering sensitive content.

## For developers and site owners

- Pick a tool matching your users' task and link to that individual tool page.
- Some tool pages offer an optional embed snippet. Keep attribution transparent and follow your site's link policies.
- Feedback and bug reports are welcome through GitHub issues. Please include tool slug, language, device, and reproducible steps; do not paste passwords or sensitive input data.
- This repository powers the public site; public visibility alone should not be interpreted as permission to redistribute its source. Check the repository license before reuse.

## Implementation

Multilingual, ad-supported tools site built with Next.js 15, AdSense and next-intl. The development and analytics instructions follow.

---

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
