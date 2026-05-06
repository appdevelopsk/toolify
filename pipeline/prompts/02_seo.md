# Prompt 02 — Generate English SEO content

Read `pipeline/specs/<slug>.yaml`. Create
`site/src/tools/<slug>/messages/en.json` matching the schema below.

Quality rules (these are what keep the page from being penalized by HCU):
- Title: 30-60 chars. Include the primary keyword and a parenthetical scope (e.g., "(metric/imperial)")
- shortDescription: 80-130 chars, conversational, action-oriented
- description: 130-200 chars, what the user gets + privacy reassurance
- metaDescription: 110-160 chars, optimized for SERP click-through
- keywords: 4-7 long-tail variants the user might actually type
- article.sections: 3 sections, each 2-3 paragraphs of 60-120 words
  - Avoid generic "in conclusion" / "furthermore" patterns
  - Include at least one specific number, formula, or historical fact per section
  - Include real authoritative sources (WHO, NIST, CDC, etc.) where applicable
- article.howTo: 3-5 numbered steps, imperative voice, ≤25 words each
- faq: 8 entries minimum
  - Cover: accuracy, privacy, edge cases, common confusions, "how often", "what about X"
  - Answers 1-2 sentences, end with concrete actionable info

Then duplicate the file structure (with placeholder values) for each locale in
`spec.locales`. Translation step is handled separately by prompt 03.
