# Nattzy topic #149 referral CTA — public release check (2026-11-11)

The blog-outline prompt has a curated Nattzy topic link. Its first implementation was visible only after a very long prompt/example/FAQ. PR #57 moved that **same, single** link to just below the page description in source. The public English page was still rendering the old bottom placement when checked on Nov 11.

## Operator commands (read-only)

```bash
cd site
npm run test:nattzy-cta
npm run audit:nattzy-cta
node scripts/check-nattzy-cta.mjs https://toolify365.com/es/prompts/blog-outline
```

The smoke check fetches **only the specified public page** and fails if:
- HTTP is not successful, content is not HTML, or the page redirects elsewhere;
- the public Nattzy topic #149 URL appears zero times or more than once among actual HTML anchors;
- the CTA lacks `utm_source=toolify365&utm_medium=editorial&utm_campaign=prompt_discussion`;
- the CTA appears **after** the long rendered prompt `<pre>` content, or the prompt itself is missing.

Comments, scripts, styles, templates and noscript contents are excluded from anchor detection. Links inside `data-href` do not count. No Google Analytics tokens, cookies, API keys, personal data, production writes, notifications or auto-deployment.

## Expected rollout interpretation

- As of the 2026-11-11 public check, the English CTA was still after "Comments & questions"; the **new** placement was **not verified deployed**.
- A green `test:nattzy-cta` proves only deterministic logic against fixtures.
- A green `audit:nattzy-cta` proves the specified public page has the expected **placement at that instant**, **not** that users saw, clicked, or registered.
- The prompt page currently sets `noindex: true` intentionally; this acquisition path is for visitors already on Toolify, **not direct organic search growth from this prompt URL**. Do not change the site's index policy without GSC evidence.
- Validate the deployed page manually at mobile viewport, RTL and EN/ES/JA labels, including keyboard and actual click behavior.
- For qualified acquisition evidence, obtain consent-compliant, bot-filtered analytics at Nattzy and attribute the campaign, exclude staff, then observe real two-topic navigation and authentic replies. No baseline or uplift is currently established.

Do not treat a source merge as a deployment.