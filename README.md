# Toolify (web_advertisement)

Multilingual, ad-supported online tools site — Next.js 15 + AdSense + next-intl.

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
