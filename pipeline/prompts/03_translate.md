# Prompt 03 — Translate to target locale

Given the canonical English file
`site/src/tools/<slug>/messages/en.json`, generate
`site/src/tools/<slug>/messages/<locale>.json` with the same key structure.

Translation principles:
1. **Localize, don't translate.** SEO titles and metaDescriptions should be
   optimized for what users in the target language actually search for —
   not literal translations of the English.
2. **Use locale-appropriate examples.** If the English mentions "143 lb",
   the JA version should use "65 kg"; the DE version should use "65 kg"; the FR
   version should use "65 kg" — use the unit familiar to that locale.
3. **Use locale-appropriate authorities.** English version cites WHO/CDC; JA
   version should cite WHO + 厚生労働省 + 日本肥満学会; DE → RKI; etc.
4. **Match register.** Keep the same level of formality (polite-neutral for
   most tools).
5. **Preserve numbers, formulas, and proper nouns** exactly.
6. **Don't translate brand names** ({siteConfig.name} stays as-is).
7. **FAQ questions should reflect what users in that language actually ask** —
   not direct translations. e.g., the JA version of "how old am I" calculator
   should include 数え年/満年齢 distinction; the EN version doesn't.

Validate with: `npx tsx scripts/audit-i18n.ts` (must show 0 missing keys).
