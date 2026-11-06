# PR #39 verification, 2026-11-05

## Confirmed
- Current main-to-feature comparison checked through GitHub connector.
- Local isolated `tsc --strict --noEmit` passed for `scenario-comparison.ts`, `scenario-resume.ts`, and `recent-recommendations.ts`.
- Local Node assertion harness passed 29 assertions for the same pure modules.
- Additional Vitest cases for invalid draft timestamps added to the PR.
- Public English percentage page currently renders the original calculator but not the new A/B and resume controls.

## Still blocking release
- Local `git ls-remote` could not resolve github.com, so a full repository checkout was unavailable.
- Full `npm ci`, project Vitest, app-wide TypeScript checks, Next.js build, browser/mobile QA, and GA4 DebugView were not performed.
- No GitHub Actions, PR merge, VPS deploy, or verified engagement uplift.

## Next required action
In an owner-accessible checkout run `bash scripts/check-engagement-release.sh`, then test English/Japanese desktop and mobile, blocked storage, expired draft, URL share, keyboard accessibility and consent. Merge and deploy only after all gates pass; measure 7/28-day GA4 engagement.

This file is a checkpoint, not a passing full-release certificate.

## Follow-up verification
- Rechecked local Git access: DNS resolution of github.com still fails.
- Re-ran isolated TypeScript strict compilation and 29 independent assertions: passed. This is not the app-wide build.
- Added maxLength=40 to both percentage number inputs to match URL restore and saved draft limits.
- English production page inspected: new compare and resume sections not found in fetched HTML.
- No merge, deployment, or verified engagement uplift.

## Shared-link restore hardening (2026-11-05)
- Added `scenario-share.ts` and `scenario-share.test.ts` to reject incomplete, malformed, oversized, and non-calculable URL payloads as a whole. Calculator fields are no longer partially restored from an invalid `?s=` payload.
- In the isolated local TypeScript harness, all four pure source modules passed strict checking. The existing 29 assertions and nine new share-state assertions passed (38 total). This is not a full repository Vitest run or Next.js build.
- No GitHub Actions, production deployment, or verified engagement uplift.

## 2026-11-05 — Related/recent navigation deduplication
- Updated recent recommendation selection to omit slugs already present in the existing related-tools section. This avoids using the same screen real estate for duplicate destinations.
- Added test cases for overlap and validated six cases with standalone Node assertions and TypeScript strict compilation. This is not a full React or Next build.
- HYPD live-browser and mobile Lighthouse audits could not run: the linked service reported the tools unavailable on the current plan. No external mobile performance score or rendered DOM result was obtained.
- Main merge and production deployment remain blocked by full-build/device verification, and no improvement in GA4 engagement has been measured.

## Security-focused share URL regression (2026-11-05)
- Generic share-state collection excludes password and hidden input types, in addition to file and action-only controls; the policy is centralized in share-input-policy.ts.
- Both generic read and write are capped at 1800 encoded characters; the manual hook is capped at 4096 encoded characters in both directions. Oversized external payloads are rejected before decoding.
- Added share-input-policy.test.ts; independently compiled this exact pure policy source with strict TypeScript and executed 18 standalone Node assertions, all passed. Full project Vitest/build and interactive browser QA remain pending.
- Privacy caveat: other generic input values may still enter a shareable URL. Never describe all tool inputs as local-only or claim privacy audit completion.
- Before release, test older ordinary shared links, password/hidden inputs, history navigation, copy-result-link availability, consent and mobile behavior. No rollout or engagement gain verified.

## PII-oriented generic sharing guard (2026-11-05)
- Automatic share URL collection now excludes email and telephone input types in addition to passwords/hidden controls.
- It also rejects fields explicitly marked `data-private` or `data-share="off"`, and browser autofill fields such as name, address, postal code, date of birth, account username and payment card tokens (for inputs, selects and textareas).
- Added `share-input-policy.integration.test.ts` alongside policy unit tests. New source verified via GitHub readback. A reconstructed local copy of the pure `share-input-policy.ts` passed strict TypeScript compilation and **36 independent Node assertions**. The new Vitest source was **not** run as a full project test.
- Corrected both sharing hook comments: state placed in `?s=` is **not strictly device-local**; URL history, HTTP requests, copied links and referrers can expose it. Arbitrary remaining free-text values are not guaranteed non-sensitive; a tool-by-tool privacy assessment remains required before release.
- Run the full local release gate, plus manual tests that standard numeric sharing still works, sensitive autofilled values never enter `?s=`, older links open acceptably, and no analytics payload includes entered values.

