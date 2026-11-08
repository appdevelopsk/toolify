import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { WORKFLOWS, getWorkflowContext, getWorkflowContinuation } from "../../site/src/lib/workflows/steps.ts";
import { sanitizeOutboundLinkUrl, sanitizePageReferrer, sanitizePageViewUrl } from "../../site/src/lib/analytics/pageview-url.ts";
import { verifyWorkflowPath } from "../verify-manual-deploy.mjs";
import { canLoadClarity } from "../../site/src/lib/analytics/clarity-policy.ts";
import { ALL_LOCALES } from "../../site/src/lib/i18n/locales.ts";
import { shouldLoadImpactTracking } from "../../site/src/lib/analytics/impact-policy.ts";
import {
  RESULT_LINK_REQUEST, classifyRestoredShareChange, readResultShareState, createResultShareLink,
  migrateLegacyShareQuery, clearStaleResultShareState,
} from "../../site/src/lib/hooks/result-share-link.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");
const source = (path) => readFileSync(join(ROOT, path), "utf8");
const sourceFile = source;

test("all 17 localized homepage privacy claims explain optional result links", () => {
  const tokens = {
    en: "Result links", ja: "結果リンク",
    "zh-CN": "结果分享链接", "zh-TW": "結果分享連結",
    ko: "결과 공유 링크", es: "Los enlaces de resultados",
    "pt-BR": "Links de resultados", fr: "Les liens de résultat",
    de: "Ergebnislinks", it: "I link ai risultati",
    ru: "Ссылки на результаты", ar: "روابط النتائج",
    hi: "परिणाम के लिंक", id: "Tautan hasil",
    th: "ลิงก์ผลลัพธ์", vi: "Liên kết kết quả",
    tr: "Sonuç bağlantıları",
  };
  assert.equal(ALL_LOCALES.length, 17);
  assert.deepEqual([...ALL_LOCALES].sort(), Object.keys(tokens).sort());
  for (const locale of ALL_LOCALES) {
    const home = JSON.parse(source(`site/src/messages/${locale}.json`)).home;
    assert.ok(home.subheading.length >= 20, `${locale}: subheading`);
    assert.ok(home.whyPrivacyTitle.length >= 4, `${locale}: title`);
    assert.ok(home.whyPrivacyText.length >= 30, `${locale}: body`);
    assert.ok(home.whyPrivacyText.includes(tokens[locale]), `${locale}: sharing caveat`);
  }
});

