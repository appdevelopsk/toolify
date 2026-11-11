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
## Indexed timezone-converter follow-up — 2026-11-11

The **index-allowlisted** timezone tool has a separate contextual CTA to existing Nattzy remote-work topic **#147**. This is a more plausible organic reader entry point than the deliberately `noindex` prompt page, but qualified referrals still require measurement.

Run after **actual site build + deploy**:

```bash
cd site
npm run test:nattzy-cta
npm run audit:nattzy-cta
npm run audit:nattzy-timezone
node scripts/check-nattzy-cta.mjs --timezone https://toolify365.com/ja/tools/timezone-converter
```

Timezone check requires exactly one link to existing topic #147, the source/medium/`remote_work_timezone` campaign, a rendered tool workspace before the link, and the long explanatory prose below the link. It rejects wrong origin, duplicate/missing targets, missing workspace, bad redirects and non-HTML status. The link is still only an optional discussion invitation, **not** a measurement of registrations, answers or retention.

**Read-only public observations on Nov 11:** English blog-outline prompt now **does show** the contextual Nattzy link directly after the intro and before its prompt text (earlier snapshots with the CTA near Comments are superseded). English timezone tool still **does not show** the new topic #147 CTA. Public `/api/release` and FXEA365 article/API were inaccessible via the current retrieval environment; they must be checked from the authorized server/browser and must not be called 404/outages based on this limitation.

**Hosting architecture from repository source:** Toolify's `.github/workflows/deploy.yml` builds and deploys via SSH/rsync to a VPS/PM2, with a shared deploy lock to prevent mixed builds. Actions were previously reported disabled. **Do not** bypass the VPS lock or trigger a parallel raw rsync; the operator must use its approved current pipeline, run typecheck/whole-suite/build and confirm a successful release SHA before invoking live CTA smoke checks. FXEA has a separate local prebuilt deploy procedure; old `scripts/deploy_vps.sh` explicitly says not to use it, so do not run that retired method.

These gates are read-only. A source merge or passing unit tests is not proof of deployment or user uplift.