## 2026-11-06 security follow-up
- Fixed auto-sharing privacy exclusions to respect data-private or data-share="off" on enclosing field groups, not just on the input itself.
- Updated share-input-policy.integration.test.ts to assert the ancestor exclusion selector. GitHub readback confirmed the change.
- Full local test/build remains unavailable in the present execution environment; this update is not evidence of successful production deployment or GA4 uplift.

## 2026-11-06: release blocker re-evaluation
- Verified every npm script invoked by `scripts/check-engagement-release.sh` exists in `site/package.json`. This establishes script-name consistency only; it does **not** execute the scripts.
- Six connector-readback consistency checks passed for release script names, ancestor privacy guard, input/textarea/select exclusion, URL length limits, lack of ShareBar polling and navigation-before-ad order.
- Fixed a fragile string-escaping expectation in `share-input-policy.integration.test.ts`.
- The generic URL restore path now ignores decoded field values unless they are strings or booleans, and skips non-integer or out-of-bounds mode button indices. Added source regression checks.
- `git ls-remote` still cannot resolve github.com in the working container, preventing a full checkout and project-level npm ci, Vitest, Next build and browser QA.
- Remains **NO-GO** until a full owner-accessible checkout passes all tests, browser/privacy/analytics checks, and an explicit production deploy. No live engagement improvement measured.

## 2026-11-06 — URL-driven button activation risk
- Identified that auto-shared URLs previously could trigger clicks on arbitrary tool buttons by index, not just mode controls.
- Limited URL replay and recording of mode-button indices to sibling groups with at least two buttons and an existing active-mode styling marker; disabled and in-form submit controls cannot be replayed.
- Preserved triangle-calculator's non-form mode buttons, which have browser-default submit type but are not form submission controls.
- Added a source regression assertion in `share-input-policy.integration.test.ts`. GitHub readback confirmed code and test source; the project Vitest suite and browser QA **have not run**.
- Remaining test: valid triangle right/sss/sas links, malicious links pointing to action buttons, mode toggles, alternate tools with button-driven modes, mobile UI and sharing result links.
- Release stays NO-GO until the owner-accessible full build and manual QA pass. No performance or revenue lift has been demonstrated.

## 2026-11-06 — Search-index localization and payload hardening
- `useSearchIndex` now keys fetched data by the requested locale and returns null while an index for the new locale is loading, rather than displaying stale-language titles.
- Extracted malformed search-index response handling into `site/src/lib/search/search-index-payload.ts`. Missing arrays and malformed entries are ignored; valid tool entries are preserved.
- Added unit tests for parsed payloads plus a source-level regression test for locale-scoped display. Reconstructed the exact parser in a standalone local TypeScript harness with a minimal type stub: strict compilation and 10 Node assertions passed.
- This is not a full Next.js app compile or UI-level language-switch test. No GitHub Actions, merge or deployment were performed.
- Full-repo checkout remains blocked by DNS from this container, confirmed again. Run `bash scripts/check-engagement-release.sh` in the owner environment and verify locale switches in browser before release.

## 2026-11-06 — Search index link validation
- Strengthened the localized search-index parser used by recent-tool navigation: accept only hyphenated ASCII tool slugs (max 100 chars), known tool categories, nonempty localized titles (max 200 chars); drop duplicate slugs.
- Reject malformed path traversal, percent-encoded separators, unknown categories and oversized titles without hiding valid tool suggestions.
- Expanded `search-index-payload.test.ts` for malformed URL targets, duplicate slugs, and title/category validation.
- Reconstructed the exact pure parser in an isolated local TypeScript harness with a minimal compatible SearchItem type stub. `tsc --strict` passed and 15 Node assertions passed.
- **These are isolated checks, not the full repository Vitest/Next build**. No production deployment, mobile QA, or GA4 engagement uplift verified.
- Next gate: full checkout and `bash scripts/check-engagement-release.sh`, then check actual en/ja locale switching and malformed index behavior on mobile.