test("12 real, distinct curated steps have exact next-step mappings", () => {
  assert.equal(WORKFLOWS.length, 4);
  const slugs = new Set();
  for (const flow of WORKFLOWS) {
    assert.equal(flow.tools.length, 3);
    flow.tools.forEach((slug, i) => {
      assert.match(slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      assert.equal(slugs.has(slug), false);
      slugs.add(slug);
      const expected = i < 2
        ? { workflow: flow.id, nextSlug: flow.tools[i + 1], nextStep: i + 2 }
        : undefined;
      assert.deepEqual(getWorkflowContinuation(slug), expected);
      assert.deepEqual(getWorkflowContext(`?wf=${flow.id}&ws=${i + 1}`, slug),
        { workflow: flow.id, step: i + 1 });
      assert.equal(getWorkflowContext(`?wf=${flow.id}&ws=${i + 1}`, "unknown-tool"), undefined);
    });
  }
  assert.equal(slugs.size, 12);
  assert.equal(getWorkflowContinuation("unknown-tool"), undefined);
});

test("workflow query rejects tampering and duplicates", () => {
  const bad = [
    "?wf=data&ws=999", "?wf=data&ws=0",
    "?wf=data&wf=writing&ws=1", "?wf=data&ws=1&ws=2",
    "?wf=__proto__&ws=1", "?wf=data&ws=1.0"
  ];
  for (const query of bad)
    assert.equal(getWorkflowContext(query, "csv-json-converter"), undefined);
});

test("GA4 page identity excludes query and hash but retains the locale route", () => {
  assert.deepEqual(sanitizePageViewUrl(
    "https://toolify365.com/ja/tools/word-counter?wf=writing&ws=1&s=private-input#result"
  ), {
    page_path: "/ja/tools/word-counter",
    page_location: "https://toolify365.com/ja/tools/word-counter"
  });
  assert.deepEqual(sanitizePageViewUrl("http://localhost:3000/ar?x=1"), {
    page_path: "/ar",
    page_location: "http://localhost:3000/ar"
  });
});

test("GA4 referrer sanitizer preserves usable attribution without user input", () => {
  assert.equal(sanitizePageReferrer(
    "https://toolify365.com/en/tools/word-counter?s=private&wf=writing#result",
    "https://toolify365.com/en/tools/slug-generator",
  ), "https://toolify365.com/en/tools/word-counter");
  assert.equal(sanitizePageReferrer(
    "https://partner.example/private/jane@example.com?token=secret",
    "https://toolify365.com/en",
  ), "https://partner.example");
  for (const invalid of ["", "not-a-url", "javascript:alert(1)", "about:blank"]) {
    assert.equal(sanitizePageReferrer(invalid, "https://toolify365.com/en"), "");
  }
});

test("affiliate analytics strips URL queries and ignores synthetic link clicks", () => {
  assert.equal(sanitizeOutboundLinkUrl(
    "https://partner.example/tools?clickref=private-uid#promotion"
  ), "https://partner.example/tools");
  for (const invalid of ["", "/relative", "javascript:alert(1)"]) {
    assert.equal(sanitizeOutboundLinkUrl(invalid), "");
  }
  const events = source("site/src/lib/analytics/events.ts");
  const tracker = source("site/src/lib/analytics/affiliate-click.tsx");
  assert.ok(events.includes("link_url: sanitizeOutboundLinkUrl(p.link_url)"));
  assert.ok(tracker.includes("if (!e.isTrusted) return"));
});

test("manual result sharing never exposes state in URL queries or history on input", () => {
  const raw = "YWJjMTIz";
  const base = "https://toolify365.com/ja/tools/bmi-calculator?wf=data&ws=1&s=OLD";
  const newLink = createResultShareLink(base, raw, 1800);
  assert.equal(newLink,
    "https://toolify365.com/ja/tools/bmi-calculator?wf=data&ws=1#s=YWJjMTIz");
  assert.equal(readResultShareState(newLink), raw);
  assert.equal(readResultShareState(base), "OLD");
  assert.equal(migrateLegacyShareQuery(base),
    "https://toolify365.com/ja/tools/bmi-calculator?wf=data&ws=1#s=OLD");
  assert.equal(clearStaleResultShareState(newLink),
    "https://toolify365.com/ja/tools/bmi-calculator?wf=data&ws=1");
  const privateLink = createResultShareLink(
    "https://toolify365.com/ja/tools/bmi-calculator?token=SECRET&email=user%40example.com&wf=data&ws=1",
    raw, 1800,
  );
  assert.equal(privateLink, "https://toolify365.com/ja/tools/bmi-calculator?wf=data&ws=1#s=YWJjMTIz");
  for (const bad of ["?wf=data&ws=9", "?wf=data&ws=1&ws=2", "?token=SECRET"]) {
    assert.equal(createResultShareLink("https://toolify365.com/en/tools/word-counter" + bad, raw, 1800),
      "https://toolify365.com/en/tools/word-counter#s=YWJjMTIz");
  }
  for (const invalid of ["", "ABC+", "A/B", "A=B", "tool input"]) {
    assert.equal(createResultShareLink(base, invalid, 1800), null);
  }
  for (const unsafe of [
    "javascript:alert(1)",
    "data:text/html,payload",
    "mailto:secret@example.com",
    "https://user:pass@toolify365.com/ja/tools/bmi-calculator",
    "not a URL",
  ]) {
    assert.equal(createResultShareLink(unsafe, raw, 1800), null);
  }

  const generic = source("site/src/lib/hooks/useAutoShareableState.ts");
  const manual = source("site/src/lib/hooks/useShareableState.ts");
  const bar = source("site/src/components/tools/ShareBar.tsx");
  assert.equal(RESULT_LINK_REQUEST, "toolify:result-link-request");
  assert.ok(generic.includes("window.addEventListener(RESULT_LINK_REQUEST, onRequest)"));
  assert.ok(manual.includes("window.addEventListener(RESULT_LINK_REQUEST, onRequest)"));
  assert.ok(bar.includes("new CustomEvent<ResultLinkRequest>(RESULT_LINK_REQUEST"));
  assert.ok(bar.includes("onClick={copyResultLink}"));
  for (const code of [generic, manual]) {
    assert.ok(!code.includes('url.searchParams.set("s", encoded)'));
    assert.ok(code.includes("clearStaleResultShareState(window.location.href)"));
  }
});

test("restored result fragments survive hydration but not subsequent user edits", () => {
  const oldValue = '{"amount":1}';
  const newValue = '{"amount":50}';
  const initial = classifyRestoredShareChange(null, oldValue, newValue);
  assert.deepEqual(initial, { clearStale: false, nextExpected: newValue });
  const hydrated = classifyRestoredShareChange(oldValue, newValue, initial.nextExpected);
  assert.deepEqual(hydrated, { clearStale: false, nextExpected: null });
  assert.deepEqual(
    classifyRestoredShareChange(newValue, '{"amount":52}', hydrated.nextExpected),
    { clearStale: true, nextExpected: null },
  );
  const hook = source("site/src/lib/hooks/useShareableState.ts");
  assert.ok(hook.includes("restoredExpectedSerialized.current = JSON.stringify(parsed)"));
  assert.ok(hook.includes("classifyRestoredShareChange("));
});

test("empty result links stay hidden across all tool types", () => {
  const bar = source("site/src/components/tools/ShareBar.tsx");
  const generic = source("site/src/lib/hooks/useAutoShareableState.ts");
  const manual = source("site/src/lib/hooks/useShareableState.ts");
  const helper = source("site/src/lib/hooks/result-share-link.ts");
  assert.ok(bar.includes("{canCopyResult && ("));
  assert.ok(bar.includes("new CustomEvent<ResultLinkAvailabilityRequest>"));
  assert.ok(bar.includes("window.addEventListener(RESULT_LINK_CAPABILITY_CHANGED, checkAvailability)"));
  assert.ok(helper.includes("RESULT_LINK_AVAILABILITY_REQUEST"));
  assert.ok(helper.includes("RESULT_LINK_CAPABILITY_CHANGED"));
  assert.ok(generic.includes("Object.keys(current).length === 0"));
  assert.ok(manual.includes("Object.keys(state).length === 0"));
  for (const hook of [generic, manual]) {
    assert.ok(hook.includes("captureEncodedState() !== null"));
    assert.ok(hook.includes("window.addEventListener(RESULT_LINK_AVAILABILITY_REQUEST, onAvailabilityRequest)"));
    assert.ok(hook.includes("window.removeEventListener(RESULT_LINK_AVAILABILITY_REQUEST, onAvailabilityRequest)"));
  }
  assert.ok(generic.includes("availabilityFrame = requestAnimationFrame("));
  assert.ok(generic.includes("if (availabilityFrame !== undefined) return"));
  assert.ok(generic.includes("scheduleAvailability()"));
});

test("all GitHub Actions workflows are manual-only", () => {
  const count = verifyWorkflowPath(join(ROOT, ".github/workflows"));
  assert.ok(count >= 3);
});

test("new guide is noindex and not exposed in sitemap", () => {
  const guide = source("site/src/app/[locale]/workflows/page.tsx");
  const sitemap = source("site/src/app/sitemap.ts");
  assert.match(guide, /noindex:\s*true/);
  assert.ok(!sitemap.includes('"/workflows"') && !sitemap.includes("'/workflows'"));
  assert.match(guide, /getTool\(slug\)/);
});

test("both navigation routes and real-human interaction guards exist", () => {
  const header = source("site/src/components/layout/Header.tsx");
  const menu = source("site/src/components/layout/MobileMenu.tsx");
  const link = source("site/src/components/workflows/WorkflowToolLink.tsx");
  const input = source("site/src/components/tools/ToolInteractionTracker.tsx");
  assert.match(header, /workflowNav=\{workflow\.nav\}/);
  assert.match(menu, /workflowNav:\s*string/);
  assert.doesNotMatch(menu, /workflowCopy/);
  assert.match(link, /nativeEvent\.isTrusted/);
  assert.match(input, /!e\.isTrusted/);
  assert.match(input, /getWorkflowContext/);
});

test("the final workflow step returns to guide without unverified completion claims", () => {
  const source = sourceFile("site/src/components/workflows/WorkflowNextStep.tsx");
  assert.match(source, /if \(!journey\) return null/);
  assert.ok(source.includes("{followUp && ("));
  assert.ok(source.includes("/workflows#"));
  assert.doesNotMatch(source, /completed:/);
});

test("GA4 initialization, pageviews and custom events use sanitized page URLs", () => {
  const init = source("site/src/lib/analytics/gtag.tsx");
  const page = source("site/src/lib/analytics/pageview.tsx");
  const events = source("site/src/lib/analytics/events.ts");
  assert.match(init, /window\.location\.origin \+ window\.location\.pathname/);
  assert.match(page, /createPageViewSender\\(/);
  assert.ok(page.includes("__toolifyGtagReady === true"));
  assert.ok(page.includes('window.addEventListener("toolify:gtag-ready", send)'));
  assert.ok(init.includes("window.__toolifyGtagReady = true"));
  assert.ok(init.includes("window.dispatchEvent(new Event('toolify:gtag-ready'))"));
  assert.ok(source("site/src/lib/analytics/pageview-once.ts")
    .includes("sanitizePageViewUrl(current.href)"));
  assert.doesNotMatch(page, /useSearchParams/);
  assert.match(events, /sanitizePageViewUrl\(window\.location\.href\)/);
  assert.doesNotMatch(page, /page_location:\s*window\.location\.href/);
});

test("affiliate vendor skips direct visits carrying private result share state", () => {
  assert.equal(shouldLoadImpactTracking("https://toolify365.com/en"), true);
  assert.equal(shouldLoadImpactTracking("https://toolify365.com/en/tools/bmi-calculator?wf=data&ws=1"), true);
  for (const href of [
    "https://toolify365.com/ja/tools/bmi-calculator#s=private-data",
    "https://toolify365.com/ja/tools/bmi-calculator?s=legacy",
    "https://toolify365.com/en/tools/bmi-calculator?s=",
    "javascript:alert(1)",
    "not a URL",
  ]) assert.equal(shouldLoadImpactTracking(href), false);

  const vendor = source("site/src/lib/analytics/impact.tsx");
  assert.ok(vendor.includes('"use client"'));
  assert.ok(vendor.includes("setMayLoad(shouldLoadImpactTracking(window.location.href))"));
  assert.ok(vendor.includes("if (!mayLoad) return null"));
});

test("Clarity vendor is disabled by default until exact owner review", () => {
  assert.equal(canLoadClarity("project-id", undefined), false);
  assert.equal(canLoadClarity("project-id", ""), false);
  assert.equal(canLoadClarity("project-id", "true"), false);
  assert.equal(canLoadClarity("", "confirmed"), false);
  assert.equal(canLoadClarity("  ", "confirmed"), false);
  assert.equal(canLoadClarity("project-id", "confirmed"), true);
  const sourceCode = source("site/src/lib/analytics/clarity.tsx");
  assert.ok(sourceCode.includes(
    "canLoadClarity(id, process.env.NEXT_PUBLIC_CLARITY_URL_PRIVACY_APPROVED)"
  ));
});

test("GA4 referrer, Clarity input masking and bootstrap safeguards stay wired", () => {
  const urls = source("site/src/lib/analytics/pageview-url.ts");
  const sender = source("site/src/lib/analytics/pageview-once.ts");
  const page = source("site/src/lib/analytics/pageview.tsx");
  const bootstrap = source("site/src/lib/analytics/gtag.tsx");
  const events = source("site/src/lib/analytics/events.ts");
  const tracker = source("site/src/components/tools/ToolInteractionTracker.tsx");
  const software = source("site/src/components/software/SoftwareWorkbench.tsx");
  assert.ok(urls.includes("export function sanitizePageReferrer("));
  assert.ok(sender.includes("sanitizePageReferrer(current.referrer, current.href)"));
  assert.ok(page.includes("lastSentLocation.current ?? document.referrer"));
  assert.ok(page.includes("lastSentLocation.current = payload.page_location"));
  assert.ok(bootstrap.includes("page_referrer: toolifySafeReferrer"));
  assert.ok(events.includes("page_referrer: sanitizePageReferrer(document.referrer, window.location.href)"));
  assert.ok(tracker.includes('data-clarity-mask="true"'));
  assert.ok(software.includes('data-clarity-mask="true"'));
});

test("postdeployment workflow smoke is opt-in, read-only and locale aware", () => {
  const live = source("site/scripts/check-live-workflows.mjs");
  const helpers = source("site/scripts/growth-html-checks.mjs");
  const scripts = JSON.parse(source("site/package.json")).scripts;
  assert.equal(scripts["audit:live-workflows"],
    "node --experimental-strip-types scripts/check-live-workflows.mjs");
  assert.ok(live.includes('["en", "ja", "ar"]'));
  assert.ok(live.includes("hasWorkflowStepAnchor"));
  assert.ok(live.includes("hasWorkflowGuideAnchor"));
  assert.ok(live.includes("hasNoindex"));
  assert.ok(live.includes("hasSitemapLocation"));
  assert.ok(live.includes("if (errors.length)"));
  assert.ok(helpers.includes("export function hasWorkflowStepAnchor"));
  assert.ok(helpers.includes("export function hasWorkflowGuideAnchor"));
  assert.ok(!live.includes("workflow_dispatch"));
});

test("GA4 history-based pageview duplication blocks release until owner attestation", () => {
  const gate = source("scripts/check-toolify-review-release.sh");
  assert.ok(gate.includes('TOOLIFY_GA4_HISTORY_PAGEVIEWS_DISABLED:-'));
  assert.ok(gate.includes('!= "confirmed"'));
  assert.ok(gate.includes("Enhanced Measurement"));
  assert.ok(gate.includes("DebugView"));
  assert.ok(gate.includes("exit 4"));
  assert.ok(gate.indexOf("TOOLIFY_GA4_HISTORY_PAGEVIEWS_DISABLED")
    < gate.indexOf('bash "$ROOT/scripts/check-postmerge-embed-release.sh"'));
});

test("Clarity URL privacy requires an owner review before release", () => {
  const gate = source("scripts/check-toolify-review-release.sh");
  assert.ok(gate.includes('TOOLIFY_CLARITY_URLS_REVIEWED:-'));
  assert.ok(gate.includes('!= "confirmed"'));
  assert.ok(gate.includes("Clarity may capture ?s="));
  assert.ok(gate.includes("DOM data-clarity-mask protects content, not URLs"));
  assert.ok(gate.includes("exit 5"));
  assert.ok(gate.indexOf("TOOLIFY_GA4_HISTORY_PAGEVIEWS_DISABLED")
    < gate.indexOf("TOOLIFY_CLARITY_URLS_REVIEWED"));
  assert.ok(gate.indexOf("TOOLIFY_CLARITY_URLS_REVIEWED")
    < gate.indexOf('bash "$ROOT/scripts/check-postmerge-embed-release.sh"'));
});

test("manual release gate is locked to reviewed branch and production origin", () => {
  const gate = source("scripts/check-postmerge-embed-release.sh");
  assert.ok(gate.includes("review/toolify-growth-manual-release-20261108"));
  assert.ok(gate.includes('NEXT_PUBLIC_SITE_URL="https://toolify365.com"'));
  assert.match(gate, /verify-manual-deploy.mjs/);
});