## 2026-11-06 — Next.js history state preservation
- Fixed both `useShareableState` and `useAutoShareableState`: share URL updates now call `history.replaceState(history.state, "", url)` rather than replacing the history state with `null`.
- This preserves the client router's pre-existing navigation state when adding/updating `?s=`. Avoid interpreting it as a verified navigation fix until tested in a browser.
- Updated ShareBar.events.test.ts to assert preserved history state and reject the old null-overwrite pattern.
- Read back both GitHub hook files and the test. Both hooks contain the new call and still dispatch share-state-change; neither retains the previous null overwrite.
- Remaining manual QA: edit inputs, use back/forward, switch locale and tools through client navigation, restore shared links after BFCache return and confirm no hydration/router errors.
- Source changes and static readback are verified. **Full Vitest, Next production build, real browser QA, merge and deploy are still pending.**

## 2026-11-06 — Test fixture correction and isolated verification
- Found misleading `search-index-payload.test.ts` malformed fixture: `slug: "s"` is structurally valid under the new parser; the fixture also lacked a title, masking the invalid-slug assumption. Replaced it with a genuinely unsafe path `../unsafe` plus a valid title so that exclusion is specifically attributable to the slug format.
- Added a separate regression case that explicitly preserves a valid one-character slug; this checks that the validator is not over-restrictive.
- Reproduced the parser logic in an isolated local TypeScript harness with a minimal compatible SearchItem type definition; `tsc --strict` passed and 10 grouped Node assertions passed, including normal, invalid, duplicate and short-slug scenarios. This is NOT a run of project Vitest or Next build.
- Git CLI still cannot resolve github.com in the execution environment; continue requiring owner-accessible `bash scripts/check-engagement-release.sh`, browser QA and reviewed deployment before merging PR #39.

## 2026-11-06 — GA4 synthetic restore measurement correction
- `ToolInteractionTracker.tsx` now ignores untrusted DOM input/change and click events when tracking `calculate`, `copy_result`, and `preset_click`. Auto shared-URL restore uses programmatic events and `.click()`, so those should not count as actual user engagement.
- Added `ToolInteractionTracker.trust.test.ts` to assert that the user-event boundary and event subscriptions remain in place.
- GitHub readback confirms 5 source consistency checks (trusted input/click guards, listener registration, synthetic restore dispatch and test assertions) passed. **This is static readback, not running Vitest, a browser, or a GA4 debugging session.**
- Browser acceptance: load an auto-shared URL, confirm no `calculate`/preset/copy event before user action; change a field manually and confirm one `calculate`; check consent denied/granted modes; verify no analytics values include user input.
- Release remains NO-GO pending full tests/build and manual owner QA, without GitHub Actions.

## 2026-11-06 — Client-side route transitions and delayed GA4 events
- `ToolInteractionTracker` now resets one-shot `calculate` / `copy_result` / `preset_click` flags whenever the effect is recreated for a changed tool slug, locale or category. This avoids carrying dedup state from an earlier client-side route.
- Cancelled the delayed 50 ms calculation event on unmount and added a disposed guard. Without this, a queued timer could send an event after a tool was left.
- Added a corresponding `ToolInteractionTracker.trust.test.ts` source regression case and confirmed five source consistency checks by GitHub readback.
- This static verification is NOT a real Vitest run or GA4 DebugView test. Browser acceptance still needs navigate tool A → B without a full reload, operate B and verify its first calculate, then leave before the pending event and verify no late analytics event.
- Release stays draft/NO-GO; no full Next build, review, deployment or observed revenue/engagement improvement.

## 2026-11-06 — Name/id-based sensitive input protection
- Auto-generated `?s=` state formerly inspected input type, browser autocomplete and opt-out attributes, but did not check developer-assigned field `name` or `id`. Added an optional identifier parameter in `share-input-policy.ts` and wired `name` + `id` for input, textarea and select.
- Filters credential/personal-data hint names including `apiKey`, `privateKey`, `refresh_token`, `creditCard`, `cardNumber`, `billingEmail`, `contactPhone`, and `postalCode`; camelCase is normalized. Regular numeric field identifiers such as `amount`, `valueA`, `angleC` remain eligible.
- Added unit and integration test assertions. GitHub readback verifies the new source and test wiring. Reused the exact source pattern in a JavaScript regex check: **17 identifier cases passed** (12 excluded, 5 allowed). This check is limited to identifier matching, not full Vitest/React/Next behavior.
- Remaining risk: arbitrary free-text can still contain sensitive content even without sensitive field names. Full tool-by-tool privacy review remains a release blocker. Real browser/GA4/consent checks and full `bash scripts/check-engagement-release.sh` are not complete.
